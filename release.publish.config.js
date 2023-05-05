module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      'semantic-release-vsce',
      {
        packageVsix: false,
        publishPackagePath: '*/vscode-stryker-mutator-*.vsix',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          {
            path: '*/vscode-stryker-mutator-*.vsix',
          },
        ],
        failOnError: true,
      },
    ],
  ],
  branches: ['main', 'feat/*', 'fix/*', { name: 'alpha', prerelease: true }],
};
