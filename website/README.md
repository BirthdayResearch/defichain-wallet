[![Netlify Status](https://api.netlify.com/api/v1/badges/89c2db53-2b96-4ecf-bd0b-f8a127a09e53/deploy-status)](https://app.netlify.com/sites/wallet-defichain/deploys)

# DeFiChain Wallet Website

> https://wallet.defichain.com

This is **NOT** DeFiChain Web Wallet, this is an accompanying website to the DeFiChain wallet. It provides the uncapped
full-stack ability to DeFiChain Wallet. This website creates an online real estate for DeFiChain Wallet to communicate
beyond the native platforms we support.

Purpose includes:

- Landing for DeFiChain Wallet
- Static FAQ resources
- `/api/*` upstream link for the native wallet to pull information.

## Developing

### Getting started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### About `Next.js`

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Netlify Plugin NextJs](https://github.com/netlify/netlify-plugin-nextjs) SSR is enabled by default.

### Project Structure

This `./website` is part of the main mono-repo project structure. Project structure inspired
by [DeFiCh/scan](https://github.com/defich/scan).

```txt
website/
└─ src/
   ├─ components/
   ├─ pages/
   │  ├─ api/v0/announcements.ts   (JSON API)
   │  └─ index.tsx         (SSR/SSG/SPA Web Page)
   ├─ public/
   └─ style/
```
