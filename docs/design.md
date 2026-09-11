# Summit Sounds

Ein gemeinsames Teamalbum für die Accessibility-Challenge beim Music & AI Hackathon auf der Rudolfshütte. Die Oberfläche ist englisch, funktioniert ohne Registrierung und enthält einen freiwilligen Fragebogen sowie eine Folienansicht.

## Gestaltung

- Hüttenpapier `#f7f7ed`, Tannengrün `#173f35`, Sonnengelb `#f4cb54`, Seegrün `#dbe9df`, Flieder `#e5def0`, Text `#22372d`.
- Bricolage Grotesque für Überschriften und Namen; DM Sans für Fließtext und Bedienelemente. Lokal ausgelieferte Schriftdateien.
- Links eine große Einladung zum Kennenlernen, rechts eine Schallplatte mit Bergmotiv als grafischer Einstieg. Darunter die Profile als persönliche Konzertpässe. Auf schmalen Geräten steht alles untereinander.
- Die Farbe gehört zur jeweiligen Person. Die Fragen und Antworten führen durch die Seite; Dekoration bleibt auf die Schallplatte beschränkt. Keine automatischen Sounds oder Bewegungen.

```text
Wortmarke                 Team / Präsentieren / Mein Steckbrief
Einladung zum Kennenlernen           Schallplatte + Bergmotiv
Challenge und Ort
Unser Team                            Suche / Steckbrief anlegen
Steckbrief       Steckbrief           Steckbrief
```

Prüfung gegen den Entwurf: Das Bergmotiv und die Schallplatte verbinden Veranstaltungsort und Musik. Ein gelber, grüner Entwurf mit breiter Groteskschrift ersetzt die übliche beige Oberfläche mit Serifenschrift und orangefarbenen Akzenten. Die Startansicht zeigt keine erfundenen Teammitglieder.

## Verhalten

Vier frei wechselbare Fragebogenteile. Nur der Name ist Pflicht. Entwürfe bleiben lokal im Browser, veröffentlichte Profile liegen in SQLite. Die Person kann ihr eigenes Profil bearbeiten und löschen. Ein zufälliger Bearbeitungscode ermöglicht einen Gerätewechsel. Fremde Profile sind lesbar, aber ohne Code nicht veränderbar.

Ein optionales gemeinsames Team-Passwort schützt alle Profildaten. Ohne Passwort kann jeder mit dem Link mitmachen. Eine Containerinstanz, SQLite mit WAL und ein persistentes Volume. Kein externer Datenbankdienst.

Präsentation als Teamübersicht oder einzelne Profile, mit Pfeiltasten und Vollbild. Druckansicht mit einer Person pro Seite. Lange Antworten bleiben in der Detailansicht vollständig lesbar.
