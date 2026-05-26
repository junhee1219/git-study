# git-page

신입 개발자를 위한 Git 인터랙티브 가이드.

- 한국어
- `.git` 내부 메커니즘
- 인터랙티브 (직접 만져보는 시뮬레이션)
- 신입의 실패 일화를 끝까지 추적해서 풀어내기

## 개발

```bash
npm install
npm run dev
```

## 배포

`main` 브랜치 push 시 GitHub Actions가 자동으로 GitHub Pages에 배포.

- 빌드: `npm run build` → `dist/`
- base path는 워크플로우에서 `/<repo-name>/`로 자동 주입

## 스택

Vite · React 18 · TypeScript · MDX · CSS Modules · HashRouter
