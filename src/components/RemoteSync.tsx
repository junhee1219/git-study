import { useMemo, useState } from 'react'
import styles from './RemoteSync.module.css'

type By = 'me' | 'mate' | 'base' | 'merge'
type C = { id: string; by: By; label: string }

let counter = 0
const nextId = () => {
  counter += 1
  return counter.toString(16).padStart(7, '0').slice(-7)
}

function makeBase(): C[] {
  counter = 0
  return [
    { id: nextId(), by: 'base', label: 'init' },
    { id: nextId(), by: 'base', label: 'setup' },
  ]
}

type State = {
  remote: C[] // 서버의 실제 origin/main
  local: C[] // 내 로컬 main
  tracking: C[] // 내가 아는 origin/main (remote-tracking, fetch 시 갱신)
}

function commonPrefix(a: C[], b: C[]): number {
  let i = 0
  while (i < a.length && i < b.length && a[i].id === b[i].id) i += 1
  return i
}

// b 가 a 의 prefix(조상)인가 → push fast-forward 가능 여부
function isPrefix(prefix: C[], full: C[]): boolean {
  if (prefix.length > full.length) return false
  return commonPrefix(prefix, full) === prefix.length
}

export function RemoteSync() {
  const [state, setState] = useState<State>(() => {
    const base = makeBase()
    return { remote: [...base], local: [...base], tracking: [...base] }
  })
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err' | 'warn'; text: string } | null>(
    null,
  )

  const reset = () => {
    const base = makeBase()
    setState({ remote: [...base], local: [...base], tracking: [...base] })
    setFlash(null)
  }

  const say = (kind: 'ok' | 'err' | 'warn', text: string) => setFlash({ kind, text })

  // origin/main(tracking) 기준 ahead / behind
  const { ahead, behind } = useMemo(() => {
    const cp = commonPrefix(state.local, state.tracking)
    return { ahead: state.local.length - cp, behind: state.tracking.length - cp }
  }, [state])

  const localCommit = () => {
    setState((s) => ({
      ...s,
      local: [...s.local, { id: nextId(), by: 'me', label: '내 작업' }],
    }))
    say('ok', '로컬 main 에 커밋 추가. origin 보다 앞섬 → push 필요.')
  }

  const mateCommit = () => {
    setState((s) => ({
      ...s,
      remote: [...s.remote, { id: nextId(), by: 'mate', label: '동료 작업' }],
    }))
    say('warn', '동료가 origin 에 push 함. 너는 아직 fetch 안 해서 모름.')
  }

  const fetch = () => {
    setState((s) => ({ ...s, tracking: [...s.remote] }))
    say('ok', 'fetch: origin/main(remote-tracking)만 갱신. 로컬 main 은 그대로.')
  }

  const push = () => {
    if (isPrefix(state.remote, state.local)) {
      setState((s) => ({ ...s, remote: [...s.local], tracking: [...s.local] }))
      say('ok', 'push 성공: origin/main 이 로컬 main 까지 전진.')
    } else {
      say(
        'err',
        '! [rejected] non-fast-forward — origin 에 로컬에 없는 커밋이 있다. git pull 먼저.',
      )
    }
  }

  const pull = () => {
    setState((s) => {
      const tracking = [...s.remote] // fetch
      const cp = commonPrefix(s.local, tracking)
      const localAhead = s.local.length - cp
      const remoteAhead = tracking.length - cp
      if (remoteAhead === 0) {
        // 로컬이 같거나 앞섬 → 통합할 것 없음
        return { ...s, tracking }
      }
      if (localAhead === 0) {
        // fast-forward: 로컬을 remote 로 전진
        return { ...s, tracking, local: [...tracking] }
      }
      // 갈라짐 → merge commit
      const theirs = tracking.slice(cp)
      const merge: C = { id: nextId(), by: 'merge', label: 'Merge origin/main' }
      return { ...s, tracking, local: [...s.local, ...theirs, merge] }
    })
    say('ok', 'pull = fetch + 통합. 리모트 변경을 로컬 main 으로 가져옴.')
  }

  const forcePush = () => {
    const lost = state.remote.filter(
      (rc) => !state.local.some((lc) => lc.id === rc.id),
    )
    setState((s) => ({ ...s, remote: [...s.local], tracking: [...s.local] }))
    if (lost.length > 0) {
      say(
        'err',
        `force push: origin 을 로컬로 덮어씀. 동료 커밋 ${lost.length}개 영영 사라짐.`,
      )
    } else {
      say('warn', 'force push: origin 을 로컬로 강제로 덮어씀.')
    }
  }

  const statusText =
    ahead > 0 && behind > 0
      ? `갈라짐 — 로컬 ${ahead}개 / origin ${behind}개 (pull로 통합 필요)`
      : ahead > 0
        ? `로컬이 origin/main 보다 ${ahead}개 앞섬 (push 필요)`
        : behind > 0
          ? `origin/main 이 ${behind}개 앞섬 (pull 필요)`
          : 'origin/main 과 동기화됨'

  const trackingTipId = state.tracking[state.tracking.length - 1]?.id

  const renderChain = (chain: C[], opts: { tipLabel: string; showTracking?: boolean }) => (
    <ol className={styles.chain}>
      {[...chain].reverse().map((c, idx) => {
        const isTip = idx === 0
        const isTracking = opts.showTracking && c.id === trackingTipId
        return (
          <li key={c.id} className={styles.node} data-by={c.by}>
            <span className={styles.dot} data-by={c.by} />
            <span className={styles.cid}>{c.id}</span>
            <span className={styles.clabel}>{c.label}</span>
            <span className={styles.refs}>
              {isTip && <span className={styles.ref} data-kind="head">{opts.tipLabel}</span>}
              {isTracking && (
                <span className={styles.ref} data-kind="track">
                  origin/main
                </span>
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.status} data-flash={flash?.kind}>
        <span className={styles.statusMain}>{statusText}</span>
        {flash && <span className={styles.flash} data-kind={flash.kind}>{flash.text}</span>}
      </div>

      <div className={styles.panels}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.label}>내 컴퓨터 (로컬)</span>
            <span className={styles.muted}>main</span>
          </div>
          {renderChain(state.local, { tipLabel: 'main', showTracking: true })}
        </div>

        <div className={styles.panelArrow} aria-hidden="true">
          ⇅
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.label}>origin (GitHub 서버)</span>
            <span className={styles.muted}>main</span>
          </div>
          {renderChain(state.remote, { tipLabel: 'main' })}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.group}>
          <span className={styles.groupLabel}>내 작업</span>
          <button className={styles.btn} onClick={localCommit}>
            로컬 commit
          </button>
          <button className={styles.btn} onClick={push}>
            git push
          </button>
        </div>
        <div className={styles.group}>
          <span className={styles.groupLabel}>서버에서 가져오기</span>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={fetch}>
            git fetch
          </button>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={pull}>
            git pull
          </button>
        </div>
        <div className={styles.group}>
          <span className={styles.groupLabel}>시뮬레이션 / 위험</span>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={mateCommit}>
            동료가 push
          </button>
          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={forcePush}>
            push --force
          </button>
        </div>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={reset}>
          리셋
        </button>
      </div>

      <p className={styles.hint}>
        추천 시나리오: ① <code>동료가 push</code> → ② <code>로컬 commit</code> → ③{' '}
        <code>git push</code> (rejected 확인) → ④ <code>git pull</code> (통합) → ⑤{' '}
        <code>git push</code> (성공). 그다음 <code>push --force</code>가 왜 위험한지도 눌러보자.
      </p>
    </div>
  )
}
