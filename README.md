# VSCode ![S](https://raw.githubusercontent.com/datagone/vscode-stryker-mutator/main/assets/images/logo.png)tryker Mutator

![GitHub](https://img.shields.io/github/license/datagone/vscode-stryker-mutator)
![GitHub Workflow Status (with branch)](https://img.shields.io/github/actions/workflow/status/datagone/vscode-stryker-mutator/ci-cd.yml?branch=main&logo=github)
![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/datagone/vscode-stryker-mutator?include_prereleases&logo=github)
![GitHub Release Date](https://img.shields.io/github/release-date/datagone/vscode-stryker-mutator?logo=github)

![GitHub all releases](https://img.shields.io/github/downloads/datagone/vscode-stryker-mutator/total?logo=github)
![GitHub stars](https://img.shields.io/github/stars/datagone/vscode-stryker-mutator.svg?logo=github)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/datagone.vscode-stryker-mutator?logo=visualstudiocode)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/datagone.vscode-stryker-mutator?logo=visualstudiocode)
![Open VSX Downloads](https://img.shields.io/open-vsx/dt/datagone/vscode-stryker-mutator?logo=vscodium&logoColor=white)
![Open VSX Rating](https://img.shields.io/open-vsx/rating/datagone/vscode-stryker-mutator?logo=vscodium&logoColor=white)

## 🤔 What is `Stryker Mutator` for VSCode

Stryker Mutator VSCode extension is a plugin for Visual Studio Code (& friends) that enables developers to use the [Stryker Mutator](https://stryker-mutator.io/) mutation testing framework directly within their code editor. Mutation testing is a technique used to improve the quality of software by introducing faults (or "mutations") into the codebase and checking if the tests catch them. The Stryker Mutator framework automates this process by generating many variations of the code (with different mutations) and running the tests against each variation to see which mutations are caught and which ones slip through undetected.

This extension provides an easy-to-use interface for configuring and running the Stryker Mutator framework within your project. It allows you to customize the mutation testing process by specifying which selection, file, folder to launch the mutants against. It provides feedback on the progress and results of the mutation testing run. With the `Stryker Mutator`, you can easily improve the test coverage and overall quality of your codebase.

> 📜 Note 📜
>
> It's an unofficial extension for `Stryker Mutator`
>
> It only supports `.NET (C#)` for Now.
>
> If you are using `JavaScript/TypeScript` for your project, we suggest the use of [pixabelle.stryker-runner](https://marketplace.visualstudio.com/items?itemName=pixabelle.stryker-runner)

## ❔ Why use `Stryker Mutator`

Mutation testing is a powerful technique for improving the quality and reliability of your software. By automatically introducing faults into your codebase and checking if the tests catch them, you can identify weaknesses in your test suite and improve its effectiveness. However, setting up and running mutation testing manually can be time-consuming and error-prone. The `Stryker Mutator` streamlines the mutation testing process by providing an easy-to-use interface for configuring and running the Stryker Mutator framework within your code editor.

With `Stryker Mutator`, you can:

- Improve the quality and reliability of your code by identifying weaknesses in your test suite and addressing them.
- Catch bugs and issues that might otherwise go unnoticed.
- Increase your confidence in your codebase by ensuring that your tests are effective at catching faults.
- Save time and effort by automating the mutation testing process.
- Customize the mutation testing process to fit your specific needs and requirements.
- Easily integrate mutation testing into your development workflow by using the extension directly within your code editor.

Overall, `Stryker Mutator` is a powerful tool for any developer looking to improve the quality and reliability of their codebase.

> ### ⚠️ Disclaimer ⚠️
>
> Mutation testing can be resource-intensive and may significantly slow down your build process. `Stryker Mutator` may consume a considerable amount of system resources and may require careful configuration to ensure optimal performance. We recommend that you test the extension on a selection on code, on a file or a small-scale project. Carefully review the [Stryker Mutator's documentation](https://stryker-mutator.io/docs/stryker-net/configuration/) to ensure that your configuration settings are appropriate for your project's needs. We are not responsible for any issues or damages that may arise from the use of this extension, and use of this extension is at your own risk.

## 🧱 Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/en-us/download) is require, [ _at least we tested it with .NET 7.0_ ]
- [VS Code](https://code.visualstudio.com) 🤯 Obviously!!!

## ⚙️ Usage

If you didn't have Stryker.Net installed and a configuration file, you should start with these steps while using the command pallette:

1. `Install the Stryker.NET tool`. It may take time to install.
2. `Create [a basic] Stryker configuration file`

Afterward, right-click on a file, on a folder or over a selection of your best (or worst 😬) code and choose the `Mutate` action that you want to perform.

## 🚀 Features

Here is the list of all available (✔️) and upcoming (❌) features that will help you hunt mutants hiding in place sight:

- `Stryker.NET: Trigger mutation tests on file`: Will run Stryker to mutate one specific file. Available in the:
  - Context Menu (✔️)
  - Command Pallette (✔️)
- `Stryker.NET: Trigger mutation tests on selection`: will run Stryker to mutate a selected block of code within the editor. Available in the:
  - Context Menu (✔️)
  - Command Pallette (✔️)
- `Stryker.NET: Trigger mutation tests on folder`: Will run Stryker to mutate files under one specific folder. Available from the:
  - Context Menu (✔️)
  - Command Pallette (✔️)
- `Stryker.NET: Trigger mutation tests on workspace`: Will run Stryker to mutate all files. Available, with a disclaimer (✔️), from the:
  - Context Menu (✔️)
  - Command Pallette (✔️)
- `Stryker.NET: Create Stryker.NET configuration file`: Will create a default stryker configuration file based on the `.sln`. Available from the:
  - Command Pallette (✔️)
- `Stryker.NET: Install Stryker.NET Tool`: Will install the stryker dotnet tool. It will use the settings to determine the Global or Local Installation (❌). Available from the:
  - Command Pallette (✔️)
- `Stryker.NET: Uninstall Stryker.NET Tool`: Will uninstall the stryker dotnet tool. It will use the settings to determine the Global or Local Installation (❌). Available from the:
  - Command Pallette (✔️)
- `Stryker.NET: Show the Report`: Will display the latest generated mutation report. Available from the:
  - Command Pallette (❌ _Alternatively, you could use `--open-report:html` in the optionalParameters setting_)

## 🛠️ Configuration

Even though the extension Stryker Mutator will work without any specific settings, there are some settings that you could take advantage of:

| ✔️Available<br/>❌Upcoming | Settings                                       | Description                                                                                                                                                                                              |
| -------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✔️                         | strykerMutatorNet.dotnet.commandPath           | The command/path to invoke `dotnet`, if different than the default path/exe (default:`dotnet`)                                                                                                           |
| ✔️                         | strykerMutatorNet.stryker.configFile           | Path to a stryker config file, if elsewhere than the workspace path                                                                                                                                      |
| ✔️                         | strykerMutatorNet.stryker.optionalParameters   | Optional parameters to add with the command line. See the [Configuration](https://stryker-mutator.io/docs/stryker-net/configuration/) for more details (e.g. `--verbosity info`, `--concurrency 2`, ...) |
| ❌                         | strykerMutatorNet.show-report                  | Enable/Disable the browser opening the report. It requires the reporter `html` (default: `false`/disable). _Alternatively, you could use `--open-report:html` in the optionalParameters setting_         |
| ❌                         | strykerMutatorNet.experimental                 | Enable/Disable the experimental features which "may" activate new features (default: `false`/disable)                                                                                                    |
| ❌                         | strykerMutatorNet.dotnet.tools.installGlobally | Enable/Disable the global installation of the stryker tool (default: `true`/enable)                                                                                                                      |

## 🙋 Support & Assistance

[![GitHub issues](https://img.shields.io/github/issues/datagone/vscode-stryker-mutator?logo=github)](https://github.com/datagone/vscode-stryker-mutator/issues)

- ❤️ Please review the [Code of Conduct](https://github.com/datagone/vscode-stryker-mutator/blob/main/.github/CODE_OF_CONDUCT.md) for guidelines on ensuring everyone has the best experience interacting with the community.
- 🙏 Take a look at the [support](https://github.com/datagone/vscode-stryker-mutator/blob/main/.github/SUPPORT.md) document on guidelines for tips on how to ask the right questions.
- 🐞 For all features/bugs/issues/questions/etc., [head over here](https://github.com/datagone/vscode-stryker-mutator/issues/new/choose).

## 🤝 Contributing

[![GitHub contributors](https://img.shields.io/github/contributors-anon/datagone/vscode-stryker-mutator?logo=github)](https://github.com/datagone/vscode-stryker-mutator)
![GitHub pull requests](https://img.shields.io/github/issues-pr/datagone/vscode-stryker-mutator?logo=github)
![GitHub last commit](https://img.shields.io/github/last-commit/datagone/vscode-stryker-mutator/main?logo=github)

- ❤️ Please review the [Code of Conduct](https://github.com/datagone/vscode-stryker-mutator/blob/main/.github/CODE_OF_CONDUCT.md) for guidelines on ensuring everyone has the best experience interacting with the community.
- 📋 Please review the [Contributing](https://github.com/datagone/vscode-stryker-mutator/blob/main/.github/CONTRIBUTING.md) document for submitting issues/a guide on submitting pull requests and helping out.

## 👏 Acknowledgements

Thanks to:

- the hard work done by [slcp](https://github.com/slcp) behind his VSCode extension [pixabelle.stryker-runner](https://marketplace.visualstudio.com/items?itemName=pixabelle.stryker-runner) and it's repo GitHub [stryker-runner](https://github.com/slcp/stryker-runner) which integrates the Stryker-JS. This extension, [**`vscode-stryker-mutator`**](./), was build upon his work and would not have been available so soon without it.
- [Manuel Sagra](https://www.flickr.com/photos/manuelsagra/) for the image of [TMNT](https://www.flickr.com/photos/manuelsagra/383825655/) on Flickr that inspired the logo mixed with the [Stryker Mutator](https://stryker-mutator.io/) logo.
- @[lrstanley](https://github.com/lrstanley/lrstanley), for his repository documentation templates which I use nearly as is.
- @[Bibz87](https://github.com/Bibz87/kubernetes-example), whom inspired my ReadMe

## 💖 Donations / Sponsors

If you think this code/project is useful to you, I encourage you to make a donation to one of these foundations that I hold dear: [Foundation for Prader-Willi Research Canada](https://www.fpwr.ca/donate/) or [International Prader-Willi Syndrome Organisation](https://ipwso.org/make-a-donation/).

Prader-Willi syndrome (PWS) is a rare genetic disorder characterized at birth by severe hypotonia, growth disorders, learning disabilities and the appearance of hyperphagia (i.e. always being hungry) during childhood (usually appears between 2 and 8 years of age). Without adequate care (and sometimes despite care) this can lead to the development of morbid obesity. You can learn more about it on [Wikipedia](https://en.wikipedia.org/wiki/Prader%E2%80%93Willi_syndrome), on the [Foundation for Prader-Willi Research](https://www.fpwr.org/) website or on the [International Prader-Willi Syndrome Organisation](https://ipwso.org/) website.

## ⚖️ License

This VSCode extension and source code is licensed under the terms of the [GPL-3.0 license](LICENSE).

### 🃏 Logo

The modified "logo" used in this project is licensed under [CC-BY-4.0](./assets/images/LICENSE). The original image can be found on [Flickr](https://www.flickr.com/photos/manuelsagra/383825655/) and was distributed under [CC-BY-2.0](https://creativecommons.org/licenses/by/2.0/).
