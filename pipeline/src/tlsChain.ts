import { X509Certificate } from 'node:crypto';
import { connect, rootCertificates } from 'node:tls';
import { Agent } from 'undici';

/**
 * Some servers send only their own certificate and leave out the
 * intermediate CA that links it to a trusted root (www.mvp.gov.ba does).
 * Browsers fill the gap by downloading the intermediate from the "CA Issuers"
 * URL in the certificate's Authority Information Access extension; Node
 * doesn't, so the request fails with UNABLE_TO_VERIFY_LEAF_SIGNATURE.
 *
 * This does what browsers do. Verification stays on: the downloaded
 * certificates are only offered as candidates for building the chain, which
 * must still end at a trusted root.
 */

const INCOMPLETE_CHAIN_CODES = new Set(['UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY']);

/** Whether a fetch() error is a certificate chain the server sent incomplete. */
export function isIncompleteChainError(err: unknown): boolean {
  const code = ((err as Error)?.cause as { code?: string } | undefined)?.code;
  return code !== undefined && INCOMPLETE_CHAIN_CODES.has(code);
}

/** "CA Issuers - URI:http://…" lines from an infoAccess string or object. */
function caIssuerUrls(infoAccess: unknown): string[] {
  if (!infoAccess) return [];
  if (typeof infoAccess === 'string') {
    return [...infoAccess.matchAll(/CA Issuers - URI:(\S+)/g)].map((m) => m[1]);
  }
  const urls = (infoAccess as Record<string, string[] | undefined>)['CA Issuers - URI'];
  return Array.isArray(urls) ? urls : [];
}

type Peer = { infoAccess: unknown; issuer: string };

/** The server's leaf certificate, read without trusting it (nothing is sent over the connection). */
function peerCertificate(host: string, port: number): Promise<Peer> {
  return new Promise((resolve, reject) => {
    const socket = connect({ host, port, servername: host, rejectUnauthorized: false, timeout: 15_000 }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      const issuer = Object.entries(cert.issuer ?? {}).map(([k, v]) => `${k}=${v}`).join(', ');
      resolve({ infoAccess: cert.infoAccess, issuer });
    });
    socket.on('timeout', () => socket.destroy(new Error('timed out reading the server certificate')));
    socket.on('error', reject);
  });
}

/**
 * Certificates in a CA Issuers download: DER, PEM, or a PKCS#7 bundle
 * (.p7c), which some CAs publish and Node can't open directly. For PKCS#7,
 * every embedded DER SEQUENCE that parses as a certificate is taken.
 */
export function certificatesIn(body: Buffer): X509Certificate[] {
  try {
    return [new X509Certificate(body)];
  } catch {
    // not a single DER/PEM certificate
  }
  const found: X509Certificate[] = [];
  for (let i = 0; i < body.length - 4; i++) {
    if (body[i] !== 0x30 || body[i + 1] !== 0x82) continue; // SEQUENCE, two-byte length
    const end = i + 4 + body.readUInt16BE(i + 2);
    if (end > body.length) continue;
    try {
      found.push(new X509Certificate(body.subarray(i, end)));
      i = end - 1;
    } catch {
      // not a certificate; keep scanning
    }
  }
  return found;
}

/**
 * Follows CA Issuers links up from the leaf, collecting PEMs, until a
 * self-signed or linkless certificate. Throws with the step that failed.
 */
async function downloadIssuers(peer: Peer): Promise<string[]> {
  let urls = caIssuerUrls(peer.infoAccess);
  if (urls.length === 0) throw new Error(`the server certificate has no CA Issuers URL (issuer: ${peer.issuer})`);
  const pems: string[] = [];
  for (let depth = 0; depth < 4 && urls.length > 0; depth++) {
    const res = await fetch(urls[0], { signal: AbortSignal.timeout(15_000) }).catch((err: unknown) => {
      throw new Error(`GET ${urls[0]}: ${(err as Error).message}`);
    });
    if (!res.ok) throw new Error(`GET ${urls[0]}: HTTP ${res.status}`);
    const certs = certificatesIn(Buffer.from(await res.arrayBuffer()));
    if (certs.length === 0) {
      throw new Error(`no certificate in ${urls[0]} (content-type: ${res.headers.get('content-type') ?? 'none'})`);
    }
    pems.push(...certs.map((c) => c.toString()));
    const top = certs[certs.length - 1];
    if (top.subject === top.issuer) break;
    urls = caIssuerUrls(top.infoAccess);
  }
  return pems;
}

export type ChainFix = { agent?: Agent; reason?: string };

const fixes = new Map<string, Promise<ChainFix>>();

/**
 * An undici Agent that trusts the usual roots and can build the chain with
 * the host's missing intermediates, or the reason none could be fetched.
 * Cached per host for the run. `roots` is for tests.
 */
export function chainCompletingAgent(url: string, roots: readonly string[] = rootCertificates): Promise<ChainFix> {
  const { hostname, port } = new URL(url);
  const build = async (): Promise<ChainFix> => {
    try {
      const issuers = await downloadIssuers(await peerCertificate(hostname, Number(port) || 443));
      return { agent: new Agent({ connect: { ca: [...roots, ...issuers] } }) };
    } catch (err) {
      return { reason: (err as Error).message };
    }
  };
  if (roots !== rootCertificates) return build();
  const key = `${hostname}:${port}`;
  if (!fixes.has(key)) fixes.set(key, build());
  return fixes.get(key)!;
}
