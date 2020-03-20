const pkg = require('../../package.json');

module.exports = {
  title: 'Entourage',
  base: '/entourage/',
  dest: 'public',
  themeConfig: {
    logo: '/entourage-logo.png',
    repo: pkg.repository.url,
    repoLabel: 'Git',
    docsDir: 'docs',
    nav: [
      { text: 'Readme', link: '/readme/' },
      { text: 'Server', link: '/server/' },
      { text: 'CLI', link: '/cli/' },
    ],
    sidebar: [
      ['/readme/', 'Readme'],
      ['/server/', 'Server'],
      ['/cli/', 'CLI'],
    ],
    serviceWorker: {
      updatePopup: true, // Boolean | Object, default to undefined.
      // If set to true, the default text config will be:
      updatePopup: {
        message: 'New content is available.',
        buttonText: 'Refresh',
      },
    },
  },
};
