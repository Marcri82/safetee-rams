import { useState, useEffect } from "react";

// ---- SAFETEE Brand ----
const C = {
  black: "#0E0E10", ink: "#1A1A1D", red: "#E2001A", redDark: "#B80015",
  line: "#E5E5E8", surface: "#F6F6F7", text: "#1A1A1D", sub: "#6B6B70", white: "#FFFFFF",
};

// ===========================================================================
// SAFETEE-LOGO. Tausch die URL bei Bedarf (z.B. weisse Version fuer den
// dunklen Header). Leer = Text-Schriftzug "SAFETEE" als Fallback.
const LOGO_URL = "https://cdn.prod.website-files.com/67f3f82248d0ce190ce613d9/6a3283504a754ca52db308b8_01.Logo%20main.png";
// ===========================================================================

// ---- Sprach-Woerterbuch ----
const L = {
  de: {
    subtitle: "Risk Assessment & Method Statement – baustellenspezifisch, mit Risikobewertung.",
    h1: "RAMS-Generator", tagline: "Safe now. Safe tomorrow.",
    s1: "Grunddaten", firma: "Firma", baustelle: "Baustelle", gewerk: "Gewerk", ersteller: "Ersteller", datum: "Datum", ramsNr: "RAMS-Nr.",
    firmaPh: "z. B. Mustermann Tiefbau GmbH", baustellePh: "Bezeichnung / Ort", erstellerPh: "Name / Funktion", ramsNrPh: "optional",
    s2: "Auszuführende Arbeiten", besch: "Beschreibung der Tätigkeiten",
    beschPh: "Was wird gemacht? Verfahren, Maschinen/Geräte, Mengen, Ablauf, Besonderheiten…",
    s3: "Umgebungs- / Baustellenvariablen", baseline: "Baseline-Profil",
    create: "RAMS erstellen", creating: "RAMS wird erstellt…", example: "Beispiel laden",
    reqErr: "Bitte Firma, Baustelle und Beschreibung der Arbeiten ausfüllen.",
    genErr: "Generierung fehlgeschlagen. Bitte erneut versuchen oder Beschreibung etwas kürzen.",
    step1: "Schritt 1/3 – Ablauf & Rahmen…", step2: "Schritt 2/3 – Gefährdungen (Teil 1)…", step3: "Schritt 3/3 – Gefährdungen (Teil 2)…",
    hint: "Hinweis: KI-generierter Entwurf. Vor Verwendung durch eine befähigte Person / Fachkraft für Arbeitssicherheit zu prüfen und freizugeben.",
    back: "← Zurück / Neu", pdf: "Als PDF speichern", copy: "Text kopieren",
    highestRisk: "Höchstes Risiko",
    bScope: "Geltungsbereich", bMethod: "Arbeitsablauf (Method Statement)", bHaz: "Gefährdungsbeurteilung & Maßnahmen",
    bPSA: "Persönliche Schutzausrüstung (PSA)", bResp: "Verantwortlichkeiten", bEmerg: "Notfallorganisation",
    firstAider: "Ersthelfer", assembly: "Sammelstelle", emergencyCall: "Notruf 112", bOverall: "Gesamtbewertung",
    thId: "ID", thHaz: "Gefährdung / Tätigkeit", thAff: "Betr.", thW: "W", thS: "S", thR: "R", thMeas: "Maßnahmen (STOP)", thRest: "Rest",
    legendW: "W = Eintrittswahrscheinlichkeit (1–5)", legendS: "S = Schadensschwere (1–5)", legendR: "R = W×S",
    sig1: "Erstellt / geprüft (Fachkraft Arbeitssicherheit)", sig2: "Freigabe Bauleitung / Unternehmer", sigSuffix: "Datum · Unterschrift",
    footer: "KI-gestützter Entwurf (SAFETEE RAMS-Generator). Kein Ersatz für die fachliche Gefährdungsbeurteilung nach § 5 ArbSchG. Prüfung & Freigabe durch befähigte Person erforderlich. SAFETEE GmbH · Safe now. Safe tomorrow.",
    langNote: "Inhalt wurde auf Deutsch erstellt. Für eine englische Fassung oben auf EN umschalten und neu generieren.",
    risk: { gering: "Gering", mittel: "Mittel", hoch: "Hoch", sehrhoch: "Sehr hoch" },
    qual: { niedrig: "niedrig", mittel: "mittel", erhoeht: "erhöht", hoch: "hoch" },
  },
  en: {
    subtitle: "Risk Assessment & Method Statement – site-specific, with risk rating.",
    h1: "RAMS Generator", tagline: "Safe now. Safe tomorrow.",
    s1: "Basic Data", firma: "Company", baustelle: "Site", gewerk: "Trade", ersteller: "Author", datum: "Date", ramsNr: "RAMS No.",
    firmaPh: "e.g. Mustermann Civil Engineering Ltd.", baustellePh: "Name / location", erstellerPh: "Name / role", ramsNrPh: "optional",
    s2: "Scope of Work", besch: "Description of activities",
    beschPh: "What is being done? Method, machinery/equipment, quantities, sequence, specifics…",
    s3: "Environmental / Site Variables", baseline: "Baseline profile",
    create: "Generate RAMS", creating: "Generating RAMS…", example: "Load example",
    reqErr: "Please fill in company, site and description of work.",
    genErr: "Generation failed. Please try again or shorten the description.",
    step1: "Step 1/3 – Sequence & framework…", step2: "Step 2/3 – Hazards (part 1)…", step3: "Step 3/3 – Hazards (part 2)…",
    hint: "Note: AI-generated draft. To be reviewed and released by a competent person / health & safety specialist before use.",
    back: "← Back / New", pdf: "Save as PDF", copy: "Copy text",
    highestRisk: "Highest risk",
    bScope: "Scope", bMethod: "Work Sequence (Method Statement)", bHaz: "Risk Assessment & Controls",
    bPSA: "Personal Protective Equipment (PPE)", bResp: "Responsibilities", bEmerg: "Emergency Organisation",
    firstAider: "First aider", assembly: "Assembly point", emergencyCall: "Emergency 112", bOverall: "Overall Assessment",
    thId: "ID", thHaz: "Hazard / Activity", thAff: "Aff.", thW: "L", thS: "S", thR: "R", thMeas: "Controls (STOP)", thRest: "Res.",
    legendW: "L = Likelihood (1–5)", legendS: "S = Severity (1–5)", legendR: "R = L×S",
    sig1: "Prepared / checked (H&S specialist)", sig2: "Released by site management / contractor", sigSuffix: "Date · Signature",
    footer: "AI-generated draft (SAFETEE RAMS Generator). Not a substitute for the formal risk assessment under § 5 ArbSchG (German OSH Act). Review & release by a competent person required. SAFETEE GmbH · Safe now. Safe tomorrow.",
    langNote: "Content was generated in English. For a German version, switch to DE above and regenerate.",
    risk: { gering: "Low", mittel: "Medium", hoch: "High", sehrhoch: "Very high" },
    qual: { niedrig: "low", mittel: "medium", erhoeht: "elevated", hoch: "high" },
  },
};

const GEWERKE = [
  { de: "Erd- / Tiefbau", en: "Earthworks / Civil" },
  { de: "Hochbau / Rohbau", en: "Building / Structural shell" },
  { de: "Gerüstbau", en: "Scaffolding" },
  { de: "Dacharbeiten", en: "Roofing" },
  { de: "Elektroinstallation", en: "Electrical installation" },
  { de: "Schweiß- / Heißarbeiten", en: "Welding / Hot work" },
  { de: "Stahlbau / Montage", en: "Steelwork / Assembly" },
  { de: "Windkraft / WEA-Montage", en: "Wind power / WTG assembly" },
  { de: "Abbrucharbeiten", en: "Demolition" },
  { de: "Maler- / Lackierarbeiten", en: "Painting / Coating" },
  { de: "Garten- / Landschaftsbau", en: "Landscaping" },
  { de: "Sanitär / Heizung / Klima", en: "Plumbing / Heating / HVAC" },
  { de: "Bohr- / Sägearbeiten", en: "Drilling / Cutting" },
  { de: "Photovoltaik-Montage", en: "Photovoltaic installation" },
  { de: "Sonstiges", en: "Other" },
];

const SLIDERS = [
  { k: "boden", label: { de: "Bodenbeschaffenheit", en: "Ground conditions" }, lo: { de: "Fest / tragfähig", en: "Firm / load-bearing" }, hi: { de: "Weich / instabil", en: "Soft / unstable" } },
  { k: "witterung", label: { de: "Witterungsexposition", en: "Weather exposure" }, lo: { de: "Geschützt / innen", en: "Sheltered / indoor" }, hi: { de: "Stark exponiert", en: "Highly exposed" } },
  { k: "hoehe", label: { de: "Arbeitshöhe / Absturz", en: "Working height / fall" }, lo: { de: "Bodennah", en: "Near ground" }, hi: { de: "Große Höhe", en: "Great height" } },
  { k: "verkehr", label: { de: "Verkehr / öffentl. Bereich", en: "Traffic / public area" }, lo: { de: "Abgesperrt", en: "Closed off" }, hi: { de: "Fließverkehr", en: "Live traffic" } },
  { k: "laerm", label: { de: "Lärmbelastung", en: "Noise exposure" }, lo: { de: "Gering", en: "Low" }, hi: { de: "Sehr hoch", en: "Very high" } },
  { k: "beleuchtung", label: { de: "Beleuchtung / Sicht", en: "Lighting / visibility" }, lo: { de: "Optimal", en: "Optimal" }, hi: { de: "Schlecht / Nacht", en: "Poor / night" } },
  { k: "enge", label: { de: "Platz / Enge (Confined Space)", en: "Space / confinement (Confined Space)" }, lo: { de: "Weiträumig", en: "Spacious" }, hi: { de: "Beengt / Behälter", en: "Confined / vessel" } },
  { k: "gefahrstoffe", label: { de: "Gefahrstoffe", en: "Hazardous substances" }, lo: { de: "Keine", en: "None" }, hi: { de: "Hohe Exposition", en: "High exposure" } },
  { k: "energie", label: { de: "Energiequellen (Strom/Druck)", en: "Energy sources (electrical/pressure)" }, lo: { de: "Spannungsfrei", en: "De-energised" }, hi: { de: "Aktiv / Hochenergie", en: "Live / high-energy" } },
  { k: "qualifikation", label: { de: "Qualifikation Team", en: "Team qualification" }, lo: { de: "Sehr erfahren", en: "Very experienced" }, hi: { de: "Unerfahren / neu", en: "Inexperienced / new" } },
];

const qual = (v, lang) => {
  const t = L[lang].qual;
  return v < 25 ? t.niedrig : v < 50 ? t.mittel : v < 75 ? t.erhoeht : t.hoch;
};

function riskMeta(n, lang) {
  const t = L[lang].risk;
  if (n <= 4) return { label: t.gering, bg: "#1B8A4B", fg: "#fff" };
  if (n <= 9) return { label: t.mittel, bg: "#E6B400", fg: "#1A1A1D" };
  if (n <= 14) return { label: t.hoch, bg: "#E2001A", fg: "#fff" };
  return { label: t.sehrhoch, bg: "#7A0010", fg: "#fff" };
}

function Logo({ height = 28, fontSize = 22 }) {
  const [ok, setOk] = useState(Boolean(LOGO_URL));
  if (LOGO_URL && ok) {
    return <img src={LOGO_URL} alt="SAFETEE" onError={() => setOk(false)} style={{ height, width: "auto", display: "block" }} />;
  }
  return (
    <span className="flex items-center">
      <span style={{ width: fontSize > 18 ? 10 : 8, height: fontSize > 18 ? 28 : 22, background: C.red, display: "inline-block", borderRadius: 1, marginRight: 12 }} />
      <span style={{ fontWeight: 800, letterSpacing: "0.12em", fontSize }}>SAFETEE</span>
      <span style={{ color: C.red, fontWeight: 800, fontSize, marginLeft: -2 }}>.</span>
    </span>
  );
}

function LangSwitch({ lang, setLang }) {
  return (
    <div data-noprint style={{ display: "inline-flex", border: "1px solid #3A3A40", borderRadius: 8, overflow: "hidden" }}>
      {["de", "en"].map((l) => (
        <button key={l} onClick={() => setLang(l)} style={{
          background: lang === l ? C.red : "transparent", color: "#fff", border: "none",
          padding: "5px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em",
        }}>{l}</button>
      ))}
    </div>
  );
}

// ---- API ueber serverseitigen Proxy (/api/claude) ----
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
  if (end === -1) {
    if (inStr) frag += '"';
    frag = frag.replace(/,\s*$/, "").replace(/:\s*$/, ":null").replace(/,\s*$/, "");
    while (stack.length) frag += stack.pop();
  }
  frag = sanitizeStrings(frag).replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(frag);
}
const parseObjLoose = (text) => extractAndParse(text, "object");
const parseArrLoose = (text) => extractAndParse(text, "array");

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
  const [lang, setLang] = useState("de");
  const t = L[lang];
  const [form, setForm] = useState({
    firma: "", baustelle: "", gewerkIdx: 0, ersteller: "",
    datum: new Date().toISOString().slice(0, 10), ramsNr: "", beschreibung: "",
  });
  const [sv, setSv] = useState(Object.fromEntries(SLIDERS.map((s) => [s.k, 35])));
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [rams, setRams] = useState(null);
  const [ramsLang, setRamsLang] = useState("de");

  useEffect(() => {
    const report = () => {
      const h = document.documentElement.scrollHeight;
      if (window.parent !== window) window.parent.postMessage({ type: "sfty-rams-height", height: h }, "*");
    };
    report();
    const ro = new ResizeObserver(report);
    ro.observe(document.body);
    window.addEventListener("load", report);
    return () => { ro.disconnect(); window.removeEventListener("load", report); };
  }, [rams, loading, error, lang]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSlider = (k, v) => setSv((s) => ({ ...s, [k]: v }));
  const baseline = Math.round(SLIDERS.reduce((a, s) => a + sv[s.k], 0) / SLIDERS.length);

  const loadExample = () => {
    const isEn = lang === "en";
    setForm({
      firma: isEn ? "Mustermann Civil Engineering Ltd." : "Mustermann Tiefbau GmbH",
      baustelle: isEn ? "Wind farm Nordheide, Cluster B" : "WEA-Park Nordheide, Cluster B",
      gewerkIdx: 0, ersteller: isEn ? "M. Riegel (HSE)" : "M. Riegel (HSE)",
      datum: new Date().toISOString().slice(0, 10), ramsNr: "RAMS-2026-014",
      beschreibung: isEn
        ? "Excavation of a cable trench (depth 1.4 m, length ~120 m) for the medium-voltage cabling between WTG 3 and the substation. Use of a 14 t tracked excavator, shoring at depths > 1.25 m, manual finishing work at the trench bottom."
        : "Aushub einer Kabeltrasse (Tiefe 1,4 m, Länge ~120 m) für die Mittelspannungs-Verkabelung zwischen WEA 3 und Übergabestation. Einsatz Kettenbagger 14 t, Verbau bei Tiefen > 1,25 m, manuelle Nacharbeiten in der Grabensohle.",
    });
    setSv({ boden: 70, witterung: 55, hoehe: 20, verkehr: 40, laerm: 45, beleuchtung: 25, enge: 60, gefahrstoffe: 20, energie: 50, qualifikation: 30 });
  };

  function langInstr() {
    return lang === "en"
      ? "IMPORTANT: write ALL text values in ENGLISH. The legal basis stays German (ArbSchG, BetrSichV, DGUV, TRBS). Keep the JSON keys EXACTLY as given (German keys)."
      : "Antworte auf DEUTSCH.";
  }

  function baseContext() {
    const isEn = lang === "en";
    const ctx = SLIDERS.map((s) => `- ${s.label[lang]}: ${sv[s.k]}/100 (${qual(sv[s.k], lang)}) [${s.lo[lang]} ↔ ${s.hi[lang]}]`).join("\n");
    return `${isEn ? "CONTEXT" : "KONTEXT"}
${isEn ? "Company" : "Firma"}: ${form.firma} | ${isEn ? "Site" : "Baustelle"}: ${form.baustelle} | ${isEn ? "Trade" : "Gewerk"}: ${GEWERKE[form.gewerkIdx][lang]}
${isEn ? "Work" : "Arbeiten"}: ${form.beschreibung}
${isEn ? "Site variables (0=uncritical, 100=critical), consider them for w/s:" : "Baustellenvariablen (0=unkritisch, 100=kritisch), berücksichtige sie bei w/s:"}
${ctx}`;
  }

  function hazPrompt(part, exclude) {
    const isEn = lang === "en";
    return `Du bist erfahrener HSE-Manager/SiGeKo (DE: ArbSchG, BetrSichV, DGUV, TRBS, STOP-Prinzip).
${baseContext()}

${isEn
  ? `Name the ${part === 1 ? "4 MOST IMPORTANT" : "3 further, DIFFERENT"} hazards for this work.`
  : `Nenne die ${part === 1 ? "4 WICHTIGSTEN" : "3 weiteren, ANDEREN"} Gefährdungen für diese Arbeiten.`}${exclude ? (isEn ? `\nDo NOT repeat: ${exclude}` : `\nNICHT erneut behandeln: ${exclude}`) : ""}
${isEn ? "Scale w=1..5, s=1..5. restW/restS = residual risk AFTER controls. Max 3 short controls per hazard (keywords)." : "Skala w=1..5, s=1..5. restW/restS = Restrisiko NACH Maßnahmen. Max. 3 kurze Maßnahmen je Gefährdung (Stichworte)."}
${langInstr()}
${isEn ? "Respond ONLY with a JSON ARRAY, no markdown, no extra text, NO line breaks within values:" : "Antworte AUSSCHLIESSLICH mit einem JSON-ARRAY, ohne Markdown, ohne weiteren Text, OHNE Zeilenumbrüche innerhalb von Werten:"}
[{"id":"G1","taetigkeit":"kurz","gefaehrdung":"kurz","betroffene":"kurz","w":3,"s":4,"massnahmen":["kurz"],"restW":2,"restS":2}]`;
  }

  async function generate() {
    setError(""); setRams(null);
    if (!form.firma || !form.baustelle || !form.beschreibung) { setError(t.reqErr); return; }
    const genLang = lang;
    setLoading(true);
    try {
      const isEn = genLang === "en";
      setProgress(t.step1);
      const shellPrompt = `Du bist erfahrener HSE-Manager/SiGeKo (DE: ArbSchG, BetrSichV, DGUV, TRBS).
${baseContext()}

${isEn ? "Create the RAMS framework. Keep everything concise and precise (keywords/short sentences)." : "Erstelle den Rahmen des RAMS. Halte alles knapp und präzise (Stichworte/kurze Sätze)."}
${langInstr()}
${isEn ? "Respond ONLY with this JSON object, no markdown, no extra text, NO line breaks within values:" : "Antworte AUSSCHLIESSLICH mit diesem JSON-Objekt, ohne Markdown, ohne weiteren Text, OHNE Zeilenumbrüche innerhalb von Werten:"}
{"geltungsbereich":"2-3 ${isEn ? "sentences" : "Sätze"}","arbeitsschritte":[{"nr":1,"schritt":"kurz","beschreibung":"1 ${isEn ? "sentence" : "Satz"}"}],"psa":["..."],"verantwortlichkeiten":[{"rolle":"...","aufgabe":"kurz"}],"notfall":{"massnahmen":["kurz"],"ersthelfer":"...","sammelstelle":"..."},"gesamtbewertung":"2-3 ${isEn ? "sentences" : "Sätze"}","hinweise":["..."]}
${isEn ? "Max 6 work steps." : "Max. 6 Arbeitsschritte."}`;
      const shell = parseObjLoose(await callClaude(shellPrompt));

      setProgress(t.step2);
      const haz1 = parseArrLoose(await callClaude(hazPrompt(1, "")));

      setProgress(t.step3);
      const exclude = haz1.map((h) => h.gefaehrdung).filter(Boolean).join("; ");
      let haz2 = [];
      try { haz2 = parseArrLoose(await callClaude(hazPrompt(2, exclude))); } catch (e) { haz2 = []; }

      const gef = [...haz1, ...haz2].map((h, i) => ({ ...h, id: h.id && /^G\d+$/.test(h.id) && [...haz1, ...haz2].filter((x) => x.id === h.id).length === 1 ? h.id : "G" + (i + 1) }));
      setRamsLang(genLang);
      setRams({ ...shell, gefaehrdungen: gef });
    } catch (e) {
      setError(t.genErr + " (" + e.message + ")");
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
          <div className="ml-auto flex items-center gap-4">
            <span className="text-xs uppercase tracking-widest" style={{ color: "#8A8A90" }}>{t.tagline}</span>
            <LangSwitch lang={lang} setLang={setLang} />
          </div>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 14, textTransform: "uppercase", letterSpacing: "0.02em" }}>{t.h1}</h1>
        <p style={{ color: "#9A9AA0", fontSize: 13, marginTop: 4 }}>{t.subtitle}</p>
      </div>

      <div className="px-6 py-6" style={{ maxWidth: 980, margin: "0 auto" }}>
        {!rams && (
          <>
            <section style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12 }} className="p-5 mb-5">
              <SectionTitle n="1" t={t.s1} />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div><Label>{t.firma} *</Label><input style={inputStyle} value={form.firma} onChange={(e) => set("firma", e.target.value)} placeholder={t.firmaPh} /></div>
                <div><Label>{t.baustelle} *</Label><input style={inputStyle} value={form.baustelle} onChange={(e) => set("baustelle", e.target.value)} placeholder={t.baustellePh} /></div>
                <div><Label>{t.gewerk}</Label>
                  <select style={inputStyle} value={form.gewerkIdx} onChange={(e) => set("gewerkIdx", +e.target.value)}>
                    {GEWERKE.map((g, i) => <option key={i} value={i}>{g[lang]}</option>)}
                  </select>
                </div>
                <div><Label>{t.ersteller}</Label><input style={inputStyle} value={form.ersteller} onChange={(e) => set("ersteller", e.target.value)} placeholder={t.erstellerPh} /></div>
                <div><Label>{t.datum}</Label><input type="date" style={inputStyle} value={form.datum} onChange={(e) => set("datum", e.target.value)} /></div>
                <div><Label>{t.ramsNr}</Label><input style={inputStyle} value={form.ramsNr} onChange={(e) => set("ramsNr", e.target.value)} placeholder={t.ramsNrPh} /></div>
              </div>
            </section>

            <section style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12 }} className="p-5 mb-5">
              <SectionTitle n="2" t={t.s2} />
              <div className="mt-4">
                <Label>{t.besch} *</Label>
                <textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} value={form.beschreibung}
                  onChange={(e) => set("beschreibung", e.target.value)} placeholder={t.beschPh} />
              </div>
            </section>

            <section style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12 }} className="p-5 mb-5">
              <div className="flex items-center justify-between">
                <SectionTitle n="3" t={t.s3} />
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wide" style={{ color: C.sub }}>{t.baseline}</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: baseline < 35 ? "#1B8A4B" : baseline < 60 ? "#E6B400" : C.red }}>{qual(baseline, lang)} ({baseline}/100)</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-5">
                {SLIDERS.map((s) => (
                  <div key={s.k}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label[lang]}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: sv[s.k] < 50 ? C.sub : C.red }}>{qual(sv[s.k], lang)}</span>
                    </div>
                    <input type="range" min="0" max="100" value={sv[s.k]} onChange={(e) => setSlider(s.k, +e.target.value)} style={{ width: "100%", accentColor: C.red }} />
                    <div className="flex justify-between" style={{ fontSize: 10.5, color: C.sub }}><span>{s.lo[lang]}</span><span>{s.hi[lang]}</span></div>
                  </div>
                ))}
              </div>
            </section>

            {error && <div style={{ background: "#FDECEE", border: `1px solid ${C.red}`, color: C.redDark, borderRadius: 8 }} className="p-3 mb-4 text-sm">{error}</div>}

            <div className="flex gap-3 items-center">
              <button onClick={generate} disabled={loading}
                style={{ background: loading ? "#999" : C.red, color: "#fff", border: "none", borderRadius: 8, padding: "13px 24px", fontWeight: 700, fontSize: 15, cursor: loading ? "default" : "pointer", letterSpacing: "0.02em" }}>
                {loading ? t.creating : t.create}
              </button>
              <button onClick={loadExample} disabled={loading}
                style={{ background: "transparent", color: C.text, border: `1px solid ${C.line}`, borderRadius: 8, padding: "13px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>{t.example}</button>
              {loading && <span style={{ fontSize: 13, color: C.sub }}>{progress}</span>}
            </div>
            <p style={{ color: C.sub, fontSize: 11.5, marginTop: 12 }}>{t.hint}</p>
          </>
        )}

        {rams && <Result rams={rams} form={form} lang={lang} ramsLang={ramsLang} onBack={() => setRams(null)} />}
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

function Result({ rams, form, lang, ramsLang, onBack }) {
  const t = L[lang];
  const g = rams.gefaehrdungen || [];
  const maxRisk = g.reduce((m, x) => Math.max(m, (x.w || 0) * (x.s || 0)), 0);
  const top = riskMeta(maxRisk, lang);
  const gewerkLabel = GEWERKE[form.gewerkIdx][lang];

  const copyText = () => {
    let out = `RAMS – ${gewerkLabel}\n${form.firma} | ${form.baustelle}\n${t.ersteller}: ${form.ersteller} | ${form.datum} | ${form.ramsNr}\n\n${t.bScope.toUpperCase()}\n${rams.geltungsbereich}\n\n${t.bMethod.toUpperCase()}\n` +
      (rams.arbeitsschritte || []).map((a) => `${a.nr}. ${a.schritt}: ${a.beschreibung}`).join("\n") +
      `\n\n${t.bHaz.toUpperCase()}\n` + g.map((x) => `[${x.id}] ${x.gefaehrdung} (${t.thW}${x.w}×${t.thS}${x.s}=${x.w * x.s}) -> ${(x.massnahmen || []).join("; ")} | ${t.thRest}: ${(x.restW || 0) * (x.restS || 0)}`).join("\n") +
      `\n\n${t.bPSA}: ${(rams.psa || []).join(", ")}\n\n${t.bOverall.toUpperCase()}\n${rams.gesamtbewertung}`;
    navigator.clipboard?.writeText(out);
  };

  return (
    <div>
      <div className="flex gap-3 mb-5 items-center" data-noprint>
        <button onClick={onBack} style={{ background: "transparent", border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>{t.back}</button>
        <button onClick={() => { const p = document.title; document.title = "RAMS_" + (form.baustelle || "Baustelle").replace(/[^\w-]+/g, "_") + "_" + form.datum; window.print(); setTimeout(() => { document.title = p; }, 800); }} style={{ background: C.black, color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>{t.pdf}</button>
        <button onClick={copyText} style={{ background: C.red, color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>{t.copy}</button>
      </div>

      {ramsLang !== lang && (
        <div data-noprint style={{ background: "#FFF8E1", border: "1px solid #E6B400", borderRadius: 8 }} className="p-3 mb-4 text-sm">{t.langNote}</div>
      )}

      <div className="rams-doc" style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: C.black, color: "#fff" }} className="px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <Logo height={22} fontSize={17} />
            <span className="ml-auto text-xs uppercase tracking-widest" style={{ color: "#8A8A90" }}>RAMS</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, textTransform: "uppercase" }}>{gewerkLabel}</h2>
          <div className="grid grid-cols-3 gap-2 mt-3" style={{ fontSize: 12.5, color: "#C9C9CE" }}>
            <Meta l={t.firma} v={form.firma} /><Meta l={t.baustelle} v={form.baustelle} /><Meta l={t.ramsNr} v={form.ramsNr || "—"} />
            <Meta l={t.ersteller} v={form.ersteller || "—"} /><Meta l={t.datum} v={form.datum} />
            <div><div style={{ textTransform: "uppercase", fontSize: 10, color: "#8A8A90" }}>{t.highestRisk}</div>
              <span style={{ background: top.bg, color: top.fg, padding: "2px 10px", borderRadius: 20, fontWeight: 700, fontSize: 12 }}>{top.label} ({maxRisk})</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Block t={t.bScope}><p style={{ fontSize: 14, lineHeight: 1.6 }}>{rams.geltungsbereich}</p></Block>

          <Block t={t.bMethod}>
            <ol style={{ fontSize: 14, lineHeight: 1.6 }}>
              {(rams.arbeitsschritte || []).map((a) => (
                <li key={a.nr} className="mb-2 flex gap-3">
                  <span style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 6, minWidth: 26, height: 26, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{a.nr}</span>
                  <span><b>{a.schritt}.</b> {a.beschreibung}</span>
                </li>
              ))}
            </ol>
          </Block>

          <Block t={t.bHaz}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: C.black, color: "#fff" }}>
                    {[t.thId, t.thHaz, t.thAff, t.thW, t.thS, t.thR, t.thMeas, t.thRest].map((h, i) => (
                      <th key={i} style={{ padding: "8px 8px", textAlign: "left", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {g.map((x, i) => {
                    const r = (x.w || 0) * (x.s || 0); const rest = (x.restW || 0) * (x.restS || 0);
                    const m = riskMeta(r, lang); const mr = riskMeta(rest, lang);
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
              <span>{t.legendW}</span><span>{t.legendS}</span><span>{t.legendR}</span>
              <span className="ml-auto flex gap-2">
                {[[t.risk.gering, "#1B8A4B"], [t.risk.mittel, "#E6B400"], [t.risk.hoch, "#E2001A"], [t.risk.sehrhoch, "#7A0010"]].map(([l, b]) => (
                  <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: b, borderRadius: 2, display: "inline-block" }} />{l}</span>
                ))}
              </span>
            </div>
          </Block>

          <div className="grid grid-cols-2 gap-6">
            <Block t={t.bPSA}>
              <div className="flex flex-wrap gap-2">
                {(rams.psa || []).map((p, i) => <span key={i} style={{ background: C.surface, border: `1px solid ${C.line}`, padding: "4px 10px", borderRadius: 20, fontSize: 12.5 }}>{p}</span>)}
              </div>
            </Block>
            <Block t={t.bResp}>
              <ul style={{ fontSize: 13, lineHeight: 1.6, margin: 0, paddingLeft: 16 }}>
                {(rams.verantwortlichkeiten || []).map((v, i) => <li key={i}><b>{v.rolle}:</b> {v.aufgabe}</li>)}
              </ul>
            </Block>
          </div>

          <Block t={t.bEmerg}>
            <ul style={{ fontSize: 13, lineHeight: 1.6, margin: 0, paddingLeft: 16 }}>
              {(rams.notfall?.massnahmen || []).map((n, i) => <li key={i}>{n}</li>)}
            </ul>
            <div style={{ fontSize: 12.5, color: C.sub, marginTop: 6 }}>
              {t.firstAider}: {rams.notfall?.ersthelfer || "—"} · {t.assembly}: {rams.notfall?.sammelstelle || "—"} · {t.emergencyCall}
            </div>
          </Block>

          <div style={{ background: C.surface, borderLeft: `4px solid ${C.red}`, borderRadius: 8 }} className="p-4 mt-2">
            <div style={{ fontWeight: 800, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.04em", marginBottom: 4 }}>{t.bOverall}</div>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>{rams.gesamtbewertung}</p>
            {(rams.hinweise || []).length > 0 && (
              <ul style={{ fontSize: 12.5, color: C.sub, marginTop: 8, paddingLeft: 16 }}>{rams.hinweise.map((h, i) => <li key={i}>{h}</li>)}</ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6" style={{ fontSize: 12 }}>
            {[t.sig1, t.sig2].map((l) => (
              <div key={l}><div style={{ borderTop: `1px solid ${C.text}`, paddingTop: 6, marginTop: 40 }}>{l} · {t.sigSuffix}</div></div>
            ))}
          </div>

          <p style={{ color: C.sub, fontSize: 10.5, marginTop: 20, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>{t.footer}</p>
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
