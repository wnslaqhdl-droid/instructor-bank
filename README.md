# 성인권 교육 강사뱅크 React 정식 버전

## 페이지
- `#search`: 강사 검색
- `#register`: 강사 등록
- `#admin`: 관리자 페이지

## 주요 기능
- Supabase DB 연결
- 체크박스 기반 강의 분야/교육대상/교육유형 입력
- 양성과정, 실무경력, 강의경력 반복 입력
- 공개 승인 강사 검색
- 관리자 로그인, 승인/비공개/수정/삭제
- CSV 다운로드

## Vercel 설정
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## 환경변수 권장
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## 작업 방향
- 관리자 수정 UI는 반드시 components/admin/AdminEditPanel.jsx 에서 관리한다.
- 기본 정보/양성과정/실무경력/강의경력은 기존 Modify* 컴포넌트를 재사용한다.
- main 파일에 대형 form JSX를 직접 작성하지 않는다.
- 수정 폼 로직 변경 시 AdminEditPanel과 사용자 수정 폼이 동일 동작하도록 유지한다.
