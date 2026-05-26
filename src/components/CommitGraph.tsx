import { useMemo, type ReactElement } from 'react'
import styles from './CommitGraph.module.css'

export type Commit = {
  id: string
  parents?: string[]
  lane?: number
  label?: string
  branch?: 'main' | 'feat' | 'hot' | 'exp'
}

export type BranchRef = {
  name: string
  on: string
  /** unused — kept for backwards compat */
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
  width,
  laneGap = 60,
  rowGap = 56,
}: Props) {
  const layout = useMemo(() => {
    const byId = new Map(commits.map((c) => [c.id, c]))
    const positions = new Map<string, { x: number; y: number }>()
    const padX = 36
    const padY = 28
    let maxLane = 0
    commits.forEach((c, i) => {
      const lane = c.lane ?? 0
      maxLane = Math.max(maxLane, lane)
      positions.set(c.id, {
        x: padX + lane * laneGap,
        y: padY + i * rowGap,
      })
    })
    const nodeColRight = padX + maxLane * laneGap + 28 // right edge of node area + commit id text
    const longestLabel = commits.reduce(
      (m, c) => Math.max(m, (c.label?.length ?? 0) * 7),
      0,
    )
    const labelAreaStart = nodeColRight + 100 // start of branch ref labels
    // Stack same-target branches horizontally
    const groups = new Map<string, BranchRef[]>()
    for (const b of branches) {
      const arr = groups.get(b.on) ?? []
      arr.push(b)
      groups.set(b.on, arr)
    }
    let maxBranchRight = labelAreaStart
    for (const arr of groups.values()) {
      let cur = labelAreaStart
      for (const b of arr) {
        const isHead = head === b.name
        const w = Math.max(b.name.length * 7.4 + 18 + (isHead ? 44 : 0), 56)
        cur += w + 8
        maxBranchRight = Math.max(maxBranchRight, cur)
      }
    }
    const computedWidth = Math.max(
      width ?? 0,
      nodeColRight + longestLabel + 24,
      maxBranchRight + 16,
      360,
    )
    const height = padY * 2 + (commits.length - 1) * rowGap + 50
    return {
      positions,
      byId,
      height,
      padX,
      width: computedWidth,
      groups,
      labelAreaStart,
    }
  }, [commits, branches, head, laneGap, rowGap, width])

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        preserveAspectRatio="xMinYMin meet"
        role="img"
        aria-label="커밋 그래프"
        className={styles.svg}
        style={{ width: '100%', height: 'auto', maxWidth: layout.width }}
      >
        {/* edges */}
        {commits.flatMap((c) =>
          (c.parents ?? []).map((p) => {
            const a = layout.positions.get(c.id)
            const b = layout.positions.get(p)
            if (!a || !b) return null
            const parent = layout.byId.get(p)
            const color = parent?.branch
              ? branchColor[parent.branch]
              : 'var(--border-strong)'
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
                opacity={0.85}
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
              <circle
                r={11}
                fill="var(--bg-1)"
                stroke={color}
                strokeWidth={2.5}
              />
              <circle r={4} fill={color} opacity={0.85} />
              <text
                x={18}
                y={4}
                fill="var(--text)"
                fontSize={12}
                fontFamily="var(--font-mono)"
              >
                {c.id}
              </text>
              {c.label && (
                <text
                  x={18}
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
        {Array.from(layout.groups.entries()).flatMap(([commitId, arr]) => {
          const pos = layout.positions.get(commitId)
          if (!pos) return []
          let cursor = layout.labelAreaStart
          const elements: ReactElement[] = []
          // connector from commit to first label
          elements.push(
            <line
              key={`conn-${commitId}`}
              x1={pos.x + 14}
              y1={pos.y}
              x2={layout.labelAreaStart - 4}
              y2={pos.y}
              stroke="var(--border-strong)"
              strokeDasharray="2 4"
              strokeWidth={1}
            />,
          )
          arr.forEach((b, i) => {
            const isHead = head === b.name
            const w = Math.max(b.name.length * 7.4 + 18 + (isHead ? 44 : 0), 56)
            const x = cursor
            cursor += w + 8
            elements.push(
              <g key={`${b.name}-${i}`} transform={`translate(${x}, ${pos.y})`}>
                <rect
                  x={-4}
                  y={-12}
                  rx={6}
                  width={w}
                  height={22}
                  fill={isHead ? 'var(--accent-2-soft)' : 'var(--panel-2)'}
                  stroke={isHead ? 'var(--accent-2)' : 'var(--border)'}
                />
                <text
                  x={6}
                  y={3}
                  fill={isHead ? 'var(--accent-2)' : 'var(--accent)'}
                  fontSize={11}
                  fontFamily="var(--font-mono)"
                >
                  {b.name}
                </text>
                {isHead && (
                  <text
                    x={6 + b.name.length * 7.4 + 6}
                    y={3}
                    fill="var(--accent-2)"
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    fontWeight={700}
                  >
                    HEAD
                  </text>
                )}
              </g>,
            )
          })
          return elements
        })}
      </svg>
    </div>
  )
}
