const allowedOrigin = "https://amirmotefaker.github.io";

function corsHeaders(request) {
  const origin = request.headers.get("Origin");

  return {
    "Access-Control-Allow-Origin": origin === allowedOrigin ? allowedOrigin : allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

function marketUrl() {
  const query = new URLSearchParams({
    market: "0",
    withBestLimits: "false",
    hEven: "0",
    RefID: "0",
  });

  for (let index = 0; index < 9; index += 1) {
    query.set(`paperTypes[${index}]`, String(index + 1));
  }

  return `https://cdn.tsetmc.com/api/ClosingPrice/GetMarketWatch?${query}`;
}

export default {
  async fetch(request) {
    const headers = corsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);

    if (request.method !== "GET" || url.pathname !== "/market") {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
      });
    }

    try {
      const upstream = await fetch(marketUrl(), {
        headers: { Accept: "application/json" },
      });

      if (!upstream.ok) {
        return new Response(JSON.stringify({ error: "Upstream market source unavailable" }), {
          status: 502,
          headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
        });
      }

      return new Response(upstream.body, {
        status: 200,
        headers: {
          ...headers,
          "Content-Type": upstream.headers.get("Content-Type") || "application/json; charset=utf-8",
        },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Market gateway request failed" }), {
        status: 502,
        headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
      });
    }
  },
};