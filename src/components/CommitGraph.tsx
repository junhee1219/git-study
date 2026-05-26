import { useMemo } from 'react'
import styles from './CommitGraph.module.css'

export type Commit = {
  id: string
  parents?: string[]
  /** which lane (column) — 0 is main. Auto-assigned if omitted. */
  lane?: number
  /** label under the node */
  label?: string
  /** tone via lane color, e.g. 'main' | 'feat' | 'hot' | 'exp' */
  branch?: 'main' | 'feat' | 'hot' | 'exp'
}

export type BranchRef = {
  name: string
  on: string
  /** which side: 'left' | 'right' — for visual offset */
  side?: 'left' | 'right'
}

type Props = {
  /** commits oldest-first */
  commits: Commit[]
  branches?: BranchRef[]
  head?: string
  width?: number
  laneGap?: number
  rowGap?: number
}

const branchColor: Record<NonNullable<Commit['branch']>, string> = {
  main: 'var(--branch-main)',
  feat: 'var(--branch-feat)',
  hot: 'var(--branch-hot)',
  exp: 'var(--branch-exp)',
}

export function CommitGraph({
  commits,
  branches = [],
  head,
  width = 520,
  laneGap = 56,
  rowGap = 56,
}: Props) {
  const layout = useMemo(() => {
    const byId = new Map(commits.map((c) => [c.id, c]))
    const positions = new Map<string, { x: number; y: number }>()
    const padX = 60
    const padY = 32
    commits.forEach((c, i) => {
      const lane = c.lane ?? 0
      positions.set(c.id, {
        x: padX + lane * laneGap,
        y: padY + i * rowGap,
      })
    })
    const height = padY * 2 + (commits.length - 1) * rowGap + 60
    return { positions, byId, height, padX }
  }, [commits, laneGap, rowGap])

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${width} ${layout.height}`}
        width="100%"
        height={layout.height}
        role="img"
        aria-label="커밋 그래프"
        className={styles.svg}
      >
        {/* edges */}
        {commits.flatMap((c) =>
          (c.parents ?? []).map((p) => {
            const a = layout.positions.get(c.id)
            const b = layout.positions.get(p)
            if (!a || !b) return null
            const parent = layout.byId.get(p)
            const color = parent?.branch ? branchColor[parent.branch] : 'var(--border)'
            const sameLane = a.x === b.x
            const d = sameLane
              ? `M ${a.x} ${a.y} L ${b.x} ${b.y}`
              : `M ${a.x} ${a.y} C ${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y}`
            return (
              <path
                key={`${c.id}-${p}`}
                d={d}
                stroke={color}
                strokeWidth={2}
                fill="none"
                opacity={0.7}
              />
            )
          }),
        )}

        {/* nodes */}
        {commits.map((c) => {
          const pos = layout.positions.get(c.id)
          if (!pos) return null
          const color = c.branch ? branchColor[c.branch] : 'var(--accent)'
          return (
            <g key={c.id} transform={`translate(${pos.x}, ${pos.y})`}>
              <circle r={10} fill="var(--bg)" stroke={color} strokeWidth={2.5} />
              <text
                x={16}
                y={4}
                fill="var(--text)"
                fontSize={12}
                fontFamily="var(--font-mono)"
              >
                {c.id}
              </text>
              {c.label && (
                <text
                  x={16}
                  y={22}
                  fill="var(--muted)"
                  fontSize={11}
                  fontFamily="var(--font-sans)"
                >
                  {c.label}
                </text>
              )}
            </g>
          )
        })}

        {/* branch refs */}
        {branches.map((b, i) => {
          const pos = layout.positions.get(b.on)
          if (!pos) return null
          const side = b.side ?? 'right'
          const offset = side === 'right' ? 120 : -90
          const isHead = head === b.name
          return (
            <g key={`${b.name}-${i}`} transform={`translate(${pos.x + offset}, ${pos.y})`}>
              <rect
                x={-4}
                y={-12}
                rx={4}
                width={b.name.length * 7 + 16 + (isHead ? 36 : 0)}
                height={22}
                fill="var(--panel-2)"
                stroke={isHead ? 'var(--accent-2)' : 'var(--border)'}
              />
              <text x={4} y={3} fill="var(--accent)" fontSize={11} fontFamily="var(--font-mono)">
                {b.name}
              </text>
              {isHead && (
                <text
                  x={4 + b.name.length * 7 + 6}
                  y={3}
                  fill="var(--accent-2)"
                  fontSize={11}
                  fontFamily="var(--font-mono)"
                >
                  HEAD
                </text>
              )}
              {/* connector */}
              <line
                x1={side === 'right' ? -4 : (b.name.length * 7 + 16 + (isHead ? 36 : 0)) - 4}
                y1={0}
                x2={side === 'right' ? -offset + 10 : -offset - 10}
                y2={0}
                stroke="var(--border)"
                strokeDasharray="3 3"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
