import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div style={{ padding: '48px 0', textAlign: 'center' }}>
      <h1 style={{ marginBottom: 12 }}>여긴 아무것도 없어요</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
        주소를 다시 확인해보세요.
      </p>
      <Link to="/">← 홈으로</Link>
    </div>
  )
}
