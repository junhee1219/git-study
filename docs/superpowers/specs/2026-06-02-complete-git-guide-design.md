# 설계: "냥사원의 Git 분투기" 완성판 (6 → 10챕터)

작성일: 2026-06-02 · 브랜치: `expand-git-guide`

## 목표 & 성공 기준

이 페이지를 정독하면 **협업 팀에 던져놔도 안 막히는** 수준이 되는 것.
사용자가 직접 언급한 `stage`/`pull`/`fetch`/`push`/`squash`가 전용 챕터로 제대로 들어가고,
되돌리기·복구라는 안전망까지 갖춘다.

기존 정체성 유지:
- 냥사원/냥부장 듀오, 실패 일화를 끝까지 추적해서 풀어내는 서사
- "명령어 암기"가 아니라 ".git 내부 메커니즘을 손으로 만진다"
- 각 챕터마다 인터랙티브 + 퀴즈

## 감사 결과 (왜 이 작업이 필요한가)

깊이(내부 메커니즘)는 A급이나 넓이가 절반. 구조적 구멍:
1. **스테이징/인덱스** — `add`가 전 챕터에 나오는데 "스테이징이 뭔지" 설명이 없음
2. **리모트** — 협업(git 가치의 절반)이 비어 있음. `pull`을 Ch.4에서 한 줄로만 언급

## 최종 챕터 구성 (★ = 신규)

| # | slug | 제목 | 핵심 | 인터랙티브 |
|---|---|---|---|---|
| 0 | why-git | git이 뭔지, 왜 | (유지) | — |
| 1 | snapshots | 스냅샷이라는 발상 | (유지) | SnapshotStack |
| 2 | objects | .git 안에는 뭐가 | (유지) | ObjectInspector |
| **3** | **staging** ★ | 스테이징 영역 | 작업디렉토리→index→commit 3-tree, `add`가 뭘 하나, `.gitignore` | **StagingArea** ★ |
| 4 | branch | 브랜치는 이름표 | (유지, 3→4) | BranchPlayground |
| **5** | **remotes** ★ | 리모트와 협업 | clone/fetch/push/pull, origin, remote-tracking(origin/main), upstream, `! [rejected]`·force 위험 | **RemoteSync** ★ |
| 6 | merge | 합치는 두 방법 | (유지, 4→6) pull의 통합단계로 연결 | MergeDemo·ConflictDemo |
| **7** | **undoing** ★ | 되돌리기와 복구 | reset(soft/mixed/hard)·revert·restore·reflog·stash | **ResetPlayground** ★ |
| **8** | **rewriting** ★ | 히스토리 다듬기 | amend·squash·fixup·interactive rebase, "공유 브랜치 재작성 금지" | **RebaseTodo** ★ |
| 9 | worktree | 평행 작업공간 | (유지, 5→9) | WorktreeSim |

**순서 근거**: staging은 Ch.1에서 설명 없이 등장하는 `add`를 메우려 객체 직후. remotes는 핵심이라
브랜치 직후 앞쪽. undoing/rewriting은 reset(브랜치 포인터 이동)·rebase 이해 선행이라 merge 뒤.
worktree는 고급 마무리라 그대로 끝.

**slug 정책**: 기존 챕터 slug(branch/merge/worktree)는 URL이므로 **유지** → SEO 안 깨짐.
표시용 `number`만 조정. 신규 slug: staging/remotes/undoing/rewriting.

## 내러티브 처리

- 아크를 "냥사원의 첫 분기 성장기"로 느슨하게 재프레이밍(엄격한 월~금 1주 → 에피소드 EP.00~09)
- Ch.0(첫날) ↔ Ch.1("입사 4개월차") 모순을 Ch.1 인트로 손봐서 해소
- 신규 4챕터 각각 실패 일화로 시작:
  - **Ch.3**: `git add .` 하다 `.env`·`node_modules`까지 커밋 → staging/.gitignore
  - **Ch.5**: push `! [rejected]` 뜨자 `--force`로 밀어 동료 커밋 날림 → 리모트 모델·force 위험
  - **Ch.7**: `reset --hard`로 작업 날림 → `reflog`로 부활 (Ch.4 detached HEAD 떡밥 회수)
  - **Ch.8**: 커밋 메시지 'wip','asdf' 30개 → squash 정리, 공유 브랜치 rebase로 또 사고
- Ch.9 "마치며" 졸업 문구를 10에피소드 여정으로 업데이트

## 신규 인터랙티브 4종 (기존 패턴·CommitGraph 재사용)

- **StagingArea**: 작업디렉토리 / staging(index) / HEAD 3열. 파일 클릭으로 stage·unstage,
  commit이 index를 스냅샷하는 것 + .gitignore로 무시되는 파일 시각화
- **RemoteSync**: 로컬+리모트 2패널 CommitGraph. fetch(=origin/main 갱신)·push·pull·divergence·rejected 재현
- **ResetPlayground**: 3-tree(HEAD/index/working)에 soft/mixed/hard가 각각 뭘 건드리는지 + reflog 패널 복구
- **RebaseTodo**: 커밋 목록에 pick/squash/fixup/reword/drop 토글 → 결과 히스토리 그래프

## 공유 프리미티브 API (참조)

- `Callout` tone: `info`|`warn`|`danger`|`success`, title?, children
- `Terminal` lines: `{type:'prompt'|'output'|'comment', text}[]`, typewriter?
- `Quiz` questions: `{id, prompt, choices?:[{id,text}], answer:string|string[], explain?, placeholder?}[]`
- `DialogueScene`/`Line` who: `냥사원`|`냥부장`|`내레이션`, tone: confident/panic/dry/curious/sigh/normal/narration
- `CommitGraph` commits(oldest-first `{id,parents?,lane?,label?,branch?:'main'|'feat'|'hot'|'exp'}`), branches?(`{name,on}`), head?

## 기존 파일 수정 범위 (작음)

- `src/chapters.ts`: 신규 4개 추가 + number 재정렬 + prereq/seoDescription/분
- `src/content/00-why-git.mdx`: "학습 경로" 목록·분량 갱신
- `src/content/01-snapshots.mdx`: "4개월차" 연속성 수정 + staging 예고
- `src/content/04-merge.mdx`: pull 설명 remotes 챕터와 교차참조
- `src/content/05-worktree.mdx`: 마무리 문구 갱신, stash는 Ch.7로 위임
- `src/pages/Home.tsx`: SeoHead description에 staging/remote/reset/rebase 추가
- `public/sitemap.xml`: 신규 4개 URL 추가

## 검증

- `npm run build` (tsc -b + vite build) 통과
- 적대적 리뷰 워크플로우: git 기술 정확성 / 톤 일관성 / 빌드안전 / 교육 완성도
- Playwright로 신규 챕터 렌더 스크린샷 확인
