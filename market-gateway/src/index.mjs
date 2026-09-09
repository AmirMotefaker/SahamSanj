const allowedOrigin = "https://amirmotefaker.github.io";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
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

function codalUrl(symbol) {
  const query = new URLSearchParams({
    Audited: "true",
    AuditorRef: "-1",
    Category: "-1",
    Childs: "true",
    CompanyState: "-1",
    CompanyType: "-1",
    Consolidatable: "true",
    IsNotAudited: "false",
    Length: "4",
    LetterType: "-1",
    Mains: "true",
    NotAudited: "true",
    NotConsolidatable: "true",
    PageNumber: "1",
    Publisher: "false",
    Symbol: symbol,
    TracingNo: "-1",
    search: "true",
  });

  return `https://search.codal.ir/api/search/v2/q?${query}`;
}


function normalizeArenaText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeArenaHtml(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'");
}

function arenaCellText(fragment) {
  return decodeArenaHtml(fragment.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function arenaRowCells(rowHtml) {
  const cells = rowHtml.match(/<(?:th|td)\b[^>]*>[\s\S]*?<\/(?:th|td)>/gi) || [];

  return cells.map(arenaCellText).filter(Boolean);
}

function parseArenaHistory(html) {
  const tables = html.match(/<table\b[^>]*>[\s\S]*?<\/table>/gi) || [];
  const datePattern = /^(?:13|14)\d{2}\/\d{1,2}\/\d{1,2}$/;

  for (const table of tables) {
    const rows = (table.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [])
      .map(arenaRowCells)
      .filter((cells) => cells.length > 0);

    const dataRows = rows.filter((cells) => datePattern.test(cells[0] || ""));

    if (dataRows.length === 0) {
      continue;
    }

    const header = rows.find(
      (cells) => !datePattern.test(cells[0] || "") && cells.length >= dataRows[0].length
    );

    return {
      columns:
        header && header.length === dataRows[0].length
          ? header
          : dataRows[0].map((_, index) => `ستون ${index + 1}`),
      rows: dataRows.slice(0, 10),
    };
  }

  return null;
}
function arenaSymbol(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";

  return title
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/[|\-\u2013\u2014]/)[0]
    .trim();
}
function captureArenaValue(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}
const gateway = {
  async fetch(request) {
    const headers = corsHeaders();

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, headers);
    }

    try {
      if (url.pathname === "/market") {
        const upstream = await fetch(marketUrl(), { headers: { Accept: "application/json" } });
        if (!upstream.ok) return json({ error: "Upstream market source unavailable" }, 502, headers);

        return new Response(upstream.body, {
          status: 200,
          headers: {
            ...headers,
            "Content-Type": upstream.headers.get("Content-Type") || "application/json; charset=utf-8",
          },
        });
      }

      if (url.pathname === "/codal") {
        const symbol = (url.searchParams.get("symbol") || "").trim();

        if (!symbol || symbol.length > 30) {
          return json({ error: "A valid symbol is required" }, 400, headers);
        }

        const upstream = await fetch(codalUrl(symbol), {
          headers: { Accept: "application/json, text/plain, */*" },
        });

        if (!upstream.ok) return json({ error: "Codal source unavailable" }, 502, headers);

        return new Response(upstream.body, {
          status: 200,
          headers: {
            ...headers,
            "Content-Type": upstream.headers.get("Content-Type") || "application/json; charset=utf-8",
          },
        });
      }

  
    if (url.pathname === "/traders/symbol") {
      const id = url.searchParams.get("id") || "";

      if (!/^\d{8,24}$/.test(id)) {
        return json({ error: "A valid public profile id is required" }, 400, headers);
      }

      const profileUrl = `https://tradersarena.ir/${id}`;

      try {
        const upstream = await fetch(profileUrl, {
          headers: {
            Accept: "text/html,application/xhtml+xml",
            "Accept-Language": "fa-IR,fa;q=0.9",
          },
        });

        if (!upstream.ok) {
          return json({ error: "Public profile source unavailable" }, 502, headers);
        }

        const html = await upstream.text();
        const text = normalizeArenaText(html);
        const symbol = arenaSymbol(html) || `نماد ${id}`;

        const fields = {
          shareCount: captureArenaValue(
            text,
            /\u062a\u0639\u062f\u0627\u062f\s+\u0633\u0647\u0627\u0645\s+(.+?)\s+\u0627\u0631\u0632\u0634\s+\u0628\u0627\u0632\u0627\u0631/
          ),
          marketValue: captureArenaValue(
            text,
            /\u062a\u0639\u062f\u0627\u062f\s+\u0633\u0647\u0627\u0645\s+.+?\s+\u0627\u0631\u0632\u0634\s+\u0628\u0627\u0632\u0627\u0631\s+(.+?)\s+\u0634\u0646\u0627\u0648\u0631\u06cc/
          ),
          floatPercentage: captureArenaValue(
            text,
            /\u0634\u0646\u0627\u0648\u0631\u06cc\s+(.+?)\s+EPS/
          ),
          eps: captureArenaValue(text, /\bEPS\s+(.+?)\s+P\/E/i),
          pe: captureArenaValue(
            text,
            /\bP\/E\s+(.+?)\s+P\/E\s+\u06af\u0631\u0648\u0647/i
          ),
          groupPe: captureArenaValue(
            text,
            /P\/E\s+\u06af\u0631\u0648\u0647\s+(.+?)\s+P\/S/i
          ),
        };

        if (!fields.shareCount && !fields.marketValue && !fields.eps) {
          return json(
            { error: "Public profile did not include usable static fields" },
            502,
            headers
          );
        }

        return json(
          {
            source: "TradersArena public profile",
            symbol,
            sourceUrl: profileUrl,
            fetchedAt: new Date().toISOString(),
            persistence: "none",
            fields,
          },
          200,
          headers
        );
      } catch {
        return json({ error: "Public profile request failed" }, 502, headers);
      }
    }
    if (url.pathname === "/traders/history") {
      const id = url.searchParams.get("id") || "";

      if (!/^\d{8,24}$/.test(id)) {
        return json({ error: "A valid public profile id is required" }, 400, headers);
      }

      const sourceUrl = `https://tradersarena.ir/${id}/history`;

      try {
        const upstream = await fetch(sourceUrl, {
          headers: {
            Accept: "text/html,application/xhtml+xml",
            "Accept-Language": "fa-IR,fa;q=0.9",
          },
        });

        if (!upstream.ok) {
          return json({ error: "Public history source unavailable" }, 502, headers);
        }

        const history = parseArenaHistory(await upstream.text());

        if (!history || history.rows.length === 0) {
          return json({ error: "No public history rows were found" }, 502, headers);
        }

        return json(
          {
            source: "TradersArena public history",
            sourceUrl,
            fetchedAt: new Date().toISOString(),
            persistence: "none",
            ...history,
          },
          200,
          headers
        );
      } catch {
        return json({ error: "Public history request failed" }, 502, headers);
      }
    }
    return json({ error: "Not found" }, 404, headers);
    } catch {
      return json({ error: "Gateway request failed" }, 502, headers);
    }
  },
};

export default gateway;