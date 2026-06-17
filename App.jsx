import { useState, useEffect } from "react";

// ---- SAFETEE Brand ----
const C = {
  black: "#0E0E10", ink: "#1A1A1D", red: "#E2001A", redDark: "#B80015",
  line: "#E5E5E8", surface: "#F6F6F7", text: "#1A1A1D", sub: "#6B6B70", white: "#FFFFFF",
};

// ===========================================================================
// SAFETEE-LOGO:  Trag hier die Asset-URL deines Logos aus den Webflow-Assets
// ein (Rechtsklick auf das Bild im Assets-Panel -> Bildadresse kopieren).
// Bleibt das Feld leer, wird automatisch der Text-Schriftzug "SAFETEE"
// angezeigt (kein kaputtes Bildsymbol). Empfohlen: weisse/helle PNG/SVG-Version,
// da der Kopfbereich dunkel ist.
const LOGO_URL = "";
// ===========================================================================

const GEWERKE = [
  "Erd- / Tiefbau", "Hochbau / Rohbau", "Gerüstbau", "Dacharbeiten",
  "Elektroinstallation", "Schweiß- / Heißarbeiten", "Stahlbau / Montage",
  "Windkraft / WEA-Montage", "Abbrucharbeiten", "Maler- / Lackierarbeiten",
  "Garten- / Landschaftsbau", "Sanitär / Heizung / Klima", "Bohr- / Sägearbeiten",
  "Photovoltaik-Montage", "Sonstiges",
];

const SLIDERS = [
  { k: "boden", label: "Bodenbeschaffenheit", lo: "Fest / tragfähig", hi: "Weich / instabil" },
  { k: "witterung", label: "Witterungsexposition", lo: "Geschützt / innen", hi: "Stark exponiert" },
  { k: "hoehe", label: "Arbeitshöhe / Absturz", lo: "Bodennah", hi: "Große Höhe" },
  { k: "verkehr", label: "Verkehr / öffentl. Bereich", lo: "Abgesperrt", hi: "Fließverkehr" },
  { k: "laerm", label: "Lärmbelastung", lo: "Gering", hi: "Sehr hoch" },
  { k: "beleuchtung", label: "Beleuchtung / Sicht", lo: "Optimal", hi: "Schlecht / Nacht" },
  { k: "enge", label: "Platz / Enge (Confined Space)", lo: "Weiträumig", hi: "Beengt / Behälter" },
  { k: "gefahrstoffe", label: "Gefahrstoffe", lo: "Keine", hi: "Hohe Exposition" },
  { k: "energie", label: "Energiequellen (Strom/Druck)", lo: "Spannungsfrei", hi: "Aktiv / Hochenergie" },
  { k: "qualifikation", label: "Qualifikation Team", lo: "Sehr erfahren", hi: "Unerfahren / neu" },
];

const qual = (v) => (v < 25 ? "niedrig" : v < 50 ? "mittel" : v < 75 ? "erhöht" : "hoch");

function riskMeta(n) {
  if (n <= 4) return { label: "Gering", bg: "#1B8A4B", fg: "#fff" };
  if (n <= 9) return { label: "Mittel", bg: "#E6B400", fg: "#1A1A1D" };
  if (n <= 14) return { label: "Hoch", bg: "#E2001A", fg: "#fff" };
  return { label: "Sehr hoch", bg: "#7A0010", fg: "#fff" };
}

// ---- Logo-Komponente: Bild wenn LOGO_URL gesetzt, sonst Wortmarke ----
function Logo({ height = 28, fontSize = 22 }) {
  const [ok, setOk] = useState(Boolean(LOGO_URL));
  if (LOGO_URL && ok) {
    return (
      <img
        src={LOGO_URL}
        alt="SAFETEE"
        onError={() => setOk(false)}
        style={{ height, width: "auto", display: "block" }}
      />
    );
  }
  return (
    <span className="flex items-center" style={{ gap: 0 }}>
      <span style={{ width: fontSize > 18 ? 10 : 8, height: fontSize > 18 ? 28 : 22, background: C.red, display: "inline-block", borderRadius: 1, marginRight: 12 }} />
      <span style={{ fontWeight: 800, letterSpacing: "0.12em", fontSize }}>SAFETEE</span>
      <span style={{ color: C.red, fontWeight: 800, fontSize, marginLeft: -2 }}>.</span>
    </span>
  );
}

// ---- API über serverseitigen Proxy (/api/claude) ----
// Der Key liegt NICHT hier, sondern als Environment-Variable im Vercel-Projekt.
// Die Funktion api/claude.js haengt ihn serverseitig an. So erreicht der Key
// nie den Browser.
async function callClaude(prompt) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "API-Fehler");
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

function sanitizeStrings(s) {
  // ersetzt rohe Zeilenumbrüche/Tabs INNERHALB von Strings durch Leerzeichen
  let out = "", inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) { out += ch; esc = false; continue; }
      if (ch === "\\") { out += ch; esc = true; continue; }
      if (ch === '"') { out += ch; inStr = false; continue; }
      if (ch === "\n" || ch === "\r" || ch === "\t") { out += " "; continue; }
      out += ch;
    } else {
      out += ch;
      if (ch === '"') inStr = true;
    }
  }
  return out;
}

function extractAndParse(text, kind) {
  let t = String(text).replace(/```json/gi, "").replace(/```/g, "");
  const oi = t.indexOf("{"), ai = t.indexOf("[");
  let start = kind === "array" ? ai : kind === "object" ? oi : -1;
  if (start === -1) start = oi === -1 ? ai : ai === -1 ? oi : Math.min(oi, ai);
  if (start === -1) throw new Error("kein JSON gefunden");
  t = t.slice(start);
  // Klammern bilanzieren (string-bewusst), Ende des ersten vollständigen Werts finden
  const stack = []; let inStr = false, esc = false, end = -1;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (inStr) {
      if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") { stack.pop(); if (stack.length === 0) { end = i; break; } }
  }
  let frag = end !== -1 ? t.slice(0, end + 1) : t;
  if (end === -1) { // abgeschnitten: offenen String + Strukturen schließen
    if (inStr) frag += '"';
    frag = frag.replace(/,\s*$/, "").replace(/:\s*$/, ":null").replace(/,\s*$/, "");
    while (stack.length) frag += stack.pop();
  }
  frag = sanitizeStrings(frag).replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(frag);
}

function parseObjLoose(text) { return extractAndParse(text, "object"); }
function parseArrLoose(text) { return extractAndParse(text, "array"); }

const PRINT_CSS = `
@media print {
  @page { size: A4; margin: 12mm; }
  html, body { background: #ffffff !important; }
  [data-noprint] { display: none !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .rams-doc { border: none !important; border-radius: 0 !important; overflow: visible !important; box-shadow: none !important; }
  table { width: 100% !important; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; page-break-inside: avoid; }
}
`;

export default function App() {
  const [form, setForm] = useState({
    firma: "", baustelle: "", gewerk: GEWERKE[0], ersteller: "",
    datum: new Date().toISOString().slice(0, 10), ramsNr: "", beschreibung: "",
  });
  const [sv, setSv] = useState(Object.fromEntries(SLIDERS.map((s) => [s.k, 35])));
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [rams, setRams] = useState(null);

  // Hoehe an das einbettende Webflow-iframe melden (auto-resize)
  useEffect(() => {
    const report = () => {
      const h = document.documentElement.scrollHeight;
      if (window.parent !== window) {
        window.parent.postMessage({ type: "sfty-rams-height", height: h }, "*");
      }
    };
    report();
    const ro = new ResizeObserver(report);
    ro.observe(document.body);
    window.addEventListener("load", report);
    return () => { ro.disconnect(); window.removeEventListener("load", report); };
  }, [rams, loading, error]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSlider = (k, v) => setSv((s) => ({ ...s, [k]: v }));
  const baseline = Math.round(SLIDERS.reduce((a, s) => a + sv[s.k], 0) / SLIDERS.length);

  const loadExample = () => {
    setForm({
      firma: "Mustermann Tiefbau GmbH", baustelle: "WEA-Park Nordheide, Cluster B",
      gewerk: "Erd- / Tiefbau", ersteller: "M. Riegel (HSE)",
      datum: new Date().toISOString().slice(0, 10), ramsNr: "RAMS-2026-014",
      beschreibung:
        "Aushub einer Kabeltrasse (Tiefe 1,4 m, Länge ~120 m) für die Mittelspannungs-Verkabelung zwischen WEA 3 und Übergabestation. Einsatz Kettenbagger 14 t, Verbau bei Tiefen > 1,25 m, manuelle Nacharbeiten in der Grabensohle.",
    });
    setSv({ boden: 70, witterung: 55, hoehe: 20, verkehr: 40, laerm: 45, beleuchtung: 25, enge: 60, gefahrstoffe: 20, energie: 50, qualifikation: 30 });
  };

  function baseContext() {
    const ctx = SLIDERS.map((s) => `- ${s.label}: ${sv[s.k]}/100 (${qual(sv[s.k])}) [${s.lo} ↔ ${s.hi}]`).join("\n");
    return `KONTEXT
Firma: ${form.firma} | Baustelle: ${form.baustelle} | Gewerk: ${form.gewerk}
Arbeiten: ${form.beschreibung}
Baustellenvariablen (0=unkritisch, 100=kritisch), berücksichtige sie bei w/s:
${ctx}`;
  }

  function hazPrompt(part, exclude) {
    return `Du bist erfahrener HSE-Manager/SiGeKo (DE: ArbSchG, BetrSichV, DGUV, TRBS, STOP-Prinzip).
${baseContext()}

Nenne die ${part === 1 ? "4 WICHTIGSTEN" : "3 weiteren, ANDEREN"} Gefährdungen für diese Arbeiten.${exclude ? `\nNICHT erneut behandeln: ${exclude}` : ""}
Skala w=1..5, s=1..5. restW/restS = Restrisiko NACH Maßnahmen. Max. 3 kurze Maßnahmen je Gefährdung (Stichworte).
Antworte AUSSCHLIESSLICH mit einem JSON-ARRAY, ohne Markdown, ohne weiteren Text, OHNE Zeilenumbrüche innerhalb von Werten:
[{"id":"G1","taetigkeit":"kurz","gefaehrdung":"kurz","betroffene":"kurz","w":3,"s":4,"massnahmen":["kurz"],"restW":2,"restS":2}]`;
  }

  async function generate() {
    setError(""); setRams(null);
    if (!form.firma || !form.baustelle || !form.beschreibung) {
      setError("Bitte Firma, Baustelle und Beschreibung der Arbeiten ausfüllen.");
      return;
    }
    setLoading(true);
    try {
      setProgress("Schritt 1/3 – Ablauf & Rahmen…");
      const shellPrompt = `Du bist erfahrener HSE-Manager/SiGeKo (DE: ArbSchG, BetrSichV, DGUV, TRBS).
${baseContext()}

Erstelle den Rahmen des RAMS. Halte alles knapp und präzise (Stichworte/kurze Sätze).
Antworte AUSSCHLIESSLICH mit diesem JSON-Objekt, ohne Markdown, ohne weiteren Text, OHNE Zeilenumbrüche innerhalb von Werten:
{"geltungsbereich":"2-3 Sätze","arbeitsschritte":[{"nr":1,"schritt":"kurz","beschreibung":"1 Satz"}],"psa":["..."],"verantwortlichkeiten":[{"rolle":"...","aufgabe":"kurz"}],"notfall":{"massnahmen":["kurz"],"ersthelfer":"...","sammelstelle":"..."},"gesamtbewertung":"2-3 Sätze","hinweise":["..."]}
Max. 6 Arbeitsschritte.`;
      const shell = parseObjLoose(await callClaude(shellPrompt));

      setProgress("Schritt 2/3 – Gefährdungen (Teil 1)…");
      const haz1 = parseArrLoose(await callClaude(hazPrompt(1, "")));

      setProgress("Schritt 3/3 – Gefährdungen (Teil 2)…");
      const exclude = haz1.map((h) => h.gefaehrdung).filter(Boolean).join("; ");
      let haz2 = [];
      try { haz2 = parseArrLoose(await callClaude(hazPrompt(2, exclude))); } catch (e) { haz2 = []; }

      const gef = [...haz1, ...haz2].map((h, i) => ({ ...h, id: h.id && /^G\d+$/.test(h.id) && [...haz1, ...haz2].filter(x => x.id === h.id).length === 1 ? h.id : "G" + (i + 1) }));
      setRams({ ...shell, gefaehrdungen: gef });
    } catch (e) {
      setError("Generierung fehlgeschlagen. Bitte erneut versuchen oder Beschreibung etwas kürzen. (" + e.message + ")");
    } finally {
      setLoading(false); setProgress("");
    }
  }

  const Label = ({ children }) => (
    <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.sub }}>{children}</label>
  );
  const inputStyle = { border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px 12px", width: "100%", fontSize: 14, color: C.text, outline: "none", background: C.white };

  return (
    <div style={{ background: C.surface, color: C.text, fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif", minHeight: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div data-noprint style={{ background: C.black, color: C.white }} className="px-6 py-5">
        <div className="flex items-center gap-3">
          <Logo height={30} fontSize={22} />
          <span className="ml-auto text-xs uppercase tracking-widest" style={{ color: "#8A8A90" }}>Safe now. Safe tomorrow.</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 14, textTransform: "uppercase", letterSpacing: "0.02em" }}>RAMS-Generator</h1>
        <p style={{ color: "#9A9AA0", fontSize: 13, marginTop: 4 }}>Risk Assessment & Method Statement – baustellenspezifisch, mit Risikobewertung.</p>
      </div>

      <div className="px-6 py-6" style={{ maxWidth: 980, margin: "0 auto" }}>
        {!rams && (
          <>
            <section style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12 }} className="p-5 mb-5">
              <SectionTitle n="1" t="Grunddaten" />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div><Label>Firma *</Label><input style={inputStyle} value={form.firma} onChange={(e) => set("firma", e.target.value)} placeholder="z. B. Mustermann Tiefbau GmbH" /></div>
                <div><Label>Baustelle *</Label><input style={inputStyle} value={form.baustelle} onChange={(e) => set("baustelle", e.target.value)} placeholder="Bezeichnung / Ort" /></div>
                <div><Label>Gewerk</Label>
                  <select style={inputStyle} value={form.gewerk} onChange={(e) => set("gewerk", e.target.value)}>{GEWERKE.map((g) => <option key={g}>{g}</option>)}</select>
                </div>
                <div><Label>Ersteller</Label><input style={inputStyle} value={form.ersteller} onChange={(e) => set("ersteller", e.target.value)} placeholder="Name / Funktion" /></div>
                <div><Label>Datum</Label><input type="date" style={inputStyle} value={form.datum} onChange={(e) => set("datum", e.target.value)} /></div>
                <div><Label>RAMS-Nr.</Label><input style={inputStyle} value={form.ramsNr} onChange={(e) => set("ramsNr", e.target.value)} placeholder="optional" /></div>
              </div>
            </section>

            <section style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12 }} className="p-5 mb-5">
              <SectionTitle n="2" t="Auszuführende Arbeiten" />
              <div className="mt-4">
                <Label>Beschreibung der Tätigkeiten *</Label>
                <textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} value={form.beschreibung}
                  onChange={(e) => set("beschreibung", e.target.value)}
                  placeholder="Was wird gemacht? Verfahren, Maschinen/Geräte, Mengen, Ablauf, Besonderheiten…" />
              </div>
            </section>

            <section style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12 }} className="p-5 mb-5">
              <div className="flex items-center justify-between">
                <SectionTitle n="3" t="Umgebungs- / Baustellenvariablen" />
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wide" style={{ color: C.sub }}>Baseline-Profil</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: baseline < 35 ? "#1B8A4B" : baseline < 60 ? "#E6B400" : C.red }}>{qual(baseline)} ({baseline}/100)</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-5">
                {SLIDERS.map((s) => (
                  <div key={s.k}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: sv[s.k] < 50 ? C.sub : C.red }}>{qual(sv[s.k])}</span>
                    </div>
                    <input type="range" min="0" max="100" value={sv[s.k]} onChange={(e) => setSlider(s.k, +e.target.value)} style={{ width: "100%", accentColor: C.red }} />
                    <div className="flex justify-between" style={{ fontSize: 10.5, color: C.sub }}><span>{s.lo}</span><span>{s.hi}</span></div>
                  </div>
                ))}
              </div>
            </section>

            {error && <div style={{ background: "#FDECEE", border: `1px solid ${C.red}`, color: C.redDark, borderRadius: 8 }} className="p-3 mb-4 text-sm">{error}</div>}

            <div className="flex gap-3 items-center">
              <button onClick={generate} disabled={loading}
                style={{ background: loading ? "#999" : C.red, color: "#fff", border: "none", borderRadius: 8, padding: "13px 24px", fontWeight: 700, fontSize: 15, cursor: loading ? "default" : "pointer", letterSpacing: "0.02em" }}>
                {loading ? "RAMS wird erstellt…" : "RAMS erstellen"}
              </button>
              <button onClick={loadExample} disabled={loading}
                style={{ background: "transparent", color: C.text, border: `1px solid ${C.line}`, borderRadius: 8, padding: "13px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Beispiel laden</button>
              {loading && <span style={{ fontSize: 13, color: C.sub }}>{progress}</span>}
            </div>
            <p style={{ color: C.sub, fontSize: 11.5, marginTop: 12 }}>
              Hinweis: KI-generierter Entwurf. Vor Verwendung durch eine befähigte Person / Fachkraft für Arbeitssicherheit zu prüfen und freizugeben.
            </p>
          </>
        )}

        {rams && <Result rams={rams} form={form} onBack={() => setRams(null)} />}
      </div>
    </div>
  );
}

function SectionTitle({ n, t }) {
  return (
    <div className="flex items-center gap-3">
      <span style={{ background: C.red, color: "#fff", width: 26, height: 26, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>{n}</span>
      <h2 style={{ fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.03em" }}>{t}</h2>
    </div>
  );
}

function Result({ rams, form, onBack }) {
  const g = rams.gefaehrdungen || [];
  const maxRisk = g.reduce((m, x) => Math.max(m, (x.w || 0) * (x.s || 0)), 0);
  const top = riskMeta(maxRisk);

  const copyText = () => {
    let t = `RAMS – ${form.gewerk}\n${form.firma} | ${form.baustelle}\nErsteller: ${form.ersteller} | ${form.datum} | ${form.ramsNr}\n\nGELTUNGSBEREICH\n${rams.geltungsbereich}\n\nARBEITSSCHRITTE\n` +
      (rams.arbeitsschritte || []).map((a) => `${a.nr}. ${a.schritt}: ${a.beschreibung}`).join("\n") +
      `\n\nGEFÄHRDUNGEN\n` + g.map((x) => `[${x.id}] ${x.gefaehrdung} (W${x.w}×S${x.s}=${x.w * x.s}) -> ${(x.massnahmen || []).join("; ")} | Rest: ${(x.restW || 0) * (x.restS || 0)}`).join("\n") +
      `\n\nPSA: ${(rams.psa || []).join(", ")}\n\nGESAMTBEWERTUNG\n${rams.gesamtbewertung}`;
    navigator.clipboard?.writeText(t);
  };

  return (
    <div>
      <div className="flex gap-3 mb-5 items-center" data-noprint>
        <button onClick={onBack} style={{ background: "transparent", border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>← Zurück / Neu</button>
        <button onClick={() => { const p = document.title; document.title = "RAMS_" + (form.baustelle || "Baustelle").replace(/[^\w-]+/g, "_") + "_" + form.datum; window.print(); setTimeout(() => { document.title = p; }, 800); }} style={{ background: C.black, color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Als PDF speichern</button>
        <button onClick={copyText} style={{ background: C.red, color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Text kopieren</button>
      </div>

      <div className="rams-doc" style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: C.black, color: "#fff" }} className="px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <Logo height={22} fontSize={17} />
            <span className="ml-auto text-xs uppercase tracking-widest" style={{ color: "#8A8A90" }}>RAMS</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, textTransform: "uppercase" }}>{form.gewerk}</h2>
          <div className="grid grid-cols-3 gap-2 mt-3" style={{ fontSize: 12.5, color: "#C9C9CE" }}>
            <Meta l="Firma" v={form.firma} /><Meta l="Baustelle" v={form.baustelle} /><Meta l="RAMS-Nr." v={form.ramsNr || "—"} />
            <Meta l="Ersteller" v={form.ersteller || "—"} /><Meta l="Datum" v={form.datum} />
            <div><div style={{ textTransform: "uppercase", fontSize: 10, color: "#8A8A90" }}>Höchstes Risiko</div>
              <span style={{ background: top.bg, color: top.fg, padding: "2px 10px", borderRadius: 20, fontWeight: 700, fontSize: 12 }}>{top.label} ({maxRisk})</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Block t="Geltungsbereich"><p style={{ fontSize: 14, lineHeight: 1.6 }}>{rams.geltungsbereich}</p></Block>

          <Block t="Arbeitsablauf (Method Statement)">
            <ol style={{ fontSize: 14, lineHeight: 1.6 }}>
              {(rams.arbeitsschritte || []).map((a) => (
                <li key={a.nr} className="mb-2 flex gap-3">
                  <span style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 6, minWidth: 26, height: 26, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{a.nr}</span>
                  <span><b>{a.schritt}.</b> {a.beschreibung}</span>
                </li>
              ))}
            </ol>
          </Block>

          <Block t="Gefährdungsbeurteilung & Maßnahmen">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: C.black, color: "#fff" }}>
                    {["ID", "Gefährdung / Tätigkeit", "Betr.", "W", "S", "R", "Maßnahmen (STOP)", "Rest"].map((h) => (
                      <th key={h} style={{ padding: "8px 8px", textAlign: "left", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {g.map((x, i) => {
                    const r = (x.w || 0) * (x.s || 0); const rest = (x.restW || 0) * (x.restS || 0);
                    const m = riskMeta(r); const mr = riskMeta(rest);
                    return (
                      <tr key={x.id || i} style={{ borderBottom: `1px solid ${C.line}`, background: i % 2 ? C.surface : "#fff" }}>
                        <td style={{ padding: "8px", fontWeight: 700 }}>{x.id}</td>
                        <td style={{ padding: "8px" }}><b>{x.gefaehrdung}</b><div style={{ color: C.sub, fontSize: 11.5 }}>{x.taetigkeit}</div></td>
                        <td style={{ padding: "8px", color: C.sub }}>{x.betroffene}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{x.w}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{x.s}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}><span style={{ background: m.bg, color: m.fg, padding: "2px 8px", borderRadius: 20, fontWeight: 800, fontSize: 12 }}>{r}</span></td>
                        <td style={{ padding: "8px" }}>
                          <ul style={{ margin: 0, paddingLeft: 16 }}>{(x.massnahmen || []).map((mm, j) => <li key={j} style={{ marginBottom: 2 }}>{mm}</li>)}</ul>
                        </td>
                        <td style={{ padding: "8px", textAlign: "center" }}><span style={{ background: mr.bg, color: mr.fg, padding: "2px 8px", borderRadius: 20, fontWeight: 700, fontSize: 11 }}>{rest}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4 mt-3" style={{ fontSize: 11, color: C.sub }}>
              <span>W = Eintrittswahrscheinlichkeit (1–5)</span><span>S = Schadensschwere (1–5)</span><span>R = W×S</span>
              <span className="ml-auto flex gap-2">
                {[["Gering", "#1B8A4B"], ["Mittel", "#E6B400"], ["Hoch", "#E2001A"], ["Sehr hoch", "#7A0010"]].map(([l, b]) => (
                  <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: b, borderRadius: 2, display: "inline-block" }} />{l}</span>
                ))}
              </span>
            </div>
          </Block>

          <div className="grid grid-cols-2 gap-6">
            <Block t="Persönliche Schutzausrüstung (PSA)">
              <div className="flex flex-wrap gap-2">
                {(rams.psa || []).map((p, i) => <span key={i} style={{ background: C.surface, border: `1px solid ${C.line}`, padding: "4px 10px", borderRadius: 20, fontSize: 12.5 }}>{p}</span>)}
              </div>
            </Block>
            <Block t="Verantwortlichkeiten">
              <ul style={{ fontSize: 13, lineHeight: 1.6, margin: 0, paddingLeft: 16 }}>
                {(rams.verantwortlichkeiten || []).map((v, i) => <li key={i}><b>{v.rolle}:</b> {v.aufgabe}</li>)}
              </ul>
            </Block>
          </div>

          <Block t="Notfallorganisation">
            <ul style={{ fontSize: 13, lineHeight: 1.6, margin: 0, paddingLeft: 16 }}>
              {(rams.notfall?.massnahmen || []).map((n, i) => <li key={i}>{n}</li>)}
            </ul>
            <div style={{ fontSize: 12.5, color: C.sub, marginTop: 6 }}>
              Ersthelfer: {rams.notfall?.ersthelfer || "—"} · Sammelstelle: {rams.notfall?.sammelstelle || "—"} · Notruf 112
            </div>
          </Block>

          <div style={{ background: C.surface, borderLeft: `4px solid ${C.red}`, borderRadius: 8 }} className="p-4 mt-2">
            <div style={{ fontWeight: 800, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.04em", marginBottom: 4 }}>Gesamtbewertung</div>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>{rams.gesamtbewertung}</p>
            {(rams.hinweise || []).length > 0 && (
              <ul style={{ fontSize: 12.5, color: C.sub, marginTop: 8, paddingLeft: 16 }}>{rams.hinweise.map((h, i) => <li key={i}>{h}</li>)}</ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6" style={{ fontSize: 12 }}>
            {["Erstellt / geprüft (Fachkraft Arbeitssicherheit)", "Freigabe Bauleitung / Unternehmer"].map((l) => (
              <div key={l}><div style={{ borderTop: `1px solid ${C.text}`, paddingTop: 6, marginTop: 40 }}>{l} · Datum · Unterschrift</div></div>
            ))}
          </div>

          <p style={{ color: C.sub, fontSize: 10.5, marginTop: 20, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
            KI-gestützter Entwurf (SAFETEE RAMS-Generator). Kein Ersatz für die fachliche Gefährdungsbeurteilung nach § 5 ArbSchG. Prüfung & Freigabe durch befähigte Person erforderlich. SAFETEE GmbH · Safe now. Safe tomorrow.
          </p>
        </div>
      </div>
    </div>
  );
}

const Meta = ({ l, v }) => (<div><div style={{ textTransform: "uppercase", fontSize: 10, color: "#8A8A90" }}>{l}</div><div style={{ color: "#fff", fontWeight: 600 }}>{v}</div></div>);
const Block = ({ t, children }) => (
  <div className="mb-6">
    <h3 style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8, color: C.text, borderBottom: `2px solid ${C.red}`, paddingBottom: 4, display: "inline-block" }}>{t}</h3>
    {children}
  </div>
);
