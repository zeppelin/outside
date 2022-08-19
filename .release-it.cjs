/* eslint-env node */

module.exports = {
  git: {
    commitMessage: 'Release v${version}',
    tagName: 'v${version}',
  },
  github: {
    release: true,
    releaseName: 'v${version}',
  },
  npm: {
    publish: false,
  },
};
