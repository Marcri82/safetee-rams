// Vercel Serverless Function – laeuft auf dem Server, NICHT im Browser.
// Sie haelt den Anthropic-Key (aus der Environment-Variable ANTHROPIC_API_KEY)
// und leitet Anfragen des Frontends an die Claude-API weiter.
// So erreicht der Key nie den Browser des Besuchers.

export default async function handler(req, res) {
  // Nur POST zulassen
  if (req.method !== "POST") {
    res.status(405).json({ error: { message: "Method not allowed" } });
    return;
  }

  // --- Einfacher Origin-Schutz (KEIN echter Missbrauchsschutz, s. README) ---
  // Erlaubt nur Aufrufe von deinen eigenen Domains. Spoofbar, aber hebt die
  // Huerde gegen banale Fremdnutzung deines Proxys.
  const ALLOWED = [];
    // Vercel-Preview-/Produktions-URL ggf. hier ergaenzen, z.B.:
    // "https://safetee-rams.vercel.app",
  ];
  const origin = req.headers.origin || "";
  const referer = req.headers.referer || "";
  const allowed =
    ALLOWED.length === 0 ||
    ALLOWED.some((o) => origin.startsWith(o) || referer.startsWith(o));
  if (!allowed) {
    res.status(403).json({ error: { message: "Forbidden origin" } });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: { message: "ANTHROPIC_API_KEY ist im Vercel-Projekt nicht gesetzt." } });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || "claude-sonnet-4-6",
        max_tokens: body.max_tokens || 1000,
        messages: body.messages || [],
        ...(body.system ? { system: body.system } : {}),
      }),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(500).json({ error: { message: e.message || "Proxy-Fehler" } });
  }
}
