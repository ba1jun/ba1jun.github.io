import type { GatsbyConfig, PluginRef } from "gatsby"
import "dotenv/config"

const shouldAnalyseBundle = process.env.ANALYSE_BUNDLE

const config: GatsbyConfig = {
  siteMetadata: {
    // You can overwrite values here that are used for the SEO component
    // You can also add new values here to query them like usual
    // See all options: https://github.com/LekoArts/gatsby-themes/blob/main/themes/gatsby-theme-emilia-core/gatsby-config.mjs
    siteTitle: `Jun Bai`,
    siteTitleAlt: `Juniverse - Photography, research, and notes by Jun Bai`,
    siteHeadline: `Juniverse`,
    siteUrl: `https://ba1jun.github.io`,
    siteDescription: `Photography, research, and notes by Jun Bai.`,
    siteImage: `/banner.jpg`,
    siteLanguage: `en`,
    author: `@Jun_Ba1`,
  },
  trailingSlash: `always`,
  plugins: [
    {
      resolve: `@lekoarts/gatsby-theme-emilia`,
      // See the theme's README for all available options
      options: {
        name: `Jun Bai`,
        location: `Beijing`,
        socialMedia: [
          { title: `Research`, href: `/research/` },
          { title: `Scholar`, href: `https://scholar.google.com/citations?user=D4WEfiEAAAAJ` },
          { title: `GitHub`, href: `https://github.com/ba1jun` },
          { title: `Email`, href: `mailto:baijun@bigai.ai` },
        ],
        showThemeAuthor: true,
        formatString: `YYYY`,
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        output: `/`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Juniverse - Jun Bai`,
        short_name: `Juniverse`,
        description: `Photography, research, and notes by Jun Bai.`,
        start_url: `/`,
        background_color: `#fff`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        // theme_color: `#3182ce`,
        display: `standalone`,
        icons: [
          {
            src: `/android-chrome-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/android-chrome-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      },
    },
    // You can remove this plugin if you don't need it
    shouldAnalyseBundle && {
      resolve: `gatsby-plugin-webpack-statoscope`,
      options: {
        saveReportTo: `${__dirname}/public/.statoscope/_bundle.html`,
        saveStatsTo: `${__dirname}/public/.statoscope/_stats.json`,
        open: false,
      },
    },
  ].filter(Boolean) as Array<PluginRef>,
}

export default config
