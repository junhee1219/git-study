import { Link } from 'react-router-dom'
import { chapters } from '../chapters'
import { SeoHead } from '../components/SeoHead'
import styles from './Home.module.css'

const differentiators = [
  {
    num: '01',
    title: '한국어',
    body: '신입에게 가장 친숙한 언어로, 가장 정확하게.',
  },
  {
    num: '02',
    title: '.git 내부 메커니즘',
    body: '명령어 사용법이 아니라 안에서 무슨 일이 벌어지는지.',
  },
  {
    num: '03',
    title: '인터랙티브',
    body: '읽기만 하지 말고 직접 만져보면서 모델을 만든다.',
  },
  {
    num: '04',
    title: '실패 일화 회수',
    body: '"conflict 안 풀고 push" 같은 신입 실수를 끝까지 추적해서 풀어낸다.',
  },
]

const statusLabel: Record<'ready' | 'draft' | 'planned', string> = {
  ready: '준비됨',
  draft: '작성중',
  planned: '예정',
}

const totalMinutes = chapters.reduce((s, c) => s + c.estimatedMinutes, 0)

export function Home() {
  return (
    <div className={styles.home}>
      <SeoHead
        title="냥사원의 Git 분투기"
        description="냥테크에 입사한 냥사원과 냥부장이 굴러가는 좌충우돌 사례로 따라가는 한국어 Git 인터랙티브 가이드. 명령어를 외우는 게 아니라 .git 내부 메커니즘을 손으로 만져보며 본질부터 익힌다. 스냅샷, 객체(blob/tree/commit), 스테이징, 브랜치, 리모트(push/pull/fetch), merge/rebase, conflict, 되돌리기(reset/reflog), squash, worktree까지."
        path="/"
        type="website"
      />
      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          전체 {chapters.length}챕터 · 약 {totalMinutes}분
        </div>
        <h1 className={styles.title}>
          냥사원의 <em>git pull</em>은 왜 빨갛게 떴을까.
        </h1>
        <p className={styles.lead}>
          냥테크에 입사한 냥사원, 첫 출근날 사수 냥부장이 <code>git pull</code> 한 줄을
          시킨다. 그날부터 시작된 좌충우돌 분투기 — 명령어를 외우는 게 아니라{' '}
          <strong>속에서 무슨 일이 벌어지는지</strong>를 직접 만져보며 모델을 만드는
          가이드.
        </p>
        <div className={styles.heroActions}>
          <Link to={`/chapters/${chapters[0]!.slug}`} className={styles.btnPrimary}>
            0챕터부터 시작 →
          </Link>
          <a href="#chapters" className={styles.btnGhost}>
            챕터 목록 보기
          </a>
        </div>
      </section>

      <section className={styles.diffs}>
        {differentiators.map((d) => (
          <div key={d.title} className={styles.diff}>
            <div className={styles.diffNum}>{d.num}</div>
            <h3 className={styles.diffTitle}>{d.title}</h3>
            <p className={styles.diffBody}>{d.body}</p>
          </div>
        ))}
      </section>

      <section id="chapters" className={styles.chaptersBlock}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>학습 경로</h2>
          <p className={styles.sectionLead}>
            1번 챕터부터 순서대로 따라오면 가장 매끄럽지만, 익숙한 챕터는 건너뛰어도
            됩니다.
          </p>
        </div>
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
                  {statusLabel[c.status]}
                </span>
              </div>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <p className={styles.cardSubtitle}>{c.subtitle}</p>
              <div className={styles.cardMeta}>
                <span>약 {c.estimatedMinutes}분</span>
                {c.prerequisites.length > 0 && (
                  <span className={styles.cardPrereq}>
                    선행 · {c.prerequisites.join(', ')}
                  </span>
                )}
              </div>
              <div className={styles.cardArrow} aria-hidden="true">
                →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
