# Product Requirements Document (PRD) & Phase Plan

## 제품 개요 (Product Overview)
자연어 명령과 VLM/SAM3 AI 모델을 결합하여 자동으로 이미지 속 개인정보 및 민감 데이터를 추출하고 가려주는 'LLM 기반 지능형 비식별화 시스템(GEMINI)'의 프론트엔드입니다. 

---

## 구현 상태 및 개발 Phase 계획

### [완료] Phase 1: 기반 설정 및 공통 레이아웃 (Foundation & Layout)
- [x] **Next.js 14, Tailwind CSS, TypeScript** App Router 초기 세팅 (`scaffold` 완료)
- [x] **테마 및 모던 UI 기반 마련 (Rich Aesthetics)**: `globals.css`와 다크 모드(bg-gray-950 기반) 구축
- [x] **공통 컴포넌트 개발**: Global Navigation (`Navigation.tsx`) 및 Footer 적용.

### [완료] Phase 2: 핵심 페이지 UI 개발 (Core Pages UI)
- [x] **사이트 소개 페이지 (`/`)**: 서비스의 정의 및 핵심 차별점(텍스트↔이미지 그라운딩 기반 객체 추론) 시각화.
- [x] **기술 설명 페이지 (`/technology`)**: VLM, SAM3, Transformer 기반 아키텍처 및 처리 흐름 다이아그램/설명 레이아웃 구성.
- [x] **데모 페이지 UI (`/demo`)**: 이미지 업로드 폼(드래그앤드롭 디자인), 자연어 프롬프트 입력창, 처리 옵션(Inner/Outer) 선택 패널 UI 프론트엔드 구축. (API 미연결 상태)
- [x] **API 키 관리 (`/keys`)**: GEMINI 시스템 연동을 위한 보안 키 목록 조회 및 생성 UI 템플릿 완성.

### [완료] Phase 3: 백엔드/AI 연동 (Backend Integration)
- [x] `/api/v1/deidentify/` 백엔드 API 연동 모듈 로직 구현 (`src/lib/api.ts`).
- [x] 데모 페이지와 백엔드 API 연결 (폼 상태 관리 및 비동기 업로드 처리, `FormData` 변환 기능 구성).
- [x] 요청 상태(Job Status) 모니터링 컴포넌트 추가 및 스캐닝 애니메이션 피드백 적용. 응답결과 URL 매핑 및 에러 핸들링.

### [대기] Phase 4: 사용자 API 키 관리 시스템 완성 (Key Management System)
- 사용자 식별/인증 체계 구성 (Mock 또는 기본 Auth Provider 연동).
- 생성/삭제 API 파이프라인 연계 및 Local DB 연동.

### [대기] Phase 5: 최적화 및 디버그 (Polish & Debug)
- 파일 업로드 크기 확장 검토 및 사용자 접근성 강화.
- UI 애니메이션 향상 (Framer Motion 등 동적 컴포넌트 도입).
- 5회 이상 발생 에러 검출 로직 및 Hook 연계 점검.
