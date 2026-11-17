# Umami Server Academy — Prototype 0.2

Mobile-first House of Umami menu-training game prototype.

## What's new in 0.2
- Original, procedurally synthesized retro soundtrack using Web Audio API; no copyrighted samples or game music.
- Separate Academy and Guest Battle themes, synthesized answer feedback, and a user-controlled music toggle.
- Rewritten ramen knowledge bank (10 questions) and Guest Battle bank (5 scenarios).
- Question content avoids unverified recipe details, dish-specific allergen claims, and unconfirmed pairings.

## Publish
Upload the contents of this folder to the root of `MrHence24/umami-server-academy`, replacing the existing files while preserving the `data/` folder structure. GitHub Pages should continue serving from `main` / root.

## Notes
- Audio begins only after the player taps the music control, as required by mobile browser autoplay policies.
- Music is synthesized in the browser; no external audio files are needed.
- XP and scores remain local to the browser. This is not a shared employee leaderboard.
- The game does not replace House of Umami allergen procedures.
