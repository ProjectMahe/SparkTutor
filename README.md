
# SparkTutor — DevIgnite Submission (Extended MVP)

**Tagline:** 5-minute personalised lessons & instant explainers

## What's new (Extended features)
This extended PWA adds several frontend-only features that enhance usability and teacher workflows without requiring a backend:
- User profile (name, email) stored in localStorage
- Settings: Dark mode & Dyslexia-friendly font toggle
- Teacher mode: create and save custom lessons (HTML content) locally
- Share custom lessons via encoded URLs (lesson=custom:<base64-json>)
- Read Aloud (browser TTS) for lesson content
- Export progress as CSV
- Copy-to-clipboard for share links
- Progress includes user info if profile is filled

## How to run
1. Unzip the project.
2. Open `index.html` in a modern browser (Chrome/Edge/Firefox).
3. For PWA install experience, host on static hosting (Netlify/Vercel/GitHub Pages).

No backend or API keys required.

## New usage notes
- Teacher: click "Teacher" in header to create lessons. Use a short slug for ID (no spaces).
- Share: in Teacher view use Share to create an encoded link which anyone can open to view the lesson.
- Export: click "Export CSV" to download your recent progress.
- Read Aloud: open lesson and click "Read Aloud" to have the browser speak the lesson.

