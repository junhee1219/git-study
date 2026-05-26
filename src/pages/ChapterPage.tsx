import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { chapterBySlug, chapters } from '../chapters'
import { SeoHead } from '../components/SeoHead'
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
      <SeoHead
        title={`Ch.${chapter.number} ${chapter.title}`}
        description={chapter.seoDescription}
        path={`/chapters/${chapter.slug}`}
        type="article"
        articleSection="Git"
      />
      <header className={styles.head}>
        <div className={styles.crumbs}>
          <Link to="/" className={styles.crumb}>
            홈
          </Link>
          <span className={styles.crumbSep}>/</span>
          <span className={styles.crumbCurrent}>Ch.{chapter.number}</span>
        </div>
        <h1 className={styles.title}>{chapter.title}</h1>
        <p className={styles.subtitle}>{chapter.subtitle}</p>
        <div className={styles.meta}>
          <span className={styles.metaPill}>
            <span className={styles.metaLabel}>읽기 시간</span>
            <span className={styles.metaValue}>약 {chapter.estimatedMinutes}분</span>
          </span>
          {chapter.prerequisites.length > 0 && (
            <span className={styles.metaPill}>
              <span className={styles.metaLabel}>선행 챕터</span>
              <span className={styles.metaValue}>
                {chapter.prerequisites.map((slug) => (
                  <Link
                    key={slug}
                    to={`/chapters/${slug}`}
                    className={styles.metaLink}
                  >
                    {slug}
                  </Link>
                ))}
              </span>
            </span>
          )}
        </div>
      </header>

      <div className={styles.body}>
        <Component />
      </div>

      <nav className={styles.pager}>
        {prev ? (
          <Link to={`/chapters/${prev.slug}`} className={styles.pagerItem}>
            <span className={styles.pagerLabel}>← 이전</span>
            <span className={styles.pagerNum}>Ch.{prev.number}</span>
            <span className={styles.pagerTitle}>{prev.title}</span>
          </Link>
        ) : (
          <Link to="/" className={styles.pagerItem}>
            <span className={styles.pagerLabel}>← 홈으로</span>
            <span className={styles.pagerTitle}>학습 경로 보기</span>
          </Link>
        )}
        {next ? (
          <Link to={`/chapters/${next.slug}`} className={styles.pagerItem} data-dir="next">
            <span className={styles.pagerLabel}>다음 →</span>
            <span className={styles.pagerNum}>Ch.{next.number}</span>
            <span className={styles.pagerTitle}>{next.title}</span>
          </Link>
        ) : (
          <Link to="/" className={styles.pagerItem} data-dir="next">
            <span className={styles.pagerLabel}>완주! →</span>
            <span className={styles.pagerTitle}>홈으로 돌아가기</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
