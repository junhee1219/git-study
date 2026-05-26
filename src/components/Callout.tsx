import type { ReactNode } from 'react'
import styles from './Callout.module.css'

type Tone = 'info' | 'warn' | 'danger' | 'success'

type Props = {
  tone?: Tone
  title?: string
  children: ReactNode
}

const labels: Record<Tone, string> = {
  info: '메모',
  warn: '주의',
  danger: '함정',
  success: '핵심',
}

export function Callout({ tone = 'info', title, children }: Props) {
  return (
    <aside className={styles.callout} data-tone={tone}>
      <div className={styles.head}>
        <span className={styles.tag}>{title ?? labels[tone]}</span>
      </div>
      <div className={styles.body}>{children}</div>
    </aside>
  )
}
