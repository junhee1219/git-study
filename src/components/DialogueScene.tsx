import type { ReactNode } from 'react'
import styles from './DialogueScene.module.css'

type Who = '냥사원' | '냥부장' | '내레이션'
type Tone =
  | 'confident'
  | 'panic'
  | 'dry'
  | 'curious'
  | 'sigh'
  | 'normal'
  | 'narration'

type LineProps = {
  who: Who
  tone?: Tone
  children: ReactNode
}

function CatJunior() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
      <polygon points="6,8 10,4 11,10" fill="currentColor" />
      <polygon points="26,8 22,4 21,10" fill="currentColor" />
      <ellipse cx="16" cy="18" rx="10" ry="9" fill="currentColor" />
      <circle cx="12.5" cy="17" r="1.8" fill="#0d1117" />
      <circle cx="19.5" cy="17" r="1.8" fill="#0d1117" />
      <circle cx="13" cy="16.5" r="0.6" fill="#fff" />
      <circle cx="20" cy="16.5" r="0.6" fill="#fff" />
      <path
        d="M14.5 21 Q16 22.5 17.5 21"
        stroke="#0d1117"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CatSenior() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
      <polygon points="6,8 10,4 11,10" fill="currentColor" />
      <polygon points="26,8 22,4 21,10" fill="currentColor" />
      <ellipse cx="16" cy="18" rx="10" ry="9" fill="currentColor" />
      <path
        d="M10.8 17 L14.2 17"
        stroke="#0d1117"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17.8 17 L21.2 17"
        stroke="#0d1117"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14.5 21.5 L16 22 L17.5 21.5"
        stroke="#0d1117"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <line x1="6" y1="20" x2="11" y2="20.4" stroke="#0d1117" strokeWidth="0.6" />
      <line x1="6" y1="21.6" x2="11" y2="21.4" stroke="#0d1117" strokeWidth="0.6" />
      <line x1="26" y1="20" x2="21" y2="20.4" stroke="#0d1117" strokeWidth="0.6" />
      <line x1="26" y1="21.6" x2="21" y2="21.4" stroke="#0d1117" strokeWidth="0.6" />
    </svg>
  )
}

export function Line({ who, tone = 'normal', children }: LineProps) {
  if (who === '내레이션') {
    return <p className={styles.narration}>{children}</p>
  }
  const isJunior = who === '냥사원'
  return (
    <div className={styles.line} data-who={isJunior ? 'junior' : 'senior'}>
      <span
        className={styles.avatar}
        data-who={isJunior ? 'junior' : 'senior'}
        aria-hidden="true"
      >
        {isJunior ? <CatJunior /> : <CatSenior />}
      </span>
      <div className={styles.lineBody}>
        <span className={styles.who}>{who}</span>
        <p className={styles.text} data-tone={tone}>
          {children}
        </p>
      </div>
    </div>
  )
}

type SceneProps = {
  title?: string
  children: ReactNode
}

export function DialogueScene({ title, children }: SceneProps) {
  return (
    <aside className={styles.scene}>
      {title && (
        <header className={styles.sceneHead}>
          <span className={styles.sceneChip}>EP</span>
          <span className={styles.sceneTitle}>{title}</span>
        </header>
      )}
      <div className={styles.sceneBody}>{children}</div>
    </aside>
  )
}
