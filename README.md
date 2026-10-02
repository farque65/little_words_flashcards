# Little Words

A build-free mobile flashcard site. Serve `dist` with any static web server (for example `python3 -m http.server 8000 --directory dist`).

## Expand the collection
Edit `dist/words.json`. Each item has a unique `id`, a `word`, a `category`, an emoji `picture` or `image` URL, spoken `speech` text, optional word `audio` URL, and a `sounds` array. Each sound has `label`, synthesized `say`, and an optional `audio` URL. Put recordings or pictures in `dist/assets` and reference them as `./assets/cat.mp3`. Categories appear automatically.

Example:
```json
{"id":"cat","word":"cat","category":"Animals","picture":"🐱","image":null,"speech":"cat","audio":"./assets/cat.mp3","soundMode":"phonemes","sounds":[{"label":"c","say":"kuh","audio":"./assets/c.mp3"},{"label":"a","say":"ah","audio":"./assets/short-a.mp3"},{"label":"t","say":"tuh","audio":"./assets/t.mp3"}]}
```

Speech uses the device browser voice and requires a tap. Synthesized sound hints are approximate; custom recordings are recommended for accurate phonemes. Longer words use syllables, and remaining one-syllable words use a slow-word demonstration. Voice quality and availability vary by device. No audio recordings are included. Emoji illustrations follow the device's emoji style.

Use previous/next buttons, swipe the picture, or left/right keyboard keys. Audio is stopped when changing cards or hiding the page.

## Full-screen mode
Tap Full screen to fill the display. Swipe left for the next card and right for the previous card. Tap the picture to hear the word; use Close or Escape to leave full-screen mode. Browsers without native fullscreen support use a viewport-filling fallback.

## Upload to GitHub
1. Extract this ZIP.
2. Create an empty GitHub repository.
3. Upload the contents of the little-words folder, preserving the dist folder.

Or run these commands inside the extracted little-words folder, replacing YOUR-REPOSITORY-URL:
```sh
git init
git add .
git commit -m "Initial Little Words website"
git branch -M main
git remote add origin YOUR-REPOSITORY-URL
git push -u origin main
```

## Run locally
From the little-words folder:
```sh
python3 -m http.server 8000 --directory dist
```
Then open http://localhost:8000. Serve through HTTP rather than opening index.html directly, because the app loads words.json using fetch.

No npm packages, build step, backend, or API keys are required. Publish the dist directory on a static host. The dist directory contains the editable source code, not compiled files.
