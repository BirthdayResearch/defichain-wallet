[![CI](https://github.com/BirthdayResearch/defichain-wallet/actions/workflows/ci.yml/badge.svg)](https://github.com/BirthdayResearch/defichain-wallet/actions/workflows/ci.yml)
[![wallet](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/count/oqk3fk/main&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/oqk3fk/runs)
[![codecov](https://codecov.io/gh/DeFiCh/wallet/branch/main/graph/badge.svg?token=83SCBQBEVJ)](https://codecov.io/gh/DeFiCh/wallet)
[![Maintainability](https://api.codeclimate.com/v1/badges/30297425fadcab8fbba4/maintainability)](https://codeclimate.com/github/DeFiCh/wallet/maintainability)

<div>
  <a href="https://apps.apple.com/us/app/defichain-wallet/id1572472820"><img width="130" height="50" src="/.github/images/app_store.svg" alt="app store" /></a>
  <a href='https://play.google.com/store/apps/details?id=com.defichain.app'><img width="130" height="50" alt='Get it on Google Play' src='/.github/images/play_store.svg'/></a>
</div>

# DeFiChain Wallet

DeFi Blockchain Light Wallet for iOS, Android & Web.

## Releases

DeFiChain Wallet has 3 releases channel and unique environment for each of those channel. [`shared/environment.ts`](/shared/environment.ts) carries the environment state for those releases channel.

<details>
<summary><b>Production</b></summary>

Created by Expo Application Service and configured in [`eas.json`](/eas.json), it creates a native build
with [`release-publish.yml`](/.github/workflows/eas-publish.yml) workflow on type "published". Builds can only be
triggered by DeFiChain engineers, they are automatically uploaded into native app store for distribution.

In the production environment, only **MainNet** is available, and debugging is not enabled.

</details>

<details>
<summary><b>Preview</b></summary>

Preview builds are created by 2 workflow. First at each pull request
via [`expo-preview.yml`](/.github/workflows/expo-preview.yml) workflow, release are prefixed `pr-preview-`. Secondly
at [`release-publish.yml`](/.github/workflows/eas-publish.yml) workflow on type "prereleased".

In the preview environment, all networks are available, and debugging is enabled.

</details>

<details>
<summary><b>Development</b></summary>

Development builds are created on local machine and not triggered by any CI workflow.

In the development environment, all playground networks are available, and debugging is enabled.

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
mobile-app/
├─ .github/
├─ app/
│  ├─ components/
│  ├─ contexts/
│  ├─ hooks/
│  ├─ middleware/
│  ├─ screens/
│  │  ├─ ...Navigator/
│  │  └─ Main.tsx
└─ cypress/
shared/
├─ assets/
├─ store/
└─ translations/
   └─ languages/
```

DeFiChain Wallet project is structured with 3 core directories. Each pull request will likely carry significant changes
into those directories.

| Directory              | Description                                                                     |
| ---------------------- | ------------------------------------------------------------------------------- |
| `/.github`             | GitHub Workflow for shift left automation                                       |
| `/app/api`             | API and middlewares logic for application, for non-UI logic only                |
| `/shared/assets`       | assets of the project that can be loaded at startup                             |
| `/app/components`      | top level components for a atomic shared design language                        |
| `/app/contexts`        | shared contexts for application, non-UI logic                                   |
| `/app/hooks`           | shared hooks for application, for UI logic only                                 |
| `/app/screens`         | screens hierarchy tree matching directory hierarchy tree                        |
| `/shared/store`        | global state that is used at least more than once in screens, for UI logic only |
| `/shared/translations` | various language translations                                                   |
| `/cypress`             | E2E tested facilitated through web testing technologies                         |

### Testing

There are 2 types of tests in DeFiChain Wallet.

#### Unit Testing

Unit testing is created to test each individual units/components of a software. As they are unit tests, they should be
closely co-located together with the unit. They follow the naming semantic of `*.test.ts` and placed together in the
same directory of the code you are testing.

Unit tests are written for `/app/contexts`, `/app/api`, `/app/components`, `/app/screens` and `/app/store`. Code
coverage is collected for this.

#### End-to-end Testing

On top of unit tests, end-to-end provides additional testing that tests the entire lifecycle of DeFiChain Wallet. All
components and screen are integrated together as expected for real use cases. As such test are written for real usage
narrative as a normal consumer would. They are placed in the `/cypress` directory, and we
use [Cypress](https://github.com/cypress-io/cypress) to facilitate the testing.

Cypress is a modern end-to-end testing framework for web. It uses a sequential jest like approach for testing with
automatic wait and retrofitted with many utilities for great testing quality of life. Utilities are further customized
for DeFiChain Wallet with our own construct. As cypress is for web only testing, we set up a web environment to run
end-to-end testing together with a local [playground](https://github.com/DeFiCh/playground). React(-Native) is platform
agnostic and that allow us to test with high confidence that the expected logic will follow the same flow in native.

To facilitate fast and ephemeral testing culture, we use [DeFi Playground](https://github.com/DeFiCh/playground). DeFi
Playground is a specialized testing blockchain isolated from MainNet for testing DeFi applications. It uses `regtest`
under the hood, you can `npm run playground` for the local playground environment or let it default to remote. Assets
are not real, it can be minted by anyone. Blocks are generated every 3 seconds, the chain resets daily on remote
playground.

`/app/screens/PlaygroundNavigator/*` contains various end user (cypress included) testing screen for debugging and setup
purpose that can be accessed in development and preview environment. Code coverage is collected for this.

### IntelliJ IDEA

IntelliJ IDEA is the IDE of choice for writing and maintaining this library. IntelliJ's files are included for
convenience with basic toolchain setup but use of IntelliJ is totally optional.

### Security issues

If you discover a security vulnerability in
`DeFiChain Wallet`, [please see submit it privately](https://github.com/DeFiCh/.github/blob/main/SECURITY.md).

## License & Disclaimer

By using `DeFiChain Wallet` (this repo), you (the user) agree to be bound by [the terms of this license](LICENSE).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FDeFiCh%2Fwallet.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FDeFiCh%2Fwallet?ref=badge_large)
