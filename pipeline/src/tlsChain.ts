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

/** The server's leaf certificate, read without trusting it (nothing is sent over the connection). */
function peerInfoAccess(host: string, port: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const socket = connect({ host, port, servername: host, rejectUnauthorized: false, timeout: 15_000 }, () => {
      const infoAccess = socket.getPeerCertificate().infoAccess;
      socket.end();
      resolve(infoAccess);
    });
    socket.on('timeout', () => socket.destroy(new Error('timed out reading certificate')));
    socket.on('error', reject);
  });
}

/** Follows CA Issuers links up from the leaf, collecting PEMs, until a self-signed or linkless certificate. */
async function downloadIssuers(firstUrls: string[]): Promise<string[]> {
  const pems: string[] = [];
  let urls = firstUrls;
  for (let depth = 0; depth < 4 && urls.length > 0; depth++) {
    const res = await fetch(urls[0], { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) break;
    const cert = new X509Certificate(Buffer.from(await res.arrayBuffer()));
    pems.push(cert.toString());
    if (cert.subject === cert.issuer) break;
    urls = caIssuerUrls(cert.infoAccess);
  }
  return pems;
}

const agents = new Map<string, Promise<Agent | undefined>>();

/**
 * An undici Agent that trusts the usual roots and can build the chain with
 * the host's missing intermediates, or undefined if none could be fetched.
 * Cached per host for the run. `roots` is for tests.
 */
export function chainCompletingAgent(url: string, roots: readonly string[] = rootCertificates): Promise<Agent | undefined> {
  const { hostname, port } = new URL(url);
  const build = async () => {
    try {
      const issuers = await downloadIssuers(caIssuerUrls(await peerInfoAccess(hostname, Number(port) || 443)));
      return issuers.length > 0 ? new Agent({ connect: { ca: [...roots, ...issuers] } }) : undefined;
    } catch {
      return undefined;
    }
  };
  if (roots !== rootCertificates) return build();
  const key = `${hostname}:${port}`;
  if (!agents.has(key)) agents.set(key, build());
  return agents.get(key)!;
}
