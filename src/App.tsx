import { Suspense } from 'react'
import { Routes, Route, NavLink, useParams, Navigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { ChapterPage } from './pages/ChapterPage'
import { NotFound } from './pages/NotFound'
import styles from './App.module.css'

function ChapterRoute() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return <Navigate to="/" replace />
  return <ChapterPage slug={slug} />
}

export function App() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.brand}>
          Git 인터랙티브 가이드
        </NavLink>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : '')}>
            홈
          </NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Suspense fallback={<div className={styles.loading}>불러오는 중…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chapters/:slug" element={<ChapterRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <footer className={styles.footer}>
        <span>
          한국어 · .git 내부 메커니즘 · 인터랙티브 · 신입 실패 일화 회수
        </span>
      </footer>
    </div>
  )
}
