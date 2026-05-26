import { useMemo, useState } from 'react'
import styles from './ObjectInspector.module.css'

type FileEntry = { name: string; content: string }

const initialFiles: FileEntry[] = [
  { name: 'README.md', content: '# demo\n' },
  { name: 'app.js', content: 'console.log("hi")\n' },
  { name: 'COPY.md', content: '# demo\n' },
]

/**
 * FNV-1a 32-bit hash → 7 hex chars. Deterministic, so same content → same hash.
 * Not cryptographic, but for visualization it behaves like git's content addressing.
 */
function shortHash(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  // mix again for better distribution
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

function blobHash(content: string) {
  return shortHash(`blob ${content.length}\0${content}`)
}

function treeHash(entries: { name: string; blob: string }[]) {
  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name))
  const payload = sorted.map((e) => `100644 blob ${e.blob}\t${e.name}`).join('\n')
  return shortHash(`tree ${payload.length}\0${payload}`)
}

function commitHash(tree: string, parent: string | null, message: string) {
  const payload = [`tree ${tree}`, parent ? `parent ${parent}` : '', `message ${message}`]
    .filter(Boolean)
    .join('\n')
  return shortHash(`commit ${payload.length}\0${payload}`)
}

type Commit = {
  id: string
  tree: string
  parent: string | null
  message: string
  blobs: { name: string; blob: string; preview: string }[]
}

export function ObjectInspector() {
  const [files, setFiles] = useState<FileEntry[]>(initialFiles)
  const [commits, setCommits] = useState<Commit[]>([])
  const [message, setMessage] = useState('first commit')

  const currentBlobs = useMemo(
    () =>
      files.map((f) => ({
        name: f.name,
        blob: blobHash(f.content),
        preview: f.content,
      })),
    [files],
  )

  const uniqueBlobs = useMemo(() => {
    const seen = new Map<string, { hash: string; content: string; users: string[] }>()
    for (const b of currentBlobs) {
      const existing = seen.get(b.blob)
      if (existing) {
        existing.users.push(b.name)
      } else {
        seen.set(b.blob, {
          hash: b.blob,
          content: b.preview,
          users: [b.name],
        })
      }
    }
    return Array.from(seen.values())
  }, [currentBlobs])

  const currentTree = useMemo(() => treeHash(currentBlobs), [currentBlobs])

  const head = commits.length > 0 ? commits[commits.length - 1] : null

  const isDirty = useMemo(() => {
    if (!head) return true
    if (head.tree !== currentTree) return true
    return false
  }, [head, currentTree])

  const commit = () => {
    if (!isDirty) return
    const parent = head?.id ?? null
    const id = commitHash(currentTree, parent, message.trim() || 'unnamed')
    const newCommit: Commit = {
      id,
      tree: currentTree,
      parent,
      message: message.trim() || 'unnamed',
      blobs: currentBlobs,
    }
    setCommits((cs) => [...cs, newCommit])
    setMessage('next change')
  }

  const editFile = (i: number, content: string) => {
    setFiles((fs) => fs.map((f, idx) => (idx === i ? { ...f, content } : f)))
  }

  const reset = () => {
    setFiles(initialFiles)
    setCommits([])
    setMessage('first commit')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.editor}>
        <div className={styles.head}>
          <span className={styles.label}>작업 디렉토리</span>
          {isDirty && <span className={styles.dirty}>● 변경됨 → 새 객체 생성됨</span>}
        </div>
        {files.map((f, i) => (
          <div key={f.name} className={styles.file}>
            <div className={styles.fileHead}>
              <span className={styles.fileName}>{f.name}</span>
              <span className={styles.fileHash} title="blob 해시">
                blob {blobHash(f.content)}
              </span>
            </div>
            <textarea
              className={styles.fileBody}
              value={f.content}
              rows={3}
              spellCheck={false}
              onChange={(e) => editFile(i, e.target.value)}
            />
          </div>
        ))}

        <div className={styles.commitBar}>
          <input
            className={styles.msgInput}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="커밋 메시지"
          />
          <button onClick={commit} disabled={!isDirty} className={styles.btn}>
            git commit
          </button>
          <button onClick={reset} className={`${styles.btn} ${styles.btnGhost}`}>
            리셋
          </button>
        </div>
      </div>

      <div className={styles.objects}>
        <div className={styles.head}>
          <span className={styles.label}>객체 데이터베이스</span>
          <span className={styles.muted}>실시간 갱신</span>
        </div>

        {head ? (
          <div className={styles.tier}>
            <div className={styles.tierLabel}>commit</div>
            <div className={styles.card} data-kind="commit">
              <div className={styles.cardHash}>{head.id}</div>
              <div className={styles.cardKv}>
                <span>tree</span>
                <code>{head.tree}</code>
              </div>
              {head.parent && (
                <div className={styles.cardKv}>
                  <span>parent</span>
                  <code>{head.parent}</code>
                </div>
              )}
              <div className={styles.cardKv}>
                <span>message</span>
                <span className={styles.cardMsg}>{head.message}</span>
              </div>
            </div>
            <div className={styles.arrow}>↓</div>
          </div>
        ) : (
          <div className={styles.empty}>
            아직 커밋 없음. <code>git commit</code>을 눌러 첫 객체를 만들어보세요.
          </div>
        )}

        <div className={styles.tier}>
          <div className={styles.tierLabel}>tree</div>
          <div
            className={styles.card}
            data-kind="tree"
            data-stale={head && head.tree !== currentTree ? 'true' : undefined}
          >
            <div className={styles.cardHash}>{currentTree}</div>
            {currentBlobs.map((b) => (
              <div key={b.name} className={styles.cardKv}>
                <code>{b.blob}</code>
                <span>{b.name}</span>
              </div>
            ))}
            {head && head.tree !== currentTree && (
              <div className={styles.staleNote}>※ 작업 디렉토리 기준 — 아직 commit 안 됨</div>
            )}
          </div>
          <div className={styles.arrow}>↓</div>
        </div>

        <div className={styles.tier}>
          <div className={styles.tierLabel}>blob ({uniqueBlobs.length}개)</div>
          <div className={styles.blobs}>
            {uniqueBlobs.map((b) => (
              <div key={b.hash} className={styles.card} data-kind="blob">
                <div className={styles.cardHash}>{b.hash}</div>
                <div className={styles.blobPreview}>{b.content || <em>(빈 파일)</em>}</div>
                <div className={styles.blobUsers}>
                  {b.users.length > 1 ? (
                    <span className={styles.dedup}>
                      ※ {b.users.length}개 파일이 공유: {b.users.join(', ')}
                    </span>
                  ) : (
                    <span>{b.users[0]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {commits.length > 1 && (
          <div className={styles.history}>
            <div className={styles.label}>커밋 히스토리</div>
            <ol className={styles.historyList}>
              {[...commits].reverse().map((c) => (
                <li key={c.id}>
                  <code>{c.id}</code>
                  <span>{c.message}</span>
                  {c.parent && <span className={styles.parent}>← {c.parent}</span>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
