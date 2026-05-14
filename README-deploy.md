# The Training Room MVP Demo

This is a static website prototype. It can be hosted with any static hosting service, including Vercel, Netlify, GitHub Pages or Cloudflare Pages.

## Demo login

Email: demo@trainingroom.com  
Password: trainingroom123

## Public demo notes

- The app saves created modules in the browser with localStorage.
- Video links are the best option for a public phone demo because they persist after refresh.
- File uploads preview in the current browser. Very small files may be stored locally, but large videos need real cloud storage in a future version.
- The current smoothie MOV file is large. For the fastest public phone demo, add a compressed MP4 at `videos/tropical-sunset-smoothie.mp4`; the website will use that file first.

## Vercel

Use the project folder as the project root. There is no build command.

Suggested Vercel settings:

- Framework preset: Other
- Build command: leave blank
- Output directory: leave blank
- Install command: leave blank

The included `.vercelignore` keeps the large raw MOV file out of deployment.
