import { setGlobalDispatcher, Agent, RetryAgent } from "undici";
import dns from "node:dns";

export default () => ({
  name: "undici-retry",
  hooks: {
    "astro:build:start": () => {
      // Prefer A records over AAAA. WSL2 commonly resolves AAAA records
      // for Cloudflare hosts but has no IPv6 route, causing ENETUNREACH
      // on every other request. ipv4first sidesteps the wasted attempt.
      dns.setDefaultResultOrder("ipv4first");

      const agent = new Agent({
        // Shorter connect timeout so dead routes fail fast and the
        // RetryAgent can pick up a working connection sooner.
        connect: { timeout: 10_000 },
        bodyTimeout: 120_000,
        headersTimeout: 30_000,
        pipelining: 1,
        connections: 6,
      });

      setGlobalDispatcher(
        new RetryAgent(agent, {
          maxRetries: 5,
          minTimeout: 1_000,
          maxTimeout: 60_000,
          timeoutFactor: 2,
          retryAfter: true,
          statusCodes: [408, 429, 500, 502, 503, 504],
          errorCodes: [
            // OS-level
            "ECONNRESET",
            "ECONNREFUSED",
            "ENOTFOUND",
            "ENETDOWN",
            "ENETUNREACH",
            "EHOSTDOWN",
            "EHOSTUNREACH",
            "EPIPE",
            "ETIMEDOUT", // missing previously — caused build crashes when
            // the OS connect() timed out instead of undici's own timeout
            "EAI_AGAIN", // DNS temporary failure
            // Undici-internal
            "UND_ERR_SOCKET",
            "UND_ERR_BODY_TIMEOUT",
            "UND_ERR_HEADERS_TIMEOUT",
            "UND_ERR_CONNECT_TIMEOUT",
          ],
        }),
      );
    },
  },
});
