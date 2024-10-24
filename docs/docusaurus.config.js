// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
import { themes } from "prism-react-renderer";
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Done3",
  tagline: "Behavioural tracking for high performance habits",
  url: "https://docs.done3.tznc.net",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "/", // Set this value to '/'.
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        gtag: {
          trackingID: "G-RN5Z5Z9D4T",
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Done3",
        items: [
          {
            type: "doc",
            docId: "intro/index",
            position: "left",
            label: "User Docs",
          },
          {
            position: "right",
            label: "App",
            to: "https://done3.tznc.net/app",
          },
          {
            href: "https://github.com/ziinc/done3",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "User Docs",
                to: "/",
              },
              {
                label: "Terms and Conditions",
                to: "/terms",
              },
              {
                label: "Privacy Policy",
                to: "/privacy",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Done3. Built by Ziinc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,

        additionalLanguages: ["bash", "diff", "json"],
      },
    }),
};

module.exports = config;
