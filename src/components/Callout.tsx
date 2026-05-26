import type { ReactNode } from 'react'
import styles from './Callout.module.css'

type Tone = 'info' | 'warn' | 'danger' | 'success'

type Props = {
  tone?: Tone
  title?: string
  children: ReactNode
}

const defaultLabels: Record<Tone, string> = {
  info: '메모',
  warn: '주의',
  danger: '함정',
  success: '핵심',
}

export function Callout({ tone = 'info', title, children }: Props) {
  return (
    <aside className={styles.callout} data-tone={tone}>
      <span className={styles.chip} aria-hidden="true">
        <span className={styles.chipDot} />
        {title ?? defaultLabels[tone]}
      </span>
      <div className={styles.body}>{children}</div>
    </aside>
  )
}
