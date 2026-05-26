import type { LazyExoticComponent, ComponentType } from 'react'
import { lazy } from 'react'

export type ChapterMeta = {
  slug: string
  number: number
  title: string
  subtitle: string
  estimatedMinutes: number
  prerequisites: string[]
  status: 'ready' | 'draft' | 'planned'
  Component: LazyExoticComponent<ComponentType>
}

export const chapters: ChapterMeta[] = [
  {
    slug: 'snapshots',
    number: 1,
    title: '스냅샷이라는 발상',
    subtitle: 'git이 변화를 기록하는 방식 — diff가 아니라 사진첩',
    estimatedMinutes: 8,
    prerequisites: [],
    status: 'ready',
    Component: lazy(() => import('./content/01-snapshots.mdx')),
  },
  {
    slug: 'objects',
    number: 2,
    title: '.git 안에는 뭐가 있나',
    subtitle: 'blob · tree · commit, 그리고 해시의 정체',
    estimatedMinutes: 12,
    prerequisites: ['snapshots'],
    status: 'ready',
    Component: lazy(() => import('./content/02-objects.mdx')),
  },
  {
    slug: 'branch',
    number: 3,
    title: '브랜치는 사실 이름표일 뿐',
    subtitle: 'HEAD와 포인터, detached HEAD가 뭐길래',
    estimatedMinutes: 10,
    prerequisites: ['objects'],
    status: 'planned',
    Component: lazy(() => import('./content/03-branch.mdx')),
  },
  {
    slug: 'merge',
    number: 4,
    title: '히스토리를 합치는 두 가지 방법',
    subtitle: 'merge vs rebase, 그리고 conflict는 왜 생기나',
    estimatedMinutes: 14,
    prerequisites: ['branch'],
    status: 'planned',
    Component: lazy(() => import('./content/04-merge.mdx')),
  },
  {
    slug: 'worktree',
    number: 5,
    title: 'worktree — 평행 작업공간',
    subtitle: '한 레포에서 동시에 여러 브랜치 작업하기',
    estimatedMinutes: 18,
    prerequisites: ['branch'],
    status: 'planned',
    Component: lazy(() => import('./content/05-worktree.mdx')),
  },
]

export const chapterBySlug = (slug: string) =>
  chapters.find((c) => c.slug === slug)
