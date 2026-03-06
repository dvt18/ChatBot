# Gemini Chatbot

A simple chat UI built with **React**, **Vite**, and **Tailwind CSS**, using **Google Gemini** (via `@google/generative-ai`) as the backend model.

## Prerequisites

- Node.js 18+ and npm
- A Google Gemini API key

## Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

- Create a `.env` file in the project root (same folder as `package.json`), based on `.env.example`:

```bash
cp .env.example .env
```

- Edit `.env` and set your real key:

```bash
VITE_GEMINI_API_KEY=YOUR_REAL_GEMINI_API_KEY
```

> **Important:** `.env` is **git-ignored** and should never be committed. Only `.env.example` lives in the repo.

3. **Run the dev server**

```bash
npm run dev
```

Then open the printed URL (typically `http://localhost:5173`) in your browser.

## Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – create a production build
- `npm run preview` – locally preview the production build
- `npm run lint` – run ESLint

## Deployment

For static hosting (e.g. GitHub Pages, Netlify, Vercel):

```bash
npm run build
```

Use the generated `dist` folder as your build output.

