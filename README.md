# MomentAI

Next.js app with Anthropic-backed API routes.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env.local
```

3. Run the app:

```bash
npm run dev
```

## Deploy to Vercel

This repo is already linked to a Vercel project (`momentai`), so deploy is straightforward.

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, import the repository (or open the existing linked project).
3. Set environment variable:
   - `ANTHROPIC_API_KEY` (for Production, Preview, and Development as needed)
4. Keep defaults:
   - Framework Preset: `Next.js`
   - Build Command: `next build`
5. Deploy.

### CLI deploy option

```bash
npm i -g vercel
vercel
vercel --prod
```

## Production check

Run this before deploying:

```bash
npm run build
```
