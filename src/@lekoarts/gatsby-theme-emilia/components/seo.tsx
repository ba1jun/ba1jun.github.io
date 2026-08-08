import * as React from "react"
import { graphql, useStaticQuery } from "gatsby"
import EmojiFavicon from "../../../components/emoji-favicon"

type SiteMetadataQuery = {
  site: {
    siteMetadata: {
      siteTitle: string
      siteTitleAlt: string
      siteUrl: string
      siteDescription: string
      siteImage: string
      siteLanguage: string
      author: string
    }
  }
}

type SEOProps = {
  title?: string
  description?: string
  pathname?: string
  image?: string
  children?: React.ReactNode
}

const Seo = ({ title = ``, description = ``, pathname = ``, image = ``, children = null }: SEOProps) => {
  const data = useStaticQuery<SiteMetadataQuery>(graphql`
    query EmojiFaviconSiteMetadata {
      site {
        siteMetadata {
          siteTitle
          siteTitleAlt
          siteUrl
          siteDescription
          siteImage
          siteLanguage
          author
        }
      }
    }
  `)
  const site = data.site.siteMetadata
  const {
    siteTitle,
    siteTitleAlt: defaultTitle,
    siteUrl,
    siteDescription: defaultDescription,
    siteImage: defaultImage,
    author,
    siteLanguage,
  } = site

  const seo = {
    title: title ? `${title} | ${siteTitle}` : defaultTitle,
    description: description || defaultDescription,
    url: `${siteUrl}${pathname || ``}`,
    image: `${siteUrl}${image || defaultImage}`,
  }

  return (
    <>
      <html lang={siteLanguage} />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:type" content="website" />
      <meta property="og:image:alt" content={seo.description} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:image:alt" content={seo.description} />
      <meta name="twitter:creator" content={author} />
      <meta name="gatsby-theme" content="@lekoarts/gatsby-theme-emilia" />
      <EmojiFavicon />
      {children}
    </>
  )
}

export default Seo
