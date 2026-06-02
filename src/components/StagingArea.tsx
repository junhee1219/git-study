import { useMemo, useState } from 'react'
import styles from './StagingArea.module.css'

type Trees = Record<string, string>

type FileDef = {
  name: string
  ignored?: boolean
}

// 파일 목록(고정). .env 는 .gitignore 대상.
const FILES: FileDef[] = [
  { name: 'README.md' },
  { name: 'app.js' },
  { name: '.env', ignored: true },
]

const IGNORED = new Set(FILES.filter((f) => f.ignored).map((f) => f.name))

const initialHead: Trees = {
  'README.md': '# my-project',
  'app.js': 'console.log(1)',
}
const initialWorking: Trees = {
  'README.md': '# my-project',
  'app.js': 'console.log(1)',
  '.env': 'SECRET=hunter2',
}

type Status = 'clean' | 'unstaged' | 'staged' | 'both' | 'untracked' | 'ignored'

const statusLabel: Record<Status, string> = {
  clean: '커밋됨',
  unstaged: '수정됨 (스테이징 안 됨)',
  staged: '스테이징됨',
  both: '스테이징됨 + 그 후 또 수정',
  untracked: '추적 안 됨 (untracked)',
  ignored: '무시됨 (.gitignore)',
}

const preview = (s: string | undefined) =>
  s === undefined ? '—' : s.length > 22 ? `${s.slice(0, 22)}…` : s || '(빈 파일)'

export function StagingArea() {
  // 초기 상태 = clone 직후: head=index 깨끗, working 에 untracked .env 하나
  const [head, setHead] = useState<Trees>(initialHead)
  const [index, setIndex] = useState<Trees>(initialHead)
  const [working, setWorking] = useState<Trees>(initialWorking)
  const [commits, setCommits] = useState<string[]>(['first'])
  const [message, setMessage] = useState('')

  const reset = () => {
    setHead({ ...initialHead })
    setIndex({ ...initialHead })
    setWorking({ ...initialWorking })
    setCommits(['first'])
    setMessage('')
  }

  const allNames = useMemo(() => {
    const set = new Set<string>([
      ...Object.keys(head),
      ...Object.keys(index),
      ...Object.keys(working),
      ...FILES.map((f) => f.name),
    ])
    // 안정적인 순서
    return FILES.map((f) => f.name).concat(
      [...set].filter((n) => !FILES.some((f) => f.name === n)),
    )
  }, [head, index, working])

  const statusOf = (n: string): Status => {
    if (IGNORED.has(n) && !(n in index) && !(n in head)) return 'ignored'
    const inHead = n in head
    const inIndex = n in index
    const stagedDiff = inIndex ? index[n] !== head[n] : inHead // 삭제 staged 포함
    const workingDiff = (working[n] ?? undefined) !== (index[n] ?? undefined)
    if (!inHead && !inIndex && n in working) return 'untracked'
    if (stagedDiff && workingDiff) return 'both'
    if (stagedDiff) return 'staged'
    if (workingDiff) return 'unstaged'
    return 'clean'
  }

  const stage = (n: string) => {
    if (IGNORED.has(n) && !(n in index) && !(n in head)) return // 무시 파일은 add 안 됨
    setIndex((idx) => {
      const next = { ...idx }
      if (n in working) next[n] = working[n]
      else delete next[n]
      return next
    })
  }

  const stageAll = () => {
    setIndex(() => {
      const next: Trees = {}
      for (const n of Object.keys(working)) {
        if (IGNORED.has(n) && !(n in head)) continue // add . 는 무시 파일 건너뜀
        next[n] = working[n]
      }
      // working 에서 사라진 추적 파일의 삭제도 반영
      return next
    })
  }

  const unstage = (n: string) => {
    setIndex((idx) => {
      const next = { ...idx }
      if (n in head) next[n] = head[n]
      else delete next[n]
      return next
    })
  }

  const editWorking = (n: string, content: string) => {
    setWorking((w) => ({ ...w, [n]: content }))
  }

  const indexDirty = useMemo(() => {
    const keys = new Set([...Object.keys(index), ...Object.keys(head)])
    for (const k of keys) if (index[k] !== head[k]) return true
    return false
  }, [index, head])

  const commit = () => {
    if (!indexDirty) return
    setHead({ ...index })
    setCommits((c) => [...c, message.trim() || `commit ${c.length + 1}`])
    setMessage('')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.legend}>
        <span>
          <code>git add</code> = 작업 디렉토리 → 스테이징
        </span>
        <span>
          <code>git commit</code> = 스테이징 → 새 커밋(HEAD)
        </span>
      </div>

      <div className={styles.tableHead}>
        <span className={styles.colFile}>파일</span>
        <span>작업 디렉토리</span>
        <span>스테이징 (index)</span>
        <span>최근 커밋 (HEAD)</span>
      </div>

      <div className={styles.rows}>
        {allNames.map((n) => {
          const st = statusOf(n)
          const canStage =
            (st === 'unstaged' || st === 'both' || st === 'untracked') &&
            !(IGNORED.has(n) && !(n in head))
          const canUnstage = st === 'staged' || st === 'both'
          return (
            <div key={n} className={styles.row} data-status={st}>
              <div className={styles.cellFile}>
                <span className={styles.fname}>{n}</span>
                <span className={styles.badge} data-status={st}>
                  {statusLabel[st]}
                </span>
              </div>

              <div className={styles.cell}>
                {n in working ? (
                  <input
                    className={styles.edit}
                    value={working[n]}
                    spellCheck={false}
                    disabled={st === 'ignored'}
                    onChange={(e) => editWorking(n, e.target.value)}
                  />
                ) : (
                  <span className={styles.gone}>(삭제됨)</span>
                )}
              </div>

              <div className={styles.cell}>
                <span className={styles.ro} data-empty={!(n in index)}>
                  {preview(index[n])}
                </span>
              </div>

              <div className={styles.cell}>
                <span className={styles.ro} data-empty={!(n in head)}>
                  {preview(head[n])}
                </span>
              </div>

              <div className={styles.cellActions}>
                {canStage && (
                  <button className={styles.miniBtn} onClick={() => stage(n)}>
                    git add
                  </button>
                )}
                {canUnstage && (
                  <button
                    className={`${styles.miniBtn} ${styles.miniGhost}`}
                    onClick={() => unstage(n)}
                  >
                    unstage
                  </button>
                )}
                {st === 'ignored' && (
                  <span className={styles.ignoredNote}>add 무시됨</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.bar}>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={stageAll}>
          git add .
        </button>
        <input
          className={styles.msg}
          placeholder="커밋 메시지 (선택)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && indexDirty) commit()
          }}
        />
        <button className={styles.btn} onClick={commit} disabled={!indexDirty}>
          git commit
        </button>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={reset}>
          리셋
        </button>
      </div>

      <div className={styles.log}>
        <span className={styles.logLabel}>커밋 히스토리</span>
        <span className={styles.logItems}>
          {commits.map((c, i) => (
            <code key={i} className={styles.logItem}>
              {c}
            </code>
          ))}
        </span>
      </div>

      <p className={styles.hint}>
        팁: 파일을 <strong>add 한 뒤 또 수정</strong>하면 "스테이징됨 + 그 후 또
        수정" 상태가 된다. 이때 커밋하면 <em>add 시점의 내용</em>만 들어간다 —
        스테이징의 핵심.
      </p>
    </div>
  )
}
