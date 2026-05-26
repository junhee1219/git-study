import { useState } from 'react'
import styles from './Quiz.module.css'

type Choice = {
  id: string
  text: string
}

type Question = {
  id: string
  prompt: string
  /** options for multiple choice; omit for input questions */
  choices?: Choice[]
  /** correct answer — for choice it's the choice id; for input, a string (case-insensitive trim match) or array of accepted answers */
  answer: string | string[]
  /** explanation shown after submit */
  explain?: string
  /** override input placeholder */
  placeholder?: string
}

type Props = {
  questions: Question[]
}

const normalize = (s: string) => s.trim().toLowerCase()

function isCorrect(q: Question, given: string) {
  if (Array.isArray(q.answer)) {
    return q.answer.map(normalize).includes(normalize(given))
  }
  return normalize(q.answer) === normalize(given)
}

export function Quiz({ questions }: Props) {
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})

  const submit = (id: string) => {
    setSubmitted((s) => ({ ...s, [id]: true }))
  }

  const reset = (id: string) => {
    setSubmitted((s) => {
      const { [id]: _omit, ...rest } = s
      return rest
    })
    setResponses((r) => {
      const { [id]: _omit, ...rest } = r
      return rest
    })
  }

  return (
    <div className={styles.quiz}>
      {questions.map((q, i) => {
        const given = responses[q.id] ?? ''
        const isDone = submitted[q.id]
        const correct = isDone && isCorrect(q, given)

        return (
          <div
            key={q.id}
            className={styles.q}
            data-state={isDone ? (correct ? 'correct' : 'wrong') : 'idle'}
          >
            <div className={styles.qHead}>
              <span className={styles.qNum}>Q{i + 1}</span>
              <p className={styles.qPrompt}>{q.prompt}</p>
            </div>

            {q.choices ? (
              <div className={styles.choices}>
                {q.choices.map((c) => {
                  const selected = given === c.id
                  const correctChoice = isDone && isCorrect(q, c.id)
                  return (
                    <label
                      key={c.id}
                      className={styles.choice}
                      data-selected={selected}
                      data-correct={isDone ? correctChoice : undefined}
                      data-wrong={isDone && selected && !correctChoice}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={c.id}
                        checked={selected}
                        disabled={isDone}
                        onChange={() =>
                          setResponses((r) => ({ ...r, [q.id]: c.id }))
                        }
                      />
                      <span>{c.text}</span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <input
                type="text"
                className={styles.input}
                value={given}
                disabled={isDone}
                placeholder={q.placeholder ?? '답을 입력하세요'}
                onChange={(e) =>
                  setResponses((r) => ({ ...r, [q.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit(q.id)
                }}
              />
            )}

            <div className={styles.actions}>
              {!isDone ? (
                <button
                  type="button"
                  className={styles.btn}
                  onClick={() => submit(q.id)}
                  disabled={!given}
                >
                  채점
                </button>
              ) : (
                <>
                  <span className={styles.verdict} data-correct={correct}>
                    {correct ? '정답' : '오답'}
                  </span>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnGhost}`}
                    onClick={() => reset(q.id)}
                  >
                    다시
                  </button>
                </>
              )}
            </div>

            {isDone && q.explain && (
              <div className={styles.explain}>{q.explain}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
