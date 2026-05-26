import { useMemo, useState } from 'react'
import { CommitGraph, type Commit, type BranchRef } from './CommitGraph'
import styles from './BranchPlayground.module.css'

type BranchColor = 'main' | 'feat' | 'hot' | 'exp'

type InternalCommit = {
  id: string
  parents: string[]
  branch: BranchColor
  lane: number
  message: string
}

type Branch = {
  name: string
  head: string
  color: BranchColor
  lane: number
}

type Head =
  | { type: 'branch'; name: string }
  | { type: 'detached'; commit: string }

type PlaygroundState = {
  commits: InternalCommit[]
  branches: Branch[]
  head: Head
}

const COLORS: BranchColor[] = ['feat', 'hot', 'exp']

let counter = 0
const nextId = () => {
  counter += 1
  return counter.toString(16).padStart(7, '0').slice(-7)
}

function makeInitial(): PlaygroundState {
  counter = 0
  const c1: InternalCommit = {
    id: nextId(),
    parents: [],
    branch: 'main',
    lane: 0,
    message: 'initial',
  }
  const c2: InternalCommit = {
    id: nextId(),
    parents: [c1.id],
    branch: 'main',
    lane: 0,
    message: 'second',
  }
  const main: Branch = { name: 'main', head: c2.id, color: 'main', lane: 0 }
  return {
    commits: [c1, c2],
    branches: [main],
    head: { type: 'branch', name: 'main' },
  }
}

export function BranchPlayground() {
  const [state, setState] = useState(makeInitial)
  const [newBranchName, setNewBranchName] = useState('')

  const currentBranch = (() => {
    if (state.head.type !== 'branch') return null
    const name = state.head.name
    return state.branches.find((b) => b.name === name) ?? null
  })()

  const currentCommitId =
    state.head.type === 'branch'
      ? currentBranch?.head
      : state.head.commit

  const log = useMemo(() => {
    const entries: string[] = []
    if (state.head.type === 'detached') {
      entries.push(`HEAD → ${state.head.commit} (detached)`)
    } else {
      entries.push(`HEAD → ${state.head.name} → ${currentBranch?.head}`)
    }
    for (const b of state.branches) {
      if (b.name === currentBranch?.name) continue
      entries.push(`${b.name} → ${b.head}`)
    }
    return entries
  }, [state, currentBranch])

  const commit = () => {
    if (!currentCommitId) return
    if (state.head.type === 'detached') return
    const branch = currentBranch
    if (!branch) return
    const id = nextId()
    const newCommit: InternalCommit = {
      id,
      parents: [currentCommitId],
      branch: branch.color,
      lane: branch.lane,
      message: `commit on ${branch.name}`,
    }
    setState((s) => ({
      ...s,
      commits: [...s.commits, newCommit],
      branches: s.branches.map((b) =>
        b.name === branch.name ? { ...b, head: id } : b,
      ),
    }))
  }

  const createBranch = () => {
    const name = newBranchName.trim()
    if (!name) return
    if (state.branches.some((b) => b.name === name)) return
    if (!currentCommitId) return
    const usedLanes = new Set(state.branches.map((b) => b.lane))
    let lane = 1
    while (usedLanes.has(lane)) lane += 1
    const colorPool = COLORS.filter(
      (c) => !state.branches.some((b) => b.color === c),
    )
    const color = colorPool[0] ?? 'exp'
    setState((s) => ({
      ...s,
      branches: [
        ...s.branches,
        { name, head: currentCommitId, color, lane },
      ],
    }))
    setNewBranchName('')
  }

  const checkout = (target: string) => {
    if (state.branches.some((b) => b.name === target)) {
      setState((s) => ({ ...s, head: { type: 'branch', name: target } }))
      return
    }
    if (state.commits.some((c) => c.id === target)) {
      setState((s) => ({ ...s, head: { type: 'detached', commit: target } }))
    }
  }

  const reset = () => setState(makeInitial())

  // CommitGraph expects oldest-first
  const graphCommits: Commit[] = state.commits.map((c) => ({
    id: c.id,
    parents: c.parents,
    branch: c.branch,
    lane: c.lane,
    label: c.message,
  }))

  const graphBranches: BranchRef[] = state.branches.map((b) => ({
    name: b.name,
    on: b.head,
    side: b.lane === 0 ? 'right' : 'right',
  }))

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <div className={styles.head}>
          <span className={styles.label}>명령</span>
          <span className={styles.muted}>HEAD: {log[0]}</span>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>git commit</div>
          <button
            className={styles.btn}
            onClick={commit}
            disabled={state.head.type === 'detached'}
          >
            현재 브랜치에 새 커밋
          </button>
          {state.head.type === 'detached' && (
            <p className={styles.warnText}>
              detached HEAD 상태 — 브랜치로 checkout 후 커밋해야 안전.
            </p>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>git branch &lt;이름&gt;</div>
          <div className={styles.row}>
            <input
              className={styles.input}
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="예: feature"
              onKeyDown={(e) => {
                if (e.key === 'Enter') createBranch()
              }}
            />
            <button
              className={styles.btn}
              onClick={createBranch}
              disabled={!newBranchName.trim()}
            >
              만들기
            </button>
          </div>
          <p className={styles.hintText}>
            현재 HEAD가 가리키는 커밋에 새 이름표를 붙입니다 (HEAD는 안 옮김).
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>git checkout</div>
          <div className={styles.branchList}>
            {state.branches.map((b) => (
              <button
                key={b.name}
                className={styles.branchBtn}
                data-active={
                  state.head.type === 'branch' && state.head.name === b.name
                }
                onClick={() => checkout(b.name)}
              >
                <span className={styles.branchDot} data-c={b.color} />
                {b.name}
              </button>
            ))}
          </div>
          <div className={styles.subTitle}>또는 commit으로 (detached)</div>
          <div className={styles.commitList}>
            {state.commits.map((c) => (
              <button
                key={c.id}
                className={styles.commitBtn}
                data-active={
                  state.head.type === 'detached' && state.head.commit === c.id
                }
                onClick={() => checkout(c.id)}
              >
                {c.id}
              </button>
            ))}
          </div>
        </div>

        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={reset}>
          전체 리셋
        </button>
      </div>

      <div className={styles.viz}>
        <div className={styles.head}>
          <span className={styles.label}>현재 상태</span>
        </div>
        <CommitGraph
          commits={graphCommits}
          branches={graphBranches}
          head={
            state.head.type === 'branch' ? state.head.name : undefined
          }
        />
        <div className={styles.refList}>
          {log.map((entry) => (
            <div key={entry} className={styles.ref}>
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
