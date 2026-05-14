# Product Requirements Document (PRD) & Phase Plan

## 제품 개요 (Product Overview)
자연어 명령과 VLM/SAM3 AI 모델을 결합하여 자동으로 이미지 속 개인정보 및 민감 데이터를 추출하고 가려주는 'LLM 기반 지능형 비식별화 시스템'의 프론트엔드입니다. 

## 개발 Phase 계획 (Development Phases)

### Phase 1: 기반 설정 및 공통 레이아웃 (Foundation & Layout)
- Next.js 14, Tailwind CSS, TypeScript 초기 세팅 완료
- 사이트 전반의 테마(색상, 타이포그래피) 및 모던 UI/UX 기반 마련 (Rich Aesthetics)
- 공통 컴포넌트(Header, Navigation, Footer, Layout 등) 개발

### Phase 2: 핵심 페이지 UI 개발 (Core Pages UI)
- **사이트 소개 페이지 (Home)**: 서비스의 정의 및 핵심 차별점(텍스트↔이미지 그라운딩 기반 객체 추론) 시각화
- **기술 설명 페이지 (Technology)**: VLM, SAM3, Transformer 기반 아키텍처 및 처리 흐름 설명
- **데모 페이지 UI (Demo UI)**: 이미지 업로드 폼, 자연어 프롬프트 입력창, 처리 옵션(Inner/Outer, Bbox/Polygon 등) 선택 패널 UI 구성

### Phase 3: 백엔드/AI 연동 (Backend Integration)
- `/api/v1/deidentify/` 백엔드 API 연동 모듈 개발
- 데모 페이지와 백엔드 API 연결 (동기 및 비동기 Queue 연동)
- 요청 상태(Job Status) 모니터링 및 결과 이미지 렌더링, 에러 핸들링

### Phase 4: 사용자 API 키 관리 시스템 (Key Management System)
- 사용자 인증(Mock 또는 기본 Auth) 연동
- API 키 생성, 삭제, 보기, 다운로드 기능 구현 (GEMINI / OPENAI 방식 참고)

### Phase 5: 최적화 및 디버그 (Polish & Debug)
- UI 반응성 및 접근성 향상, 애니메이션(Framer Motion 등) 적용
- 성능 최적화 및 코드 정리
- 5회 이상 발생한 오류 검출 및 알림 Hook 점검
