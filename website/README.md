[![Netlify Status](https://api.netlify.com/api/v1/badges/89c2db53-2b96-4ecf-bd0b-f8a127a09e53/deploy-status)](https://app.netlify.com/sites/wallet-defichain/deploys)

# DeFiChain Wallet Website

This is **NOT** DeFiChain Web Wallet, this is an accompanying website to the DeFiChain wallet. It provides the uncapped
full-stack ability to DeFiChain Wallet. This website creates an online real estate for DeFiChain Wallet to communicate
beyond the native platforms we support.

Purpose includes:
- Landing for DeFiChain Wallet
- Static FAQ resources
- `/api/*` upstream link for the native wallet to pull information.

## Developing

```shell
npm install
```

This `./website` is not part of the main mono-repo project structure. This website has its own `package-lock.json`
and `node_modules` that is isolated for its own use.

### Project Structure

Project structure inspired by [DeFiCh/scan](https://github.com/defich/scan).

```txt
website/
└─ src/
   ├─ components/
   ├─ pages/
   │  ├─ api/releases.ts   (JSON API)
   │  └─ index.tsx         (SSR/SSG/SPA Web Page)
   ├─ public/
   └─ style/
```
