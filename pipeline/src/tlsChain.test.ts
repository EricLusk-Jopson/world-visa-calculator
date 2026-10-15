import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer as createHttpServer, type Server } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fetch as undiciFetch } from 'undici';
import { certificatesIn, chainCompletingAgent, isIncompleteChainError } from './tlsChain';

function hasOpenssl(): boolean {
  try {
    execFileSync('openssl', ['version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * A local HTTPS server that, like www.mvp.gov.ba, sends its certificate
 * without the intermediate, which is published at the certificate's
 * CA Issuers URL instead. Certificates are generated per run (no private key
 * is committed).
 */
describe('chainCompletingAgent', { skip: !hasOpenssl() && 'openssl not installed' }, () => {
  let dir: string;
  let aia: Server;
  let https: Server;
  let url: string;
  let rootPem: string;
  let ssl: (...args: string[]) => Buffer;

  before(async () => {
    dir = mkdtempSync(join(tmpdir(), 'tls-chain-'));
    ssl = (...args: string[]) => execFileSync('openssl', args, { cwd: dir, stdio: 'pipe' });
    const write = (name: string, text: string) => writeFileSync(join(dir, name), text);

    aia = createHttpServer((req, res) => {
      if (req.url === '/intermediate.der') res.end(readFileSync(join(dir, 'int.der')));
      else res.writeHead(404).end();
    });
    await new Promise<void>((r) => aia.listen(0, '127.0.0.1', r));
    const aiaPort = (aia.address() as AddressInfo).port;

    ssl('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'root.key', '-out', 'root.pem', '-days', '2',
      '-subj', '/CN=Test Root CA', '-addext', 'basicConstraints=critical,CA:TRUE', '-addext', 'keyUsage=critical,keyCertSign,cRLSign');
    ssl('req', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'int.key', '-out', 'int.csr', '-subj', '/CN=Test Intermediate CA');
    write('int.ext', 'basicConstraints=critical,CA:TRUE,pathlen:0\nkeyUsage=critical,keyCertSign,cRLSign\n');
    ssl('x509', '-req', '-in', 'int.csr', '-CA', 'root.pem', '-CAkey', 'root.key', '-CAcreateserial', '-out', 'int.pem', '-days', '2', '-extfile', 'int.ext');
    ssl('x509', '-in', 'int.pem', '-outform', 'DER', '-out', 'int.der');
    ssl('req', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'leaf.key', '-out', 'leaf.csr', '-subj', '/CN=localhost');
    write('leaf.ext', `subjectAltName=DNS:localhost\nauthorityInfoAccess=caIssuers;URI:http://127.0.0.1:${aiaPort}/intermediate.der\nextendedKeyUsage=serverAuth\n`);
    ssl('x509', '-req', '-in', 'leaf.csr', '-CA', 'int.pem', '-CAkey', 'int.key', '-CAcreateserial', '-out', 'leaf.pem', '-days', '2', '-extfile', 'leaf.ext');
    rootPem = readFileSync(join(dir, 'root.pem'), 'utf-8');

    https = createHttpsServer({ key: readFileSync(join(dir, 'leaf.key')), cert: readFileSync(join(dir, 'leaf.pem')) }, (_req, res) =>
      res.end('ok'),
    );
    await new Promise<void>((r) => https.listen(0, '127.0.0.1', r));
    url = `https://localhost:${(https.address() as AddressInfo).port}/`;
  });

  after(() => {
    https?.close();
    aia?.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('recognizes the incomplete-chain error', async () => {
    const err = await fetch(url).then(
      () => undefined,
      (e: unknown) => e,
    );
    assert.ok(isIncompleteChainError(err), `unexpected error: ${String((err as Error)?.cause)}`);
  });

  it('completes the chain from the CA Issuers URL', async () => {
    const { agent: dispatcher, reason } = await chainCompletingAgent(url, [rootPem]);
    assert.ok(dispatcher, reason);
    const res = await undiciFetch(url, { dispatcher });
    assert.equal(await res.text(), 'ok');
  });

  it('reads certificates from a PKCS#7 bundle', () => {
    ssl('crl2pkcs7', '-nocrl', '-certfile', 'int.pem', '-outform', 'DER', '-out', 'int.p7c');
    const certs = certificatesIn(readFileSync(join(dir, 'int.p7c')));
    assert.deepEqual(certs.map((c) => c.subject), ['CN=Test Intermediate CA']);
  });

  it('says why when the certificate has no CA Issuers URL', async () => {
    ssl('x509', '-req', '-in', 'leaf.csr', '-CA', 'int.pem', '-CAkey', 'int.key', '-CAcreateserial', '-out', 'bare.pem', '-days', '2');
    const bare = createHttpsServer({ key: readFileSync(join(dir, 'leaf.key')), cert: readFileSync(join(dir, 'bare.pem')) });
    await new Promise<void>((r) => bare.listen(0, '127.0.0.1', r));
    try {
      const { agent, reason } = await chainCompletingAgent(`https://localhost:${(bare.address() as AddressInfo).port}/`, [rootPem]);
      assert.equal(agent, undefined);
      assert.match(reason ?? '', /no CA Issuers URL \(issuer: CN=Test Intermediate CA\)/);
    } finally {
      bare.close();
    }
  });

  it('still requires the chain to end at a trusted root', async () => {
    const { agent: dispatcher, reason } = await chainCompletingAgent(url, []);
    assert.ok(dispatcher, reason);
    await assert.rejects(undiciFetch(url, { dispatcher }));
  });
});
