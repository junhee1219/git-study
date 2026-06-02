import { useMemo, useState } from 'react'
import styles from './RebaseTodo.module.css'

type Action = 'pick' | 'reword' | 'squash' | 'fixup' | 'drop'
type Row = { id: string; msg: string; action: Action }

const ACTIONS: { value: Action; label: string; desc: string }[] = [
  { value: 'pick', label: 'pick', desc: '이 커밋 그대로 사용' },
  { value: 'reword', label: 'reword', desc: '커밋은 두되 메시지만 수정' },
  { value: 'squash', label: 'squash', desc: '위 커밋에 합치고 두 메시지 모두 유지' },
  { value: 'fixup', label: 'fixup', desc: '위 커밋에 합치되 이 메시지는 버림' },
  { value: 'drop', label: 'drop', desc: '이 커밋 삭제' },
]

let rid = 0
const mkId = () => {
  rid += 1
  return (0x71c + rid * 0x3a7).toString(16).slice(-7)
}

function initialRows(): Row[] {
  rid = 0
  return [
    { id: mkId(), msg: 'feat: 로그인 폼', action: 'pick' },
    { id: mkId(), msg: 'fix 오타', action: 'fixup' },
    { id: mkId(), msg: 'wip', action: 'fixup' },
    { id: mkId(), msg: 'asdf', action: 'drop' },
    { id: mkId(), msg: 'feat: 로그인 검증 추가', action: 'pick' },
  ]
}

type Group = { id: string; title: string; parts: { msg: string; kind: 'squash' | 'fixup' }[] }

export function RebaseTodo() {
  const [rows, setRows] = useState<Row[]>(initialRows)

  const setAction = (id: string, action: Action) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, action } : r)))

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= rows.length) return
    setRows((rs) => {
      const next = [...rs]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  const reset = () => setRows(initialRows())

  const { groups, leadingWarn } = useMemo(() => {
    const out: Group[] = []
    let cur: Group | null = null
    let warn = false
    for (const r of rows) {
      if (r.action === 'drop') continue
      if (r.action === 'squash' || r.action === 'fixup') {
        if (!cur) {
          warn = true
          cur = { id: r.id, title: r.msg, parts: [] }
          out.push(cur)
        } else {
          cur.parts.push({ msg: r.msg, kind: r.action })
        }
      } else {
        cur = {
          id: r.id,
          title: r.action === 'reword' ? `${r.msg} ✎` : r.msg,
          parts: [],
        }
        out.push(cur)
      }
    }
    return { groups: out, leadingWarn: warn }
  }, [rows])

  return (
    <div className={styles.wrap}>
      <div className={styles.cols}>
        <div className={styles.col}>
          <span className={styles.label}>
            git rebase -i HEAD~{rows.length} (편집 화면)
          </span>
          <span className={styles.subtle}>위 = 과거, 아래 = 최신. 순서도 바꿀 수 있다.</span>
          <ol className={styles.todo}>
            {rows.map((r, i) => (
              <li key={r.id} className={styles.todoRow} data-action={r.action}>
                <span className={styles.moveCol}>
                  <button
                    className={styles.moveBtn}
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="위로"
                  >
                    ↑
                  </button>
                  <button
                    className={styles.moveBtn}
                    onClick={() => move(i, 1)}
                    disabled={i === rows.length - 1}
                    aria-label="아래로"
                  >
                    ↓
                  </button>
                </span>
                <select
                  className={styles.select}
                  value={r.action}
                  onChange={(e) => setAction(r.id, e.target.value as Action)}
                >
                  {ACTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <code className={styles.rid}>{r.id}</code>
                <span className={styles.msg}>{r.msg}</span>
              </li>
            ))}
          </ol>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={reset}>
            리셋
          </button>
        </div>

        <div className={styles.col}>
          <span className={styles.label}>결과 히스토리</span>
          <span className={styles.subtle}>
            {rows.length}개 커밋 → <strong>{groups.length}개</strong>
          </span>
          <ol className={styles.result}>
            {groups.length === 0 && (
              <li className={styles.empty}>전부 drop 됨 — 커밋이 하나도 안 남음</li>
            )}
            {[...groups].reverse().map((g) => (
              <li key={g.id} className={styles.resultRow}>
                <span className={styles.cdot} />
                <div className={styles.resultBody}>
                  <span className={styles.resultTitle}>{g.title}</span>
                  {g.parts.map((p, i) => (
                    <span key={i} className={styles.part} data-kind={p.kind}>
                      {p.kind === 'squash'
                        ? `+ ${p.msg}`
                        : `+ (fixup) ${p.msg} — 메시지 버려짐`}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          {leadingWarn && (
            <p className={styles.warn}>
              ⚠ 맨 위(가장 오래된) 커밋을 squash/fixup 하려고 했다. 합칠 이전 커밋이
              없어 — 실제 git에서는 에러. 여기선 pick으로 처리했다.
            </p>
          )}
        </div>
      </div>

      <p className={styles.hint}>
        각 동작: <code>pick</code> 그대로 · <code>reword</code> 메시지만 수정 ·{' '}
        <code>squash</code> 위에 합치고 메시지 유지 · <code>fixup</code> 위에 합치고
        메시지 버림 · <code>drop</code> 삭제. <br />
        rebase는 커밋 해시를 전부 새로 만든다 — <strong>이미 push해서 공유한 브랜치엔
        하지 말 것.</strong>
      </p>
    </div>
  )
}
