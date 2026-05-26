import { useMemo, useState } from 'react'
import styles from './SnapshotStack.module.css'

type FileState = {
  name: string
  content: string
}

type Snapshot = {
  id: string
  message: string
  files: FileState[]
}

const initialFiles: FileState[] = [
  { name: 'README.md', content: '# my-project' },
  { name: 'app.js', content: 'console.log("hi")' },
]

const shortHash = (n: number) => {
  // deterministic-looking hash for demo
  const palette = '0123456789abcdef'
  let h = (n * 2654435761) >>> 0
  let out = ''
  for (let i = 0; i < 7; i += 1) {
    out += palette[h & 0xf]
    h >>>= 4
  }
  return out
}

export function SnapshotStack() {
  const [files, setFiles] = useState<FileState[]>(initialFiles)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [message, setMessage] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const isDirty = useMemo(() => {
    if (snapshots.length === 0) return files.some((f) => f.content !== '')
    const last = snapshots[snapshots.length - 1]
    if (last.files.length !== files.length) return true
    return last.files.some((lf, i) => {
      const cur = files[i]
      return !cur || cur.name !== lf.name || cur.content !== lf.content
    })
  }, [files, snapshots])

  const commit = () => {
    if (!isDirty) return
    const id = shortHash(snapshots.length + 1)
    const snap: Snapshot = {
      id,
      message: message.trim() || `commit ${snapshots.length + 1}`,
      files: files.map((f) => ({ ...f })),
    }
    setSnapshots((s) => [...s, snap])
    setMessage('')
    setActiveId(null)
  }

  const restore = (snap: Snapshot) => {
    setFiles(snap.files.map((f) => ({ ...f })))
    setActiveId(snap.id)
  }

  const reset = () => {
    setFiles(initialFiles)
    setSnapshots([])
    setActiveId(null)
    setMessage('')
  }

  const editFile = (i: number, content: string) => {
    setFiles((fs) => fs.map((f, idx) => (idx === i ? { ...f, content } : f)))
    setActiveId(null)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.editor}>
        <div className={styles.editorHead}>
          <span className={styles.label}>작업 디렉토리</span>
          {isDirty && <span className={styles.dirty}>● 변경됨</span>}
        </div>
        <div className={styles.files}>
          {files.map((f, i) => (
            <div key={f.name} className={styles.file}>
              <div className={styles.fileName}>{f.name}</div>
              <textarea
                className={styles.fileBody}
                value={f.content}
                onChange={(e) => editFile(i, e.target.value)}
                rows={3}
                spellCheck={false}
              />
            </div>
          ))}
        </div>
        <div className={styles.commitBar}>
          <input
            type="text"
            placeholder="커밋 메시지 (선택)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.msgInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isDirty) commit()
            }}
          />
          <button onClick={commit} disabled={!isDirty} className={styles.btn}>
            git commit
          </button>
          <button onClick={reset} className={`${styles.btn} ${styles.btnGhost}`}>
            리셋
          </button>
        </div>
      </div>

      <div className={styles.stack}>
        <div className={styles.stackHead}>
          <span className={styles.label}>스냅샷 히스토리</span>
          <span className={styles.muted}>위가 최신</span>
        </div>
        {snapshots.length === 0 && (
          <div className={styles.empty}>
            아직 스냅샷이 없어요. 파일을 고치고 <code>git commit</code>을 눌러보세요.
          </div>
        )}
        <ol className={styles.snapList}>
          {[...snapshots].reverse().map((s) => (
            <li
              key={s.id}
              className={styles.snap}
              data-active={activeId === s.id}
            >
              <button onClick={() => restore(s)} className={styles.snapBtn}>
                <div className={styles.snapHead}>
                  <span className={styles.snapHash}>{s.id}</span>
                  <span className={styles.snapMsg}>{s.message}</span>
                </div>
                <div className={styles.snapFiles}>
                  {s.files.map((f) => (
                    <div key={f.name} className={styles.snapFile}>
                      <span className={styles.snapFileName}>{f.name}</span>
                      <span className={styles.snapFilePreview}>
                        {f.content.slice(0, 40) || <em>(빈 파일)</em>}
                        {f.content.length > 40 && '…'}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            </li>
          ))}
        </ol>
        {snapshots.length > 0 && (
          <p className={styles.hint}>
            ↑ 클릭하면 그 시점의 파일 상태로 되돌아갑니다 (= 그 스냅샷이 통째로
            복원됨)
          </p>
        )}
      </div>
    </div>
  )
}
