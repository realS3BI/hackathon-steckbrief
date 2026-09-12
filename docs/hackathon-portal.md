# Hackathon portal

The site collects hackathons by year. Each event has a landing page that explains its purpose and leads to its projects and team. Interface text stays in English.

## Design plan

Treat the homepage as a shelf of event notebooks. Use large, left-aligned Bricolage Grotesque headings and DM Sans for readable descriptions. A violet folder illustration introduces the archive; the Music & AI notebook keeps the existing mountain, record, and warm green identity.

Archive palette: cool paper `#f4f3f9`, ink `#292636`, violet `#62508b`, lilac `#e7dff1`, pine `#173f35`, and sun `#f4cb54`. Interactive elements use semantic theme tokens. Dark mode has its own background and foreground pairs. All fonts remain local.

```text
hackathon notes.                          All events / 2026 / Theme
Made together. Collected here.           A folder of music notes
Browse the hackathons

Hackathons                               Browse by year
Illustrated event cover | Name, location, focus, open event

/2026: a year cover and the actual events from that year
/2026/music-ai: music cover, challenge, projects, team
```

Review before implementation: a generic grid of invented events would misrepresent this collection. Start with the known Music & AI event and render the directory from a small registry. Reserve the visual emphasis for its illustrated cover, with quiet navigation and clear links. No fake attendees, activity feeds, upcoming events, or disabled placeholder cards. The year page gives the archive a distinct cover; the event page explains what a visitor can actually do.

## Routes

- `/`: all configured hackathons.
- `/2026`: hackathons from 2026.
- `/2026/music-ai`: the Music & AI landing page.
- `/2026/music-ai/knowledge-and-create`: the playable music learning prototype.
- `/2026/music-ai/profile`: the existing team album.

The physical page folders follow the same structure under `src/app`. The old `/music-ai-2026` path and its descendants permanently redirect to their counterparts under `/2026/music-ai`. The old `profile.schlossers.at` hostname redirects straight to the new profile page. Existing cached redirects therefore still reach the right destination.

Breadcrumbs connect the tools to the event, year, and main archive. The team album stays a direct child of the root layout so its presentation print sheets continue to work.

## Adding an event

Add its real title, year, description, location, tags, and resource links to `src/lib/hackathons.ts`. Add `src/app/<year>/<slug>/page.tsx` using the shared `HackathonLanding` component. For a new year, add `src/app/<year>/page.tsx` using `YearLanding`. The directory and year links update from the registry. Add the event's tools beneath its own folder.

The registry controls navigation and copy; page files control routing. Adding a registry entry alone does not publish a working event route. Do not add an event until its landing page exists.

## Deployment

Keep the same Coolify application, container port 3000, domain entries, and persistent profile volume. Leave the Coolify Path field empty. Route changes do not require DNS or environment-variable changes. Existing API routes remain under `/api`.
