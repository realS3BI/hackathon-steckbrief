# Knowledge & Create

A concept and playable prototype for Challenge 6, Accessibility & Music, at the Music & AI Hackathon 2026.

## The idea

Help someone make a first piece of music without having to write a prompt, read notation, or operate a music workstation. A small knowledge base connects each explanation to a choice in the creator. Learning is available whenever it helps, and can be skipped. The same interface welcomes children, older adults, and people with disabilities without asking them to disclose their age or a diagnosis.

## Design before implementation

Extend Summit Sounds with a music workbook. Use the existing Bricolage Grotesque for warm, clear headings and DM Sans for instructions and controls. Keep text left aligned and instructions short. One memorable element is a score made of large colored note shapes. Its labels also describe the music without relying on color or sound.

The existing theme provides paper `#f7f7ed`, ink `#22372d`, pine `#173f35`, sun `#f4cb54`, lake `#d6e8e9`, and lilac `#e7dff1`. Use semantic background, foreground, card, and primary tokens for controls so the system theme and dark mode retain contrast. The score uses the album's existing paired color tokens.

```text
Brand                             Learn & create | Team | Theme
Make room for your music.          Colored, labeled musical score
One short invitation               No audio starts automatically

[ Learn a little ] [ Create music ]
Topic list          Explanation, two sound examples, use this choice
                    or
Mood / pace / sound / beat         Your current choices
                                  Create, listen, download
```

On a phone, the topic list wraps above its content and the song preview follows the choices. No horizontally scrolling controls or drag-only editing. Review against the brief: a dashboard with identical statistic cards would distract from the first musical action. The score and a short illustrated lesson carry the visual identity; there are no counters, fake community activity, or age-based modes.

## A first visit

1. Read or listen to a short explanation of rhythm, tempo, melody, sound, or mood.
2. Compare two examples, with a text description for each. Choose an example to carry into the creator.
3. Choose a mood, speed, instrument sound, and whether to include a beat. Every group already has a selection. Typing is optional.
4. Create an instrumental sketch, press Play when ready, and download a WAV file. Change one choice or create another variation.

The learning content stays available after creating. Read-aloud and bigger text are optional. Keyboard users can use standard Tab navigation and arrow keys inside choice groups. Touch users get large controls with labels. The audio player includes play, pause, seeking, and volume. A visual score and written description accompany the piece.

## Answering the three challenge questions

### How can AI help people with disabilities create and perform music?

The proposed AI layer translates explicit choices into a musical arrangement. Someone can choose a mood and pace instead of producing a detailed text prompt or playing an instrument. Preserve those choices when creating variations so the person remains the author. Offer spoken explanations for people who need them and a visual score with descriptive text for people who cannot hear the preview. These alternatives need testing with their intended users; a visual score alone does not make the whole experience accessible to everyone.

In this prototype, a local procedural composer demonstrates that interaction and produces real instrumental audio. It is not a trained AI model and does not generate vocals. A production version would send the validated choices and optional creative brief to a licensed music-generation provider from a server endpoint. That endpoint needs authentication or usage limits, job status, cancellation, failures, and a retention policy. Keep API keys on the server. Select the provider and check its terms, age requirements, costs, and output rights before integration. No provider, API key, paid requests, or invented AI results are included here.

### How can interfaces and other forms of interaction lower barriers?

Start with semantic buttons, labeled choices, visible focus, large targets, and no timed steps. These controls can be operated by touch, keyboard, and assistive tools that emulate those inputs. Optional browser read-aloud only starts on request. Users can keep the screen still and enlarge text. System appearance is the default.

Later experiments can map a large switch to next/select and a gesture or ChordCat action to a musical choice. Voice commands are another possible route. None is a prerequisite for the prototype, and no hardware or microphone integration is claimed. Test each with the person who will use it, including a way to stop sound immediately.

### How can beginners and older adults start quickly and enjoyably?

Use short explanations with immediate examples instead of a theory course. Every lesson offers a direct next action. Give useful defaults, allow skipping lessons, avoid time limits and scores, and keep creation reversible. The first success is an audible, downloadable piece. Users can then explore one musical idea at a time.

## Accessibility and validation

Use WCAG 2.2 as a design reference, not a claim of certification. Relevant guidance includes [larger pointer targets](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), [control over audio](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html), and [accessibility for older users](https://www.w3.org/WAI/older-users/). Automated checks cover only part of accessibility.

Before a public launch, invite children with an appropriate adult, older beginners, and people with different access needs to try the same task: make, change, and save a piece. Observe where they need help. Test real screen readers, switch access, 200–400% zoom, touch, hearing alternatives, and reduced motion. Do not ask participants to disclose medical information. Record task completion and the points of confusion with their consent.

## Routes and data

- `/2026/music-ai/knowledge-and-create` is public and has no account requirement.
- `/2026/music-ai/profile` keeps the existing team album and its optional team password.
- `/` lists the hackathons, `/2026` introduces the year, and `/2026/music-ai` introduces this event. The old `/music-ai-2026` prefix permanently redirects to `/2026/music-ai`.
- Existing `/api` routes and the SQLite volume remain in place.
- Music is generated in the browser. It is not uploaded or added to the shared profiles. Download it before leaving. Browser read-aloud uses the device's available speech service; its availability and processing depend on the browser and installed voice.

The profile database survives the domain change when Coolify keeps the same application and volume. Cookies and browser drafts belong to the old domain. On the new domain, use the team password and personal edit code again. Save unpublished drafts and the edit code before switching domains.
