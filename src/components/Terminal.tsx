import { useEffect, useRef, useState } from 'react'
import styles from './Terminal.module.css'

export type TerminalLine =
  | { type: 'prompt'; text: string }
  | { type: 'output'; text: string }
  | { type: 'comment'; text: string }

type Props = {
  title?: string
  lines: TerminalLine[]
  typewriter?: boolean
  /** ms per character when typewriter is on */
  speed?: number
}

/**
 * Read-only terminal for showing scripted command sequences.
 * For freeform input we'll use a separate <Repl> later.
 */
export function Terminal({
  title = 'terminal',
  lines,
  typewriter = false,
  speed = 18,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(typewriter ? 0 : lines.length)
  const [partial, setPartial] = useState('')
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (!typewriter) {
      setVisibleCount(lines.length)
      return
    }
    setVisibleCount(0)
    setPartial('')
  }, [lines, typewriter])

  useEffect(() => {
    if (!typewriter) return
    if (visibleCount >= lines.length) return

    const current = lines[visibleCount]
    if (current.type !== 'prompt') {
      const t = window.setTimeout(() => setVisibleCount((v) => v + 1), 120)
      return () => window.clearTimeout(t)
    }

    let i = 0
    const text = current.text
    const tick = () => {
      i += 1
      setPartial(text.slice(0, i))
      if (i >= text.length) {
        window.setTimeout(() => {
          setPartial('')
          setVisibleCount((v) => v + 1)
        }, 200)
        return
      }
      timer.current = window.setTimeout(tick, speed)
    }
    timer.current = window.setTimeout(tick, speed)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [visibleCount, lines, typewriter, speed])

  const shown = lines.slice(0, visibleCount)

  return (
    <div className={styles.terminal}>
      <div className={styles.head}>
        <span className={styles.dot} data-c="r" />
        <span className={styles.dot} data-c="y" />
        <span className={styles.dot} data-c="g" />
        <span className={styles.title}>{title}</span>
      </div>
      <pre className={styles.body}>
        {shown.map((line, i) => (
          <Line key={i} line={line} />
        ))}
        {typewriter && partial && (
          <Line line={{ type: 'prompt', text: partial }} cursor />
        )}
      </pre>
    </div>
  )
}

function Line({
  line,
  cursor = false,
}: {
  line: TerminalLine
  cursor?: boolean
}) {
  if (line.type === 'prompt') {
    return (
      <div className={styles.line}>
        <span className={styles.sigil}>$</span>
        <span className={styles.cmd}>{line.text}</span>
        {cursor && <span className={styles.cursor}>▌</span>}
      </div>
    )
  }
  if (line.type === 'comment') {
    return <div className={styles.comment}># {line.text}</div>
  }
  return <div className={styles.output}>{line.text}</div>
}
