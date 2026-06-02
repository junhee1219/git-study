import { useState } from 'react'
import styles from './ResetPlayground.module.css'

type Commit = { id: string; label: string }
type Reflog = { id: number; text: string; to: number }
type Mode = 'soft' | 'mixed' | 'hard'

let cid = 0
const mkId = () => {
  cid += 1
  return (0x9a3 + cid * 0x4f1).toString(16).slice(-7)
}

function initialCommits(): Commit[] {
  cid = 0
  return [
    { id: mkId(), label: 'init' },
    { id: mkId(), label: 'feat: 로그인' },
    { id: mkId(), label: 'feat: 결제' },
    { id: mkId(), label: 'wip: 디버그 로그' },
  ]
}

const modeDesc: Record<Mode, string> = {
  soft: 'HEAD만 이동. index·작업 디렉토리 그대로 → 되돌린 변경이 staged 로 남음',
  mixed: 'HEAD + index 이동. 작업 디렉토리 그대로 → 되돌린 변경이 unstaged 로 남음',
  hard: 'HEAD + index + 작업 디렉토리 전부 이동 → 되돌린 변경 사라짐 (reflog로 복구)',
}

export function ResetPlayground() {
  const [commits, setCommits] = useState<Commit[]>(initialCommits)
  const [head, setHead] = useState(3)
  const [indexAt, setIndexAt] = useState(3)
  const [workingAt, setWorkingAt] = useState(3)
  const [target, setTarget] = useState<number | null>(null)
  const [reflog, setReflog] = useState<Reflog[]>([
    { id: 0, text: 'commit: wip: 디버그 로그', to: 3 },
  ])
  const [logSeq, setLogSeq] = useState(1)

  const pushReflog = (text: string, to: number) => {
    setReflog((r) => [{ id: logSeq, text, to }, ...r])
    setLogSeq((n) => n + 1)
  }

  const reset = () => {
    setCommits(initialCommits())
    setHead(3)
    setIndexAt(3)
    setWorkingAt(3)
    setTarget(null)
    setReflog([{ id: 0, text: 'commit: wip: 디버그 로그', to: 3 }])
    setLogSeq(1)
  }

  const doReset = (mode: Mode) => {
    if (target === null || target === head) return
    setHead(target)
    if (mode !== 'soft') setIndexAt(target)
    if (mode === 'hard') setWorkingAt(target)
    pushReflog(`reset --${mode}: → ${commits[target].id}`, target)
    setTarget(null)
  }

  const revert = () => {
    if (head !== commits.length - 1) return // 데모: 팁에서만 revert
    const nc: Commit = { id: mkId(), label: `Revert "${commits[head].label}"` }
    const newIdx = commits.length
    setCommits((c) => [...c, nc])
    setHead(newIdx)
    setIndexAt(newIdx)
    setWorkingAt(newIdx)
    pushReflog(`revert: ${nc.label}`, newIdx)
  }

  const recover = (to: number) => {
    setHead(to)
    setIndexAt(to)
    setWorkingAt(to)
    pushReflog(`reset --hard (reflog 복구): → ${commits[to].id}`, to)
  }

  const treeStatus =
    indexAt > head && workingAt > head
      ? { kind: 'staged', text: `'${commits[Math.max(indexAt, workingAt)].label}'의 변경이 staged 상태로 남아있음` }
      : indexAt === head && workingAt > head
        ? { kind: 'unstaged', text: `'${commits[workingAt].label}'의 변경이 작업 디렉토리(unstaged)에 남아있음` }
        : indexAt === head && workingAt === head
          ? { kind: 'clean', text: '작업 디렉토리 깨끗 (HEAD = index = working)' }
          : { kind: 'mixed', text: 'index와 작업 디렉토리가 HEAD와 다름' }

  return (
    <div className={styles.wrap}>
      <div className={styles.trees}>
        {(
          [
            ['HEAD', head, 'HEAD가 가리키는 커밋 (브랜치 끝)'],
            ['index (staging)', indexAt, 'git add 로 쌓인 스냅샷'],
            ['작업 디렉토리', workingAt, '지금 파일들의 실제 내용'],
          ] as const
        ).map(([name, at, desc]) => (
          <div key={name} className={styles.tree} data-diverged={at !== head}>
            <span className={styles.treeName}>{name}</span>
            <span className={styles.treeCommit}>
              <code>{commits[at].id}</code> {commits[at].label}
            </span>
            <span className={styles.treeDesc}>{desc}</span>
          </div>
        ))}
      </div>

      <div className={styles.statusBar} data-kind={treeStatus.kind}>
        {treeStatus.text}
      </div>

      <div className={styles.body}>
        <div className={styles.graphCol}>
          <span className={styles.label}>커밋 히스토리 (커밋을 눌러 target 선택)</span>
          <ol className={styles.commits}>
            {commits.map((_, i) => i).reverse().map((i) => {
              const c = commits[i]
              const orphaned = i > head
              const isHead = i === head
              const isTarget = i === target
              return (
                <li
                  key={c.id}
                  className={styles.commit}
                  data-orphaned={orphaned}
                  data-head={isHead}
                  data-target={isTarget}
                  onClick={() => setTarget(i === head ? null : i)}
                >
                  <span className={styles.cdot} />
                  <code className={styles.ccid}>{c.id}</code>
                  <span className={styles.clabel}>{c.label}</span>
                  <span className={styles.crefs}>
                    {isHead && <span className={styles.refHead}>HEAD → main</span>}
                    {orphaned && <span className={styles.refOrphan}>reflog로 복구 가능</span>}
                    {isTarget && <span className={styles.refTarget}>target</span>}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>

        <div className={styles.controls}>
          <span className={styles.label}>
            git reset {target !== null ? `--<mode> ${commits[target].id}` : '<target 선택>'}
          </span>
          {(['soft', 'mixed', 'hard'] as Mode[]).map((m) => (
            <button
              key={m}
              className={`${styles.btn} ${m === 'hard' ? styles.btnDanger : ''}`}
              disabled={target === null || target === head}
              onClick={() => doReset(m)}
              title={modeDesc[m]}
            >
              reset --{m}
            </button>
          ))}
          <p className={styles.modeNote}>
            {target !== null && target !== head
              ? '버튼에 마우스를 올리면 각 모드 설명이 나온다.'
              : '되돌릴 과거 커밋을 먼저 클릭해 target으로 선택.'}
          </p>

          <span className={styles.label}>안전한 대안</span>
          <button
            className={`${styles.btn} ${styles.btnGhost}`}
            disabled={head !== commits.length - 1}
            onClick={revert}
            title="과거를 안 지우고, 되돌리는 새 커밋을 앞에 추가"
          >
            git revert HEAD
          </button>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={reset}>
            전체 리셋
          </button>
        </div>
      </div>

      <div className={styles.reflog}>
        <span className={styles.label}>git reflog (HEAD가 거쳐온 모든 자리 — 클릭하면 복구)</span>
        <ol className={styles.reflogList}>
          {reflog.map((r, i) => (
            <li key={r.id} className={styles.reflogItem}>
              <code className={styles.reflogRef}>HEAD@{`{${i}}`}</code>
              <span className={styles.reflogText}>{r.text}</span>
              <button className={styles.reflogBtn} onClick={() => recover(r.to)}>
                여기로 복구
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
