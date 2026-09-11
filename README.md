# Summit Sounds

Ein gemeinsames Teamalbum für die Challenge **Accessibility & Music** beim [Music & AI Hackathon](https://music-ai-hackathon.com/) auf der Rudolfshütte. Gebaut mit Next.js 16, React 19, TypeScript, Tailwind CSS 4 und shadcn/ui mit Radix.

## Was die Seite kann

- Steckbrief mit Namen, neun Farben, zwölf Symbolen und 19 freiwilligen Fragen zu Person, Musik, Accessibility, AI und Hackathon-Erlebnissen.
- Gemeinsame Teamansicht, Suche über Namen und Antworten, ausführliche Detailansichten. Die Liste aktualisiert sich alle 15 Sekunden und beim Zurückkehren zum Browserfenster.
- Eigene Profile bearbeiten und löschen. Der persönliche Bearbeitungscode ermöglicht einen Gerätewechsel.
- Lokale Entwürfe bleiben bei einer Unterbrechung erhalten. Erst „Veröffentlichen“ überträgt die Antworten ins gemeinsame Album.
- Präsentation mit Teamübersicht, einzelnen Folien, Pfeiltasten und Vollbild. PDF-Export über das Drucksymbol. Die Folien zeigen ausgewählte Antworten, längere Texte werden dort gekürzt. Die Detailansicht enthält die vollständigen Antworten.
- Optionales Team-Passwort, tastaturbedienbare Dialoge, sichtbarer Fokus, reduzierte Bewegung und mobile Layouts.

Es gibt keine erfundenen Profile in der Anwendung. Testdaten werden ausschließlich in einer separaten Testdatenbank erzeugt.

## Lokal starten

Benötigt Node.js 24 oder neuer und npm.

```sh
npm ci
npm run dev
```

Öffne [localhost:3000](http://localhost:3000). Die Datenbank entsteht beim ersten Zugriff unter `data/huettentoene.sqlite`.

Optional `.env.example` nach `.env.local` kopieren und `TEAM_PASSWORD` setzen. Ohne Passwort kann jede Person mit dem Link Profile lesen und einen eigenen Steckbrief erstellen.

Produktionsbuild und der gleiche Server wie im Docker-Image:

```sh
npm run build
npm run start:standalone
```

`start:standalone` kopiert die statischen Dateien in den Build. Beim direkten Standalone-Start sind Umgebungsvariablen im Prozess zu setzen; `.env.local` wird dort nicht mitkopiert. Ohne `DATABASE_PATH` verwendet dieser Server `.next/standalone/data/huettentoene.sqlite`. Für dauerhafte Daten einen absoluten Pfad außerhalb des Build-Verzeichnisses setzen.

## Auf Coolify deployen

1. Das Repository zu deinem Git-Anbieter pushen und in Coolify eine neue Anwendung mit diesem Repository anlegen.
2. Als Build Pack **Docker Compose** wählen. Compose-Datei: `/compose.yaml`, Basisverzeichnis: `/`.
3. Dem Service `huettentoene` eine Domain mit **internem Port 3000** zuweisen. Beispielsweise `https://team.example.org:3000`, wenn Coolify den Zielport im Domainfeld erwartet. HTTPS in Coolify aktivieren.
4. Optional `TEAM_PASSWORD` als Laufzeitvariable setzen. Ein leeres Passwort bedeutet freien Zugang für alle mit dem Link.
5. Deployen. `/api/health` prüft den Server und die Datenbank. Das Volume `team-data` speichert die Profile unter `/app/data` und bleibt bei normalen Redeployments erhalten.

Die Compose-Datei veröffentlicht keinen festen Host-Port; Coolifys Proxy erreicht den internen Port. Das Containerimage startet als unprivilegierter Benutzer `node`. Das Datenverzeichnis gehört diesem Benutzer bereits im Image, und ein neu erstelltes benanntes Volume übernimmt diese Rechte.

Nur **eine Instanz** betreiben. Die Anwendung verwendet die in Node.js enthaltene SQLite-Datenbank mit WAL und benötigt keinen separaten Datenbankcontainer. Für mehrere Replikas müsste die Speicherung auf eine gemeinsam erreichbare Datenbank umgestellt werden. Ein bereits bestehendes oder manuell eingebundenes Datenverzeichnis muss für UID/GID 1000 beschreibbar sein.

Für Docker Compose ohne Coolify gibt es eine Ergänzung mit Host-Port:

```sh
docker compose -f compose.yaml -f compose.local.yaml up --build -d
```

Dann `http://localhost:3000` öffnen. `APP_PORT` kann den Host-Port ändern. Für diese Variante liest Compose eine `.env`-Datei im Projektverzeichnis; `.env.local` ist für Next.js-Entwicklung gedacht.

## Daten und Bearbeitungsrechte

Ein zufälliger Bearbeitungscode mit 256 Bit wird beim Anlegen erzeugt. Der Browser speichert ihn in einem HttpOnly-Cookie für ein Jahr. SQLite speichert nur seinen SHA-256-Hash. Andere Teammitglieder erhalten weder den Code noch den Hash. Auf einem neuen Gerät führt „Schon einen Steckbrief?“ zur Codeeingabe.

Wer den Code kennt, kann den zugehörigen Steckbrief ändern oder löschen. Vor dem Abmelden den Code aufbewahren. Ohne Browser-Cookie oder Code gibt es bewusst keinen automatischen Wiederherstellungsweg über den Namen.

Ein Team-Passwort schützt das Lesen, Anlegen, Ändern, Löschen und Wiederherstellen von Profilen. Eine Änderung des Passworts macht bestehende Teamsitzungen ungültig. Persönliche Bearbeitungscodes bleiben gültig, benötigen aber anschließend ebenfalls den Zugang über das neue Team-Passwort.

Alle Eingaben werden auf dem Server validiert. Fremde Änderungen werden abgewiesen; eine Versionsprüfung verhindert, dass ein veralteter Tab neuere Änderungen überschreibt. Mutationen prüfen den Ursprung. Login und Neuanlagen sind pro IP begrenzt. Coolify muss die vom Proxy gesetzten Forwarded-Header liefern und eingehende gleichnamige Header überschreiben.

Das Volumen nicht mit `docker compose down -v` löschen, wenn die Profile erhalten bleiben sollen. Für ein konsistentes Backup den Service kurz stoppen und das komplette Volume sichern. Bei laufendem SQLite die Datenbank nicht ohne ihre WAL-Dateien kopieren. Alternativ die SQLite-Backup-Funktion verwenden.

## Prüfen

```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Die Browser- und API-Tests starten zwei Standalone-Produktionsserver auf Port 3100 und 3101, einmal offen und einmal mit Team-Passwort. Beide verwenden neue Datenbanken im temporären Systemverzeichnis und berühren die lokalen Teamdaten nicht. Getestet werden Eingabevalidierung, gemeinsame Daten, fremde Schreibzugriffe, gleichzeitige Änderungen, Code-Wiederherstellung, Passwortschutz, Formularentwürfe, Suche, Bearbeiten, Löschen, mobile Darstellung, PDF-Seitenzahl und automatisierte Accessibility-Prüfungen mit axe.

Screenshots und ein Beispiel-PDF des Testteams liegen nach dem Test unter `test-results/`. Ein automatisierter Accessibility-Test ersetzt keine Prüfung mit betroffenen Nutzer:innen.

Docker ist in der Entwicklungsumgebung nicht installiert. Der tatsächliche Containerbuild und der Coolify-Deploy müssen deshalb auf einem Docker-Host erfolgen; die automatisierten Tests verwenden den Standalone-Server, den auch das Image startet.

## Orientierung im Code

| Datei | Aufgabe |
| --- | --- |
| `src/lib/profile.ts` | Fragen, Profiltypen und Validierung |
| `src/lib/server/store.ts` | SQLite und Eigentumsprüfung |
| `src/lib/server/http.ts` | Teamzugang, Cookies, Ursprung, Limits und Fehler |
| `src/app/api/` | HTTP-Endpunkte |
| `src/components/team-album.tsx` | Teamansicht und Aktualisierung |
| `src/components/profile-editor.tsx` | Fragebogen und Entwürfe |
| `src/components/presentation.tsx` | Folien und Druckansicht |
| `src/app/globals.css` | Design, responsive Darstellung und Drucklayout |

Die 14 persönlich installierten Skills und ihre Quellen sind in [docs/skills.md](docs/skills.md) aufgelistet. Die gestalterischen Entscheidungen stehen in [docs/design.md](docs/design.md).
