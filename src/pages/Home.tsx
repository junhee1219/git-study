import { Link } from 'react-router-dom'
import { chapters } from '../chapters'
import styles from './Home.module.css'

const differentiators = [
  { title: '한국어', body: '신입에게 가장 친숙한 언어로, 가장 정확하게.' },
  {
    title: '.git 내부 메커니즘',
    body: '명령어 사용법이 아니라 안에서 무슨 일이 벌어지는지.',
  },
  {
    title: '인터랙티브',
    body: '읽기만 하지 말고 직접 만져보면서 모델을 만든다.',
  },
  {
    title: '실패 일화 회수',
    body: '"conflict 안 풀고 push" 같은 신입의 실수를 끝까지 추적해서 풀어낸다.',
  },
]

export function Home() {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Git을 <em>본질</em>부터.
        </h1>
        <p className={styles.lead}>
          AI 시대에 신입이 자유자재로 다뤄야 할 도구는 git. 명령어를 외우는 게
          아니라 <strong>속에서 무슨 일이 벌어지는지</strong>를 손으로 만져보며
          익히는 인터랙티브 가이드.
        </p>
      </section>

      <section className={styles.diffs}>
        {differentiators.map((d) => (
          <div key={d.title} className={styles.diff}>
            <h3>{d.title}</h3>
            <p>{d.body}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className={styles.sectionTitle}>학습 경로</h2>
        <p className={styles.sectionLead}>
          1번 챕터부터 순서대로 따라오면 가장 매끄럽지만, 익숙한 챕터는 건너뛰어도
          됩니다.
        </p>
        <div className={styles.cards}>
          {chapters.map((c) => (
            <Link
              key={c.slug}
              to={`/chapters/${c.slug}`}
              className={styles.card}
              data-status={c.status}
            >
              <div className={styles.cardHead}>
                <span className={styles.cardNumber}>Ch.{c.number}</span>
                <span className={styles.cardStatus} data-status={c.status}>
                  {c.status === 'ready' && '준비됨'}
                  {c.status === 'draft' && '작성중'}
                  {c.status === 'planned' && '예정'}
                </span>
              </div>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <p className={styles.cardSubtitle}>{c.subtitle}</p>
              <div className={styles.cardMeta}>
                <span>약 {c.estimatedMinutes}분</span>
                {c.prerequisites.length > 0 && (
                  <span>선행 · {c.prerequisites.join(', ')}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
