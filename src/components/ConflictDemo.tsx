import { useState } from 'react'
import styles from './ConflictDemo.module.css'

type Stage = 'before' | 'conflict' | 'resolved'
type Resolution = 'ours' | 'theirs' | 'both'

const base = `# Hello
welcome
`

const ours = `# Hello
welcome to main branch
`

const theirs = `# Hello
welcome to feat branch
`

const conflicted = `# Hello
<<<<<<< HEAD (현재 브랜치 main)
welcome to main branch
=======
welcome to feat branch
>>>>>>> feat
`

const resolutions: Record<Resolution, { text: string; label: string }> = {
  ours: {
    text: `# Hello
welcome to main branch
`,
    label: 'ours만 채택 (main 쪽)',
  },
  theirs: {
    text: `# Hello
welcome to feat branch
`,
    label: 'theirs만 채택 (feat 쪽)',
  },
  both: {
    text: `# Hello
welcome to main branch
welcome to feat branch
`,
    label: '둘 다 합치기',
  },
}

export function ConflictDemo() {
  const [stage, setStage] = useState<Stage>('before')
  const [picked, setPicked] = useState<Resolution | null>(null)

  const reset = () => {
    setStage('before')
    setPicked(null)
  }

  const resolve = (r: Resolution) => {
    setPicked(r)
    setStage('resolved')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <FileCard label="base (공통 조상)" content={base} tone="muted" />
        <FileCard label="ours · main의 변경" content={ours} tone="ours" />
        <FileCard label="theirs · feat의 변경" content={theirs} tone="theirs" />
      </div>

      {stage === 'before' && (
        <div className={styles.controlBar}>
          <p className={styles.muted}>
            같은 줄(2번째 줄)을 main과 feat이 <strong>다르게</strong> 수정했다. git이 자동으로 못 정한다.
          </p>
          <button className={styles.btn} onClick={() => setStage('conflict')}>
            git merge feat
          </button>
        </div>
      )}

      {stage === 'conflict' && (
        <>
          <FileCard
            label="README.md (merge 시도 후 — conflict)"
            content={conflicted}
            tone="conflict"
            mono
          />
          <p className={styles.muted}>
            <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> / <code>=======</code> /{' '}
            <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> 가 conflict marker. git이 "여기는 사람이 결정해줘" 하고 끼워넣은 표시.
          </p>
          <div className={styles.controlBar}>
            <button className={styles.btn} onClick={() => resolve('ours')}>
              ours 채택
            </button>
            <button className={styles.btn} onClick={() => resolve('theirs')}>
              theirs 채택
            </button>
            <button className={styles.btn} onClick={() => resolve('both')}>
              둘 다 합치기
            </button>
            <button
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={reset}
            >
              처음으로
            </button>
          </div>
        </>
      )}

      {stage === 'resolved' && picked && (
        <>
          <FileCard
            label={`README.md (resolve — ${resolutions[picked].label})`}
            content={resolutions[picked].text}
            tone="resolved"
            mono
          />
          <div className={styles.controlBar}>
            <p className={styles.muted}>
              이제 <code>git add README.md && git commit</code> 하면 merge가 완성된다.
            </p>
            <button
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={reset}
            >
              다시 해보기
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function FileCard({
  label,
  content,
  tone,
  mono = false,
}: {
  label: string
  content: string
  tone: 'muted' | 'ours' | 'theirs' | 'conflict' | 'resolved'
  mono?: boolean
}) {
  return (
    <div className={styles.card} data-tone={tone}>
      <div className={styles.cardLabel}>{label}</div>
      <pre className={styles.cardBody} data-mono={mono}>
        {content}
      </pre>
    </div>
  )
}
