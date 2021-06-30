[![CI](https://github.com/DeFiCh/wallet/actions/workflows/ci.yml/badge.svg)](https://github.com/DeFiCh/wallet/actions/workflows/ci.yml)
[![wallet](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/count/oqk3fk&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/oqk3fk/runs)
[![codecov](https://codecov.io/gh/DeFiCh/wallet/branch/main/graph/badge.svg?token=83SCBQBEVJ)](https://codecov.io/gh/DeFiCh/wallet)
[![Maintainability](https://api.codeclimate.com/v1/badges/30297425fadcab8fbba4/maintainability)](https://codeclimate.com/github/DeFiCh/wallet/maintainability)
[![TS-Standard](https://badgen.net/badge/code%20style/ts-standard/blue?icon=typescript)](https://github.com/standard/ts-standard)

# DeFi Wallet

DeFi Blockchain Light Wallet for iOS, Android & Web.

## Releases

DeFi Wallet has 3 releases channel and unique environment for each of those
channel. [`app/environment.ts`](/app/environment.ts) carries the environment state for those releases channel.

<details>
<summary><b>Production</b></summary>

Created by Expo Application Service and configured in [`eas.json`](/eas.json) it creates a native build
with [`release-publish.yml`](/.github/workflows/release-publish.yml) workflow on type "published". Builds can only be
trigger by DeFiChain engineers, they are automatically uploaded into native app store for distribution.

Production environment is no debug and **MainNet** is the only network available.

</details>

<details>
<summary><b>Preview</b></summary>

Preview builds are created by 2 workflow. First at each pull request
via [`expo-preview.yml`](/.github/workflows/expo-preview.yml) workflow, release are prefixed `pr-preview-`. Secondly
at  [`release-publish.yml`](/.github/workflows/release-publish.yml) workflow on type "prereleased".

Preview environment has debug ability and all available network configured.

</details>

<details>
<summary><b>Development</b></summary>

Development builds are created on local machine and not triggered by any CI workflow.

Development environment has debug ability and all playground network configured.

</details>

## Developing & Contributing

Thanks for contributing, appreciate all the help we can get. Feel free to make a pull-request, we will guide you along
the way to make it mergeable. Here are some of our documented [contributing guidelines](CONTRIBUTING.md).

We use `npm 7` for this project, it's required to set
up [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

```shell
npm install
```

### Project Structure

```txt
wallet/
├─ app/
│  ├─ hooks/
│  └─ wallet/
├─ assets/
├─ components/
├─ cypress/
├─ screens/
│  ├─ ...Navigator/
│  └─ Main.tsx
├─ store/
└─ translations/
   └─ languages/
```

DeFi Wallet project is structured with 7 core directories. Each pull request will likely carry significant changes into
those directories with `i18n`, `e2e` and feature implementation.

1. `/app` - all non UI logic, hooks, wallet management and etc
2. `/assets` - for assets of the project that can be loaded at startup
3. `/components` - top level components for shared design language
4. `/cypress` - E2E tested facilitated through web technologies
5. `/screens` - screens hierarchy tree matching directory hierarchy tree
6. `/store`  - global state that is used at least more than once in screens
7. `/translations` - various language translations

### Testing

There are 2 types of tests in DeFi Wallet.

#### Unit Testing

Unit testing are created to test each individual units/components of a software. As they are unit tests, they should be
closely co-located together with the unit. They follow the naming semantic of `*.test.ts` and placed together in the
same directory of the code you are testing.

Unit tests are written for `/app`, `/components`, `/screens` and `/store`. Code coverage is collected for this.

#### End-to-end Testing

On top of unit tests, end-to-end provides additional testing that tests the entire lifecycle of DeFi Wallet. All
components and screen are integrated together as expected for real use cases. As such test are written for real usage
narrative as a normal consumer would. They are placed in the `/cypress` directory, and we
use [Cypress](https://github.com/cypress-io/cypress) to facilitate the testing.

Cypress is a modern end-to-end testing framework for web. It uses a sequential jest like approach for testing with
automatic wait and retrofitted with many utilities for great testing quality of life. Utilities are further customized
for DeFi wallet with our own construct. As cypress is for web only testing, we set up a web environment to run
end-to-end testing together with a local [playground](https://github.com/DeFiCh/playground). React(-Native) is platform
agnostic and that allow us to test with high confidence that the expected logic will follow the same flow in native.

To facilitate fast and ephemeral testing culture, we use [DeFi Playground](https://github.com/DeFiCh/playground). DeFi
Playground is a specialized testing blockchain isolated from MainNet for testing DeFi applications. It uses `regtest`
under the hood, you can `npm run playground` for the local playground environment or let it default to remote. Assets
are not real, it can be minted by anyone. Blocks are generated every 3 seconds, the chain resets daily on remote
playground.

`/screens/PlaygroundNavigator/*` contains various end user (cypress included) testing screen for debugging and setup
purpose that can be accessed in development and preview environment.

### IntelliJ IDEA

IntelliJ IDEA is the IDE of choice for writing and maintaining this library. IntelliJ's files are included for
convenience with basic toolchain setup but use of IntelliJ is totally optional.

### Security issues

If you discover a security vulnerability in
`DeFi Wallet`, [please see submit it privately](https://github.com/DeFiCh/.github/blob/main/SECURITY.md).

## License & Disclaimer

By using `DeFi Wallet` (this repo), you (the user) agree to be bound by [the terms of this license](LICENSE).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FDeFiCh%2Fwallet.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FDeFiCh%2Fwallet?ref=badge_large)
