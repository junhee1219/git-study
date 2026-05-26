import { useState } from 'react'
import styles from './WorktreeSim.module.css'

type Worktree = {
  path: string
  branch: string
  isMain: boolean
}

const initialWorktrees: Worktree[] = [
  { path: '/project', branch: 'main', isMain: true },
]

export function WorktreeSim() {
  const [worktrees, setWorktrees] = useState<Worktree[]>(initialWorktrees)
  const [path, setPath] = useState('../hot')
  const [branch, setBranch] = useState('hotfix')

  const add = () => {
    const p = path.trim()
    const b = branch.trim()
    if (!p || !b) return
    if (worktrees.some((w) => w.path === p)) return
    if (worktrees.some((w) => w.branch === b)) return // git's rule: same branch can't be in 2 worktrees
    setWorktrees((ws) => [...ws, { path: p, branch: b, isMain: false }])
  }

  const remove = (p: string) => {
    setWorktrees((ws) => ws.filter((w) => w.path !== p))
  }

  const reset = () => {
    setWorktrees(initialWorktrees)
    setPath('../hot')
    setBranch('hotfix')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <div className={styles.head}>
          <span className={styles.label}>명령</span>
        </div>
        <div className={styles.section}>
          <div className={styles.cmd}>git worktree add &lt;path&gt; &lt;branch&gt;</div>
          <div className={styles.row}>
            <input
              className={styles.input}
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="path"
            />
            <input
              className={styles.input}
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="branch"
            />
            <button className={styles.btn} onClick={add}>
              add
            </button>
          </div>
          {worktrees.some((w) => w.branch === branch.trim()) && (
            <p className={styles.warn}>
              ※ 같은 브랜치는 두 worktree에 동시에 체크아웃할 수 없음 (git의 규칙).
            </p>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.cmd}>git worktree list</div>
          <ul className={styles.list}>
            {worktrees.map((w) => (
              <li key={w.path} className={styles.listItem}>
                <span className={styles.itemPath}>{w.path}</span>
                <span className={styles.itemBranch}>[{w.branch}]</span>
                {!w.isMain && (
                  <button
                    className={styles.removeBtn}
                    onClick={() => remove(w.path)}
                    title="git worktree remove"
                  >
                    remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={reset}>
          전체 리셋
        </button>
      </div>

      <div className={styles.fs}>
        <div className={styles.head}>
          <span className={styles.label}>파일시스템</span>
          <span className={styles.muted}>객체 DB는 메인에만, 나머진 포인터</span>
        </div>
        <pre className={styles.tree}>
{worktrees.map((w, i) => renderTree(w, i === 0, worktrees)).join('')}
        </pre>
      </div>
    </div>
  )
}

function renderTree(w: Worktree, _isMain: boolean, all: Worktree[]) {
  if (w.isMain) {
    return [
      `${w.path}/                  ← main worktree (브랜치: ${w.branch})`,
      `├── src/`,
      `├── README.md`,
      `└── .git/`,
      `    ├── objects/            ← 모든 객체 (공유 ✦)`,
      `    ├── refs/heads/         ← 브랜치 ref 전부`,
      `    ├── HEAD                ← main worktree의 HEAD`,
      `    └── worktrees/`,
      ...all
        .filter((x) => !x.isMain)
        .map((x) => `        └── ${nameOf(x.path)}/        ← ${x.path}'s HEAD/index`),
      '',
      '',
    ].join('\n')
  }
  return [
    `${w.path}/                  ← 별도 worktree (브랜치: ${w.branch})`,
    `├── src/                    ← 워킹트리 (이 브랜치의 파일들)`,
    `├── README.md`,
    `└── .git                    ← 텍스트 파일! "gitdir: <메인>/.git/worktrees/${nameOf(w.path)}"`,
    '',
    '',
  ].join('\n')
}

function nameOf(path: string) {
  return path.split('/').filter(Boolean).pop() ?? path
}
