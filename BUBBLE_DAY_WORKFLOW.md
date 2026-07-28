# Dated Bubble Day workflow

`bubble_days` is the canonical record for one calendar day.

- One row per user and date.
- `status = draft` while the day is still being updated.
- `status = final` after the nightly check-in.
- Structured sections, health, relationship-with-health, wins, lessons, tags, people, and XP remain attached to the same date.
- Re-pushing the same date updates that row rather than creating duplicates.
- The app loads `bubble_days` alongside regular memories so finalized daily stories appear in history, memories, and stats.
