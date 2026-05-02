# LinkedIn Cringe Scorer

A brutally honest AI-powered scorer for LinkedIn posts, built with Next.js 14 and Claude.

<!-- Screenshot placeholder: add a screenshot of the app here -->

## Features

- Paste any LinkedIn post and get a cringe score from 0–100
- Detects specific cringe patterns (humblebrag, fake vulnerability, buzzword soup, etc.)
- Streaming responses via the Anthropic SDK
- Animated score reveal with dynamic color coding
- AI-generated "normal person" rewrite of the post
- Mobile responsive, dark mode UI

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd linkedin-cringe-scorer
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Import into Vercel
3. Add `ANTHROPIC_API_KEY` in Vercel → Project → Settings → Environment Variables
4. Deploy

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-python) (`@anthropic-ai/sdk`)
- Model: `claude-sonnet-4-20250514`

## Project Structure

```
app/
  api/
    score/
      route.ts        # Streaming API route
  components/
    ScoreDisplay.tsx  # Results card with animated score
    SkeletonLoader.tsx # Loading skeleton
  layout.tsx
  page.tsx            # Main landing page + form
  globals.css
```
