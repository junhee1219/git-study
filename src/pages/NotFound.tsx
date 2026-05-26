import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div
      style={{
        padding: '64px 0',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted-2)',
          fontSize: '0.85rem',
        }}
      >
        404 · 페이지를 찾을 수 없음
      </div>
      <h1 style={{ fontSize: '1.6rem' }}>여긴 아무것도 없어요</h1>
      <p style={{ color: 'var(--muted)' }}>주소를 다시 확인해보세요.</p>
      <Link
        to="/"
        style={{
          marginTop: 8,
          padding: '8px 16px',
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          color: 'var(--accent)',
        }}
      >
        ← 홈으로
      </Link>
    </div>
  )
}
