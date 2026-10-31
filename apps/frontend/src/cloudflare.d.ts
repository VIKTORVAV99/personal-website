// The bindings this worker reads from cloudflare:workers (see wrangler.jsonc). Declared
// by hand: `wrangler types` emits the full workers runtime as globals, which clash with
// the DOM lib the client code is checked against.
declare module "cloudflare:workers" {
  export const env: {
    BACKEND?: {
      fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
    };
  };
}
