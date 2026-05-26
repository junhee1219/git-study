import { useState } from 'react'
import { CommitGraph, type Commit } from './CommitGraph'
import styles from './MergeDemo.module.css'

const baseCommits: Commit[] = [
  { id: '7a1f0c4', parents: [], branch: 'main', lane: 0, label: '초기 커밋' },
  {
    id: 'b3e2a91',
    parents: ['7a1f0c4'],
    branch: 'main',
    lane: 0,
    label: 'main #2',
  },
  {
    id: 'd5c8f02',
    parents: ['b3e2a91'],
    branch: 'main',
    lane: 0,
    label: 'main #3 (최신)',
  },
  {
    id: 'a40e1b3',
    parents: ['b3e2a91'],
    branch: 'feat',
    lane: 1,
    label: 'feat 분기 후 첫 커밋',
  },
  {
    id: 'c9d7e6f',
    parents: ['a40e1b3'],
    branch: 'feat',
    lane: 1,
    label: 'feat #2',
  },
]

const baseBranches = [
  { name: 'main', on: 'd5c8f02' as string },
  { name: 'feat', on: 'c9d7e6f' as string },
]

const mergeResult: Commit[] = [
  ...baseCommits,
  {
    id: 'e10ab44',
    parents: ['d5c8f02', 'c9d7e6f'],
    branch: 'main',
    lane: 0,
    label: 'merge commit (부모 2)',
  },
]

const mergeBranches = [
  { name: 'main', on: 'e10ab44' as string },
  { name: 'feat', on: 'c9d7e6f' as string },
]

const rebaseResult: Commit[] = [
  baseCommits[0]!,
  baseCommits[1]!,
  baseCommits[2]!,
  {
    id: '11f9a82',
    parents: ['d5c8f02'],
    branch: 'feat',
    lane: 0,
    label: "재적용된 a40e1b3 (새 해시)",
  },
  {
    id: '22b04c5',
    parents: ['11f9a82'],
    branch: 'feat',
    lane: 0,
    label: "재적용된 c9d7e6f (새 해시)",
  },
]

const rebaseBranches = [
  { name: 'main', on: 'd5c8f02' as string },
  { name: 'feat', on: '22b04c5' as string },
]

type Mode = 'before' | 'merge' | 'rebase'

export function MergeDemo() {
  const [mode, setMode] = useState<Mode>('before')

  const config = {
    before: {
      commits: baseCommits,
      branches: baseBranches,
      head: 'main',
      caption:
        'main과 feat이 b3e2a91 에서 갈라진 상태. 둘 다 새 커밋을 쌓았다.',
    },
    merge: {
      commits: mergeResult,
      branches: mergeBranches,
      head: 'main',
      caption:
        '"merge commit"이 새로 만들어진다. 부모가 둘 (d5c8f02, c9d7e6f) — 두 갈래를 모두 가리킨다. 기존 커밋은 그대로 보존.',
    },
    rebase: {
      commits: rebaseResult,
      branches: rebaseBranches,
      head: 'feat',
      caption:
        'feat의 커밋들이 main 끝(d5c8f02) 위에 새로 적용된다. 해시가 바뀐 새 커밋이 만들어지고 기존 a40e1b3 · c9d7e6f 는 ref 없는 객체가 되어 결국 GC.',
    },
  }[mode]

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        <button
          className={styles.tab}
          data-active={mode === 'before'}
          onClick={() => setMode('before')}
        >
          1. 분기 직후
        </button>
        <button
          className={styles.tab}
          data-active={mode === 'merge'}
          onClick={() => setMode('merge')}
        >
          2. <code>git merge feat</code>
        </button>
        <button
          className={styles.tab}
          data-active={mode === 'rebase'}
          onClick={() => setMode('rebase')}
        >
          3. <code>git rebase main</code> (feat에서)
        </button>
      </div>
      <CommitGraph
        commits={config.commits}
        branches={config.branches}
        head={config.head}
      />
      <p className={styles.caption}>{config.caption}</p>
    </div>
  )
}
