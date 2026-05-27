import type { LazyExoticComponent, ComponentType } from 'react'
import { lazy } from 'react'

export type ChapterMeta = {
  slug: string
  number: number
  title: string
  subtitle: string
  /** SEO description — 120~160자 권장 */
  seoDescription: string
  estimatedMinutes: number
  prerequisites: string[]
  status: 'ready' | 'draft' | 'planned'
  Component: LazyExoticComponent<ComponentType>
}

export const chapters: ChapterMeta[] = [
  {
    slug: 'why-git',
    number: 0,
    title: 'git이 뭔지, 왜 배우는지',
    subtitle: 'git을 한 번도 안 써본 사람을 위한 입구',
    seoDescription:
      'git이 무엇이고 왜 배워야 하는지를 쌩초보 기준으로 설명한다. 게임 세이브포인트 비유, Dropbox와의 차이, AI 시대에 git이 더 중요해지는 이유까지.',
    estimatedMinutes: 5,
    prerequisites: [],
    status: 'ready',
    Component: lazy(() => import('./content/00-why-git.mdx')),
  },
  {
    slug: 'snapshots',
    number: 1,
    title: '스냅샷이라는 발상',
    subtitle: 'git이 변화를 기록하는 방식 — diff가 아니라 사진첩',
    seoDescription:
      'git이 저장하는 것은 변경분(diff)이 아니라 매 시점의 전체 스냅샷이다. 인터랙티브로 직접 만져보면서 "사진첩" 모델을 익히는 챕터.',
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
    seoDescription:
      '.git/ 폴더 안의 객체 3종 — blob, tree, commit — 과 SHA-1 해시 정체를 까본다. 같은 내용이 같은 해시로 자동 deduplication되는 메커니즘.',
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
    seoDescription:
      '브랜치는 코드 복사가 아니라 commit 해시 한 줄이 적힌 작은 파일이다. HEAD의 정체와 detached HEAD 사고를 인터랙티브로 풀어본다.',
    estimatedMinutes: 10,
    prerequisites: ['objects'],
    status: 'ready',
    Component: lazy(() => import('./content/03-branch.mdx')),
  },
  {
    slug: 'merge',
    number: 4,
    title: '히스토리를 합치는 두 가지 방법',
    subtitle: 'merge vs rebase, 그리고 conflict는 왜 생기나',
    seoDescription:
      'merge와 rebase의 결과를 같은 베이스에서 비교한다. 3-way merge가 conflict marker를 만드는 메커니즘과 안 풀고 push하면 벌어지는 사고.',
    estimatedMinutes: 14,
    prerequisites: ['branch'],
    status: 'ready',
    Component: lazy(() => import('./content/04-merge.mdx')),
  },
  {
    slug: 'worktree',
    number: 5,
    title: 'worktree — 평행 작업공간',
    subtitle: '한 레포에서 동시에 여러 브랜치 작업하기',
    seoDescription:
      'git worktree로 한 레포를 여러 디렉토리에 동시에 펼친다. 객체 DB는 공유, HEAD/index는 분리. 핫픽스 인터럽트와 AI 에이전트 격리에 강력.',
    estimatedMinutes: 12,
    prerequisites: ['branch'],
    status: 'ready',
    Component: lazy(() => import('./content/05-worktree.mdx')),
  },
]

export const chapterBySlug = (slug: string) =>
  chapters.find((c) => c.slug === slug)
