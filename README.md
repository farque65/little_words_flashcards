# Little Words

Mobile-friendly picture flashcards built with **React 19, Vite 8, TypeScript, and Tailwind CSS 4**. Includes 88 words across six categories, tap-to-speak, sound breakdowns, shuffle, keyboard navigation, and a fullscreen swipe view.

## Requirements
Node.js 22.13 or newer (Node 24 LTS recommended) and npm.

## Run locally
```sh
npm ci
npm run dev
```
Open the local URL Vite prints. To try it on a phone, use the computer's local network address and the same Wi-Fi network.

## Production build
```sh
npm run build
npm run preview
```
Publish `dist` on a static hosting service. `npm run build` checks TypeScript before building. No backend or API keys are needed.

## Project structure
- `src/App.tsx`: flashcard UI, categories, fullscreen, and swipe controls.
- `src/useSpeech.ts`: device speech and optional recording playback.
- `src/types.ts`: JSON types.
- `src/index.css`: Tailwind CSS and the original visual theme.
- `public/words.json`: expandable word collection.
- `vite.config.ts`: Vite configuration.

## Expand the cards
Edit `public/words.json`. Categories appear automatically. Each item has a unique `id`, `word`, `category`, emoji `picture` or `image` URL, synthesized `speech`, optional word `audio`, and a `sounds` array with `label`, `say`, and optional `audio`.

```json
{"id":"cat","word":"cat","category":"Animals","picture":"🐱","image":null,"speech":"cat","audio":null,"soundMode":"phonemes","sounds":[{"label":"c","say":"kuh","audio":null},{"label":"a","say":"ah","audio":null},{"label":"t","say":"tuh","audio":null}]}
```

Put custom assets in `public/assets` and reference them as `./assets/cat.mp3`. They are copied into the production build. Speech uses browser voices and requires a tap. Synthesized sound hints are approximate; use recordings for accurate phonemes. Longer words use syllables, and remaining one-syllable words use a slow-word demonstration. Emoji style follows the device. No recorded audio is bundled.

## Controls
Tap a picture to hear its name. Use Sound it out to hear the segments. Swipe left for next, right for previous, or use buttons and keyboard arrow keys. Full screen fills the display, with a viewport fallback where the native Fullscreen API is unavailable. Close or Escape exits. Audio stops when changing cards or hiding the page.

## Upload to GitHub
Extract the ZIP and upload the contents of `little-words-react` to a new repository, preserving folders. Or run:
```sh
git init
git add .
git commit -m "Initial Little Words React website"
git branch -M main
git remote add origin YOUR-REPOSITORY-URL
git push -u origin main
```
The source ZIP includes the npm lockfile. Generated `dist` and `node_modules` are excluded; `npm ci` and `npm run build` recreate them.
