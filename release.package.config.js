module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle: '# CHANGELOG',
      },
    ],
    [
      'semantic-release-vsce',
      {
        packageVsix: true,
        publish: false, // no-op since we use semantic-release-stop-before-publish
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        tagFormat: 'v0.0.0',
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    'semantic-release-stop-before-publish',
  ],
  branches: ['main', 'feat/*', 'fix/*', { name: 'alpha', prerelease: true }],
};
