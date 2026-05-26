import type { ReactNode } from 'react'
import styles from './DialogueScene.module.css'

type Who = '도훈' | '박 차장' | '내레이션'
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

export function Line({ who, tone = 'normal', children }: LineProps) {
  const isNarration = who === '내레이션'
  if (isNarration) {
    return <p className={styles.narration}>{children}</p>
  }
  const avatarChar = who === '도훈' ? '도' : '박'
  const avatarKind = who === '도훈' ? 'dohun' : 'boss'
  return (
    <div className={styles.line} data-who={avatarKind}>
      <span className={styles.avatar} data-who={avatarKind}>
        {avatarChar}
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
