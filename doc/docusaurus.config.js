// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const config = {
  title: 'React + Go',
  tagline: '基础功能开箱即用，快速交付业务系统',
  url: 'https://reactgo.headless.pub',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'lucky-byte',
  projectName: 'reactgo',

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/lucky-byte/reactgo/tree/main/doc/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/lucky-byte/reactgo/tree/main/doc/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig: ({
    navbar: {
      title: 'ReactGo',
      logo: { alt: 'Logo', src: 'img/logo.png' },
      items: [
        { type: 'doc', docId: 'intro', position: 'left', label: '指南', },
        { to: '/blog', label: '博客', position: 'left' },
        {
          href: 'https://github.com/lucky-byte/reactgo',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: '指南', to: '/docs/intro',
            },
          ],
        },
        {
          title: '社区',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: '博客', to: '/blog',
            },
            {
              label: 'GitHub', href: 'https://github.com/lucky-byte/reactgo',
            },
          ],
        },
      ],
      copyright: `版权所有 &copy; ${new Date().getFullYear()} ReactGo 项目.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  }),
};

module.exports = config;
