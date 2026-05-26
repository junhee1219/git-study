import { Suspense } from 'react'
import { Routes, Route, useParams, Navigate, useLocation } from 'react-router-dom'
import { Home } from './pages/Home'
import { ChapterPage } from './pages/ChapterPage'
import { NotFound } from './pages/NotFound'
import { SiteHeader } from './components/SiteHeader'
import { SiteFooter } from './components/SiteFooter'
import styles from './App.module.css'

function ChapterRoute() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return <Navigate to="/" replace />
  return <ChapterPage slug={slug} />
}

export function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className={styles.shell}>
      <SiteHeader />
      <main className={styles.main} data-home={isHome}>
        <Suspense fallback={<div className={styles.loading}>불러오는 중…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chapters/:slug" element={<ChapterRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
