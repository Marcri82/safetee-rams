# SAFETEE · RAMS-Generator

KI-gestützter RAMS-Generator (Risk Assessment & Method Statement) im SAFETEE-Design.
Zum Hosten auf Vercel und Einbetten in Webflow unter `safetee.eu/Tools/rams`.

---

## Wichtig vorab – der Unterschied zur Claude-Sandbox

In der Claude-Artifact-Umgebung läuft das Tool **ohne** API-Key, weil Anthropic
den Key dort unsichtbar einsetzt. **Auf Vercel gibt es das nicht.** Deshalb hat
dieses Projekt eine kleine Backend-Funktion (`api/claude.js`), die den Key
serverseitig hält. Der Browser des Besuchers ruft nur `/api/claude` auf – er
sieht den Key **nie**.

Du musst den Key also **als Environment-Variable im Vercel-Projekt** hinterlegen
(siehe Schritt 4). Der *Wert* deines bestehenden Keys ist wiederverwendbar –
aber er „liegt" nicht automatisch hier, nur weil LMRA ihn nutzt. Env-Variablen
gelten immer pro Vercel-Projekt.

---

## Was ist drin

```
safetee-rams/
├─ api/
│  └─ claude.js        ← Backend-Proxy (hält den Key, ruft Anthropic)
├─ src/
│  ├─ App.jsx          ← das RAMS-Tool (Logo + Formular + Ergebnis)
│  └─ main.jsx         ← React-Einstiegspunkt
├─ index.html
├─ package.json
├─ vite.config.js
├─ vercel.json
└─ webflow-embed-rams.html   ← Code-Embed für die Webflow-Seite
```

---

## Schritt 1 – Logo eintragen (optional, aber gewünscht)

1. In Webflow das **Assets-Panel** öffnen, dein SAFETEE-Logo anklicken,
   **Bildadresse / Asset-URL kopieren**. Empfohlen: helle/weiße PNG- oder
   SVG-Version (der Kopfbereich ist dunkel).
2. In `src/App.jsx` die Zeile suchen:
   ```js
   const LOGO_URL = "";
   ```
   und die URL zwischen die Anführungszeichen setzen, z. B.:
   ```js
   const LOGO_URL = "https://cdn.prod.website-files.com/.../safetee-logo.svg";
   ```
3. Bleibt das Feld leer oder lädt das Bild nicht, zeigt das Tool automatisch den
   Text-Schriftzug **SAFETEE** (kein kaputtes Bildsymbol). Du kannst also auch
   erst live gehen und das Logo später nachtragen.

---

## Schritt 2 – Code zu GitHub

**Variante A – ohne Terminal (Browser):**
1. Auf github.com → **New repository** → Name z. B. `safetee-rams` → **Create**.
2. Auf der leeren Repo-Seite: **uploading an existing file**.
3. Den **kompletten Inhalt** dieses Ordners hochladen
   (NICHT den Ordner `node_modules` – falls vorhanden, weglassen).
4. **Commit changes**.

**Variante B – mit Terminal:**
```bash
cd safetee-rams
git init
git add .
git commit -m "RAMS-Generator initial"
git branch -M main
git remote add origin https://github.com/DEIN-NAME/safetee-rams.git
git push -u origin main
```

---

## Schritt 3 – Vercel verbinden

1. Auf vercel.com → **Add New… → Project**.
2. Das GitHub-Repo `safetee-rams` auswählen → **Import**.
3. Framework wird als **Vite** erkannt (Build `vite build`, Output `dist`) –
   so übernehmen.
4. **Noch nicht** auf Deploy – erst die Env-Variable (Schritt 4). Oder deployen,
   dann Variable setzen und **Redeploy**.

---

## Schritt 4 – API-Key als Environment-Variable (der entscheidende Schritt)

1. Im Vercel-Projekt → **Settings → Environment Variables**.
2. Neue Variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** dein Anthropic-Key (`sk-ant-...`) – derselbe Wert, den du bei
     LMRA verwendest.
   - **Environments:** Production (+ Preview, wenn du Vorschauen testen willst).
3. **Save**.
4. **Wichtig:** Env-Variablen greifen erst nach einem **Redeploy**.
   → Tab **Deployments** → neuestes Deployment → **… → Redeploy**.

> Test: Vercel gibt dir eine URL wie `https://safetee-rams.vercel.app`.
> Dort das Formular ausfüllen → „RAMS erstellen". Kommt ein Ergebnis, läuft der
> Proxy. Fehler „ANTHROPIC_API_KEY ist nicht gesetzt" = Schritt 4 noch nicht
> (oder Redeploy fehlt).

---

## Schritt 5 – In Webflow einbetten (`safetee.eu/Tools/rams`)

1. In Vercel die Produktions-URL kopieren (z. B. `https://safetee-rams.vercel.app`).
2. In `webflow-embed-rams.html` die Zeile `const RAMS_URL = "..."` auf genau
   diese URL setzen.
3. In Webflow auf der Seite `/Tools/rams` ein **Embed-Element** (Code-Embed)
   platzieren und den Inhalt von `webflow-embed-rams.html` einfügen.
4. Seite **publishen**.

Das Tool wird per **iframe** geladen (wie bei deiner LMRA-Einbettung). Der iframe
passt seine Höhe automatisch an den Inhalt an.

> Wenn du in `api/claude.js` den Origin-Schutz aktiv lässt, trage dort deine
> Vercel-URL bei `ALLOWED` ein – sonst blockt der Proxy den iframe-Aufruf,
> falls er von der Vercel-Domain statt von safetee.eu kommt.

---

## Offener Punkt, den du kennen musst (ehrlich)

Der Proxy ist **öffentlich erreichbar**. Jeder, der die `/api/claude`-URL kennt,
kann theoretisch Aufrufe auf **deine Anthropic-Rechnung** auslösen. Der
eingebaute Origin-Check ist ein **schwacher** Schutz (Header sind fälschbar),
keine echte Absicherung.

Für den Start meist ausreichend, weil das Tool kostenarm pro Aufruf ist. Wenn es
breiter sichtbar wird, ist der nächste sinnvolle Schritt eines davon:
- ein **Rate-Limit** (z. B. Vercel KV / Upstash, X Anfragen pro IP/Stunde),
- ein **einfaches Captcha** vor dem Generieren,
- oder ein **Ausgabe-Budget-Alarm** im Anthropic-Dashboard.

Sag Bescheid, wenn du diesen Schutz einbauen willst – das ist ein eigener,
überschaubarer Baustein.
