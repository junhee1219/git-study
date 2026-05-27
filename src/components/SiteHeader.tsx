import { Link, useLocation } from 'react-router-dom'
import { chapters } from '../chapters'
import styles from './SiteHeader.module.css'

const REPO_URL = 'https://github.com/junhee1219/git-study'

export function SiteHeader() {
  const location = useLocation()
  const chapterMatch = location.pathname.match(/^\/chapters\/(.+)$/)
  const currentSlug = chapterMatch?.[1]
  const currentIndex = currentSlug
    ? chapters.findIndex((c) => c.slug === currentSlug)
    : -1

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <circle cx="6" cy="5" r="2.4" fill="currentColor" />
              <circle cx="6" cy="19" r="2.4" fill="currentColor" />
              <circle cx="18" cy="12" r="2.4" fill="currentColor" />
              <path
                d="M6 7.5v9M6 12h6M18 14.4V19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className={styles.brandText}>냥사원의 Git 분투기</span>
        </Link>

        {currentIndex >= 0 && (
          <div className={styles.progress} aria-label="챕터 진행도">
            {chapters.map((c, i) => (
              <Link
                key={c.slug}
                to={`/chapters/${c.slug}`}
                className={styles.dot}
                data-active={i === currentIndex}
                data-passed={i < currentIndex}
                title={`Ch.${c.number} ${c.title}`}
                aria-label={`Ch.${c.number} ${c.title}`}
              >
                <span className={styles.dotInner} />
              </Link>
            ))}
          </div>
        )}

        <div className={styles.nav}>
          <Link to="/" className={styles.navLink}>
            홈
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navLink}
            title="GitHub 저장소"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.04c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.08 0 4.42-2.68 5.39-5.24 5.67.41.36.78 1.07.78 2.15v3.18c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}
