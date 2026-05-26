import styles from './SiteFooter.module.css'

const REPO_URL = 'https://github.com/junhee1219/git-study'

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.muted}>
          신입을 위한 Git 인터랙티브 가이드 · 한국어
        </span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          GitHub →
        </a>
      </div>
    </footer>
  )
}
