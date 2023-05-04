# DOC4DEV

Release works with [semantic-release](https://semantic-release.gitbook.io/semantic-release/) and it's [detailed configurations](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration) with some [plugins](https://semantic-release.gitbook.io/semantic-release/extending/plugins-list) that must be install with yarn in the devDependencies : - [@semantic-release/commit-analyzer](https://github.com/semantic-release/commit-analyzer) - [@semantic-release/changelog](https://github.com/semantic-release/changelog) - [@semantic-release/git](https://github.com/semantic-release/git) - [semantic-release-vsce](https://github.com/felipecrs/semantic-release-vsce) - [semantic-release-stop-before-publish](https://github.com/felipecrs/semantic-release-vsce#platform-specific-on-github-actions) - it's superpowers are : - commit analyser - versioning - release note generator - changelog generator - with the plugins : - package the vsix [in one job/stage] - publish the vsix at GitHub, vscode marketplace and openvsx registry [in the other job/stage]

## Test locally

After cloning, you will need to install dependencies

```bash
yarn
```

Prepare Husky, which will run manage hooks over the git commands

````bash
yarn prepare
```

Run all the unit tests (To be noted, it should be 100%)

```bash
yarn test:unit with coverage
```

Run mutants on the code base of the extension. Yes, we - pretty much - *"eat our own dog food"* (If we forget that we built it with TypeScript and that we need the Stryker-JS version... Ah!Ah!Ah!). To be noted, again, it should be 100%

```bash
yarn test:mutation:full
```

## Run it locally

If you want to run it in "Debug mode", just hit "F5".

If you want to validate a local package version. First create the package using the "vsce" tool:

```bash
yarn vscode:package
```

Afterward, open a new instance of VSCode, and in the extension ["..."] menu, chose "Install from VSIX" and select the one you just packaged.
````
