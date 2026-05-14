Build a mobile-first web app called VocalWarm — a vocal warmup companion for singers. The app must look and feel like a native iOS app: dark background (#0D0B14), purple accent (#7C3AED and #A855F7), clean sans-serif typography (use Plus Jakarta Sans or DM Sans from Google Fonts), rounded cards, subtle glassmorphism on panels, smooth tab transitions. Take strong visual reference from apps like Spotify and Endel. The viewport should be fixed at mobile width (max 430px centered on desktop).

NAVIGATION
Bottom tab bar with 3 tabs:

🏠 Home (/)
🎹 Exercises (/exercises)
🎵 Routines (/routines)

Use icon + label. Active tab uses purple accent color. Inactive tabs are muted gray.

TAB 1 — HOME

Header: "Welcome back, [Name]" with a subtitle like "Ready to warm up?"
Three quick-action buttons in a row:

Create Routine (icon: plus circle)
Record (icon: microphone) — opens an in-app audio recorder with start/stop/save. Recordings are saved locally with a name the user types.
My Exercises (icon: music note or piano) — links to Exercises tab


Section: My Routines with horizontal scroll cards showing each routine (name, number of exercises, duration badge). Tapping a card opens that routine. No setlists section.


TAB 2 — EXERCISES (Piano icon)
Split in two sections:
Section A — Vocal Range

A visual keyboard (SVG or CSS) showing C2–G5
User can drag or tap two markers: lowest note and highest note
Displays current range as text: e.g. "C3 → B4"
A "Save Range" button persists this to localStorage

Section B — Scale Library

List of scales, grouped by category, in this order:

Major: Major Scale, Major Pentatonic, Major Arpeggio
Minor: Minor Scale, Minor Pentatonic, Natural Minor, Harmonic Minor
Modal & Other: Dorian, Mixolydian, Chromatic, Whole Tone


Each scale card shows:

Scale name + short description (e.g. "5-note sequence • All voices")
A BPM slider (60–160 BPM, default 100)
A Transpose control (semitones, -6 to +6, default 0)
Play/Pause button — plays a generated audio tone sequence matching the scale pattern using the Web Audio API (no external files needed — generate the notes programmatically using oscillators). The tone should match the user's saved vocal range root note and transpose setting.
The playing card highlights with a purple glow border




TAB 3 — ROUTINES (Music note icon)

Header with "My Routines" title and a + New Routine button (purple, top right)
List of saved routines as expandable cards:

Collapsed: shows routine name, exercise count, type badge (Warm-up / Melismas / Cool-down / Custom), total duration
Expanded: shows ordered list of exercises added to it, with a ▶ Start Routine button


New Routine flow (modal or new screen):

Step 1: Choose type — Warm-up / Melismas & Agility / Cool-down / Custom (big tappable cards with icons and descriptions, like a wizard screen)
Step 2: Set routine name (text input)
Step 3: Add exercises — shows the full scale library as a checklist, user selects which ones to include and reorders them via drag handle
Shows Total Duration calculated from selected exercises (each scale defaults to 3 min)
Save Routine button




DATA PERSISTENCE
Use localStorage for everything:

Saved routines (name, type, exercises list)
Vocal range (low note, high note)
Saved recordings (as base64 audio blobs or references)


VISUAL STYLE DETAILS

Background: #0D0B14 (near black with purple tint)
Cards: rgba(255,255,255,0.05) with border: 1px solid rgba(255,255,255,0.08) and border-radius: 16px
Primary accent: #7C3AED → #A855F7 gradient for buttons
Text: white primary, #9CA3AF secondary
Inputs: dark fill, purple focus ring
Animations: smooth tab transitions (slide or fade), button press scale(0.97), card hover lift
The piano keyboard in the range selector should be interactive SVG with white and black keys clearly styled


TECH
Single HTML file preferred, or React (JSX). Use Web Audio API for all audio (no external sound files). All state in memory + localStorage. No backend required.