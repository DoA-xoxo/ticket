# The Nutcracker Ticket Studio

A browser-only ticket customizer built with Next.js App Router, React, and TypeScript. It uses a single SVG artwork for the live preview and the 1600 × 1600 PNG export. Uploaded images are read locally and are not sent to a server.

## Features
- Correct stamp-style ticket contour with top/bottom semicircular die-cut notches, side notches, inset contour-following border lines, and a lower perforation rule.
- Ticket scale from 100% to 120%; scaling recenters the ticket. Horizontal and vertical position use sliders instead of drag gestures.
- One central photo slot with local upload, replace/remove, crop zoom and horizontal/vertical positioning sliders.
- Editable ticket-holder name with antique serif and other font options.
- Independent ticket, outline, accent/perforation, and canvas background colors plus color presets.
- Transparent-background option, final preview modal, and client-side 1600 × 1600 PNG download.
- Responsive layout for desktop and mobile.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build for production

```bash
npm run build
npm run start
```

## Deploy to Vercel

Push this project to GitHub and import the repository into Vercel. No environment variables or image storage are required.

## Notes
- The logo is a bundled transparent PNG at `public/the-nutcracker-logo.png` and is embedded into the SVG during export.
- The project contains no server upload route; local photos remain in the browser.
- `npm run build` should be run in an environment with package registry access before publishing.
