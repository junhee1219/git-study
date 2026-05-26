import { useEffect } from 'react'

type Props = {
  title: string
  description: string
  /** path relative to site root, e.g. "/chapters/objects". used for canonical + og:url */
  path?: string
  /** schema.org type — Article for chapters, WebSite for home */
  type?: 'website' | 'article'
  /** for Article schema */
  articleSection?: string
}

const SITE_URL = 'https://junhee1219.github.io/git-study'
const SITE_NAME = 'Git 인터랙티브 가이드'

function upsertMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as
    | HTMLMetaElement
    | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as
    | HTMLLinkElement
    | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(id: string, data: object) {
  let el = document.head.querySelector(`script[data-jsonld="${id}"]`) as
    | HTMLScriptElement
    | null
  if (!el) {
    el = document.createElement('script')
    el.setAttribute('type', 'application/ld+json')
    el.setAttribute('data-jsonld', id)
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export function SeoHead({
  title,
  description,
  path = '/',
  type = 'website',
  articleSection,
}: Props) {
  useEffect(() => {
    const fullTitle =
      path === '/' ? `${title} — 본질부터` : `${title} · ${SITE_NAME}`
    const url = SITE_URL + (path === '/' ? '/' : path)

    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:locale', 'ko_KR')
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertLink('canonical', url)

    if (type === 'article') {
      upsertJsonLd('article', {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: title,
        description,
        inLanguage: 'ko',
        url,
        isPartOf: {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL + '/',
        },
        articleSection: articleSection ?? 'Git',
        author: {
          '@type': 'Person',
          name: 'Junhee Lee',
        },
      })
    } else {
      upsertJsonLd('site', {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        description,
        url: SITE_URL + '/',
        inLanguage: 'ko',
      })
      // remove stale article LD if present
      const stale = document.head.querySelector('script[data-jsonld="article"]')
      if (stale) stale.remove()
    }
  }, [title, description, path, type, articleSection])

  return null
}
