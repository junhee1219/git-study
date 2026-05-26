import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { chapterBySlug, chapters } from '../chapters'
import { NotFound } from './NotFound'
import styles from './ChapterPage.module.css'

type Props = {
  slug: string
}

export function ChapterPage({ slug }: Props) {
  const chapter = chapterBySlug(slug)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  if (!chapter) return <NotFound />

  const { Component } = chapter
  const index = chapters.findIndex((c) => c.slug === slug)
  const prev = index > 0 ? chapters[index - 1] : null
  const next = index < chapters.length - 1 ? chapters[index + 1] : null

  return (
    <article className={styles.chapter}>
      <header className={styles.head}>
        <Link to="/" className={styles.back}>
          ← 챕터 목록
        </Link>
        <div className={styles.meta}>
          <span className={styles.number}>Ch.{chapter.number}</span>
          <span className={styles.minutes}>약 {chapter.estimatedMinutes}분</span>
        </div>
        <h1 className={styles.title}>{chapter.title}</h1>
        <p className={styles.subtitle}>{chapter.subtitle}</p>
      </header>

      <div className={styles.body}>
        <Component />
      </div>

      <nav className={styles.pager}>
        {prev ? (
          <Link to={`/chapters/${prev.slug}`} className={styles.pagerItem}>
            <span className={styles.pagerLabel}>← 이전</span>
            <span className={styles.pagerTitle}>{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/chapters/${next.slug}`} className={styles.pagerItem} data-dir="next">
            <span className={styles.pagerLabel}>다음 →</span>
            <span className={styles.pagerTitle}>{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
