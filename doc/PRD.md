# Product Requirements Document (PRD) & Phase Plan

## 제품 개요 (Product Overview)
자연어 명령과 VLM 및 **Promptable Concept Segmentation** AI 모델을 결합하여 자동으로 이미지 속 개인정보 및 민감 데이터를 추출하고 가려주는 'LLM 기반 지능형 비식별화 시스템(MasGO)'의 프론트엔드입니다.  

특히 **Promptable Concept Segmentation** 기술을 활용하여, 단순한 특정 객체 지정을 넘어 텍스트나 시각적 예시(Exemplar)를 통해 이미지 내의 모든 관련 개념(Concept)을 일괄적으로 식별하고 정밀 세그먼테이션을 수행합니다.

---

## 구현 상태 및 개발 Phase 계획

### [완료] Phase 1: 기반 설정 및 공통 레이아웃 (Foundation & Layout)
- [x] **Next.js 14, Tailwind CSS, TypeScript** App Router 초기 세팅 (`scaffold` 완료)
- [x] **테마 및 모던 UI 기반 마련 (Rich Aesthetics)**: `globals.css`와 다크 모드(bg-gray-950 기반) 구축
- [x] **공통 컴포넌트 개발**: Global Navigation (`Navigation.tsx`) 및 Footer 적용.

### [완료] Phase 2: 핵심 페이지 UI 개발 (Core Pages UI)
- [x] **사이트 소개 페이지 (`/`)**: 서비스의 정의 및 핵심 차별점(텍스트↔이미지 그라운딩 기반 객체 추론 및 컨셉 세그먼테이션) 시각화.
- [x] **기술 설명 페이지 (`/technology`)**: VLM, Promptable Concept Segmentation, Transformer 기반 아키텍처 및 처리 흐름 다이아그램/설명 레이아웃 구성.
- [x] **데모 페이지 UI (`/demo`)**: 이미지 업로드 폼(드래그앤드롭 디자인), 자연어 프롬프트 입력창, 처리 옵션(Inner/Outer) 선택 패널 UI 프론트엔드 구축. (API 미연결 상태)
- [x] **API 키 관리 (`/keys`)**: MasGO 시스템 연동을 위한 보안 키 목록 조회 및 생성 UI 템플릿 완성.

### [완료] Phase 3: 백엔드/AI 연동 (Backend Integration)
- [x] `/api/v1/deidentify/` 백엔드 API 연동 모듈 로직 구현 (`src/lib/api.ts`).
- [x] 데모 페이지와 백엔드 API 연결 (폼 상태 관리 및 비동기 업로드 처리, `FormData` 변환 기능 구성).
- [x] 요청 상태(Job Status) 모니터링 컴포넌트 추가 및 스캐닝 애니메이션 피드백 적용. 응답결과 URL 매핑 및 에러 핸들링.

### [완료] Phase 4: 사용자 API 키 관리 시스템 완성 (Key Management System)
- [x] 사용자 식별/인증 체계 구성 (Mock Data Provider 적용 및 Local DB/Storage 연동).
- [x] 생성/삭제 파이프라인 연동 구현 (새 키 생성, 마스킹된 키 보기 목록 제공, 삭제 시 확인 절차).

### [완료] Phase 5: 최적화 및 디버그 (Polish & Debug)
- [x] 파일 업로드 크기 제한(10MB) 및 형식 검토 등 클라이언트 검증 추가 완료.
- [x] UI 애니메이션 향상: `framer-motion` 도입 적용. 랜딩 페이지 트랜지션, 데모 업로드/결과 존 트랜지션 로직 등.
- [x] 5회 이상 발생 에러 검출 로직(`useDebugErrorTrap` 커스텀 훅) 구현 및 프론트엔드 연동.
