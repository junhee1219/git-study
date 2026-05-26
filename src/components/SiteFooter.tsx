import styles from './SiteFooter.module.css'

const REPO_URL = 'https://github.com/junhee1219/git-study'
const CONTACT_EMAIL = 'leejunhee1219@kakao.com'

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.muted}>
          신입을 위한 Git 인터랙티브 가이드 · 한국어
        </span>
        <nav className={styles.links}>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[Git 인터랙티브 가이드] 문의')}`}
            className={styles.link}
          >
            문의 · {CONTACT_EMAIL}
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            GitHub →
          </a>
        </nav>
      </div>
    </footer>
  )
}
