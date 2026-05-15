# System Architecture

이 문서는 지능형 비식별화 시스템(MasGO) 프론트엔드의 구조와 컴포넌트 설계, 백엔드 연동 아키텍처를 정의합니다.

## 1. 프론트엔드 아키텍처 구조 (Next.js App Router)
어플리케이션은 App Router 기반의 디렉토리 구조를 가지며 코어 모듈을 `src` 내부에 분리합니다.

```
src/
 ├── app/                  # Next.js App Router 진입점
 │    ├── globals.css      # 전역 스타일 및 Tailwind base (Dark Theme)
 │    ├── layout.tsx       # Root Layout (폰트 설정, Navigation & Footer 임베딩)
 │    ├── page.tsx         # 랜딩 페이지 (소개 및 데모 접속 유도)
 │    ├── demo/            # 데모 환경 UI (VLM/Promptable Concept Segmentation 테스트 베드)
 │    ├── keys/            # 백엔드 API 키 관리 UI
 │    └── technology/      # AI 기반 기술(VLM, Promptable Concept Segmentation) 설명 페이지
```
 ├── components/           # 재사용 가능한 UI 컴포넌트 블록
 │    ├── layout/
 │    │    ├── Navigation.tsx   # 상단 GNB (로고, 주요 링크, Key 링크)
 │    │    └── Footer.tsx       # 하단 정보
 │    └── ui/              # (예정) 버튼, 인풋, 모달 등 공통 UI 요소 
```

## 2. 컴포넌트 설계 철학 (Component Design)
- **Container / Presentational 분리**: 복잡한 상태 관리가 들어가는 경우 비즈니스 로직과 화면 퍼블리싱 영역을 분리합니다.
- **서버 컴포넌트 우선 적용**: SEO 및 초기 로딩 속도 최적화를 위해 데이터 패칭 및 정적 퍼블리싱 요소(Home, Technology)는 RSC(React Server Component)로 렌더링.
- **클라이언트 컴포넌트 (`'use client'`) 최소화**: `demo` 페이지와 같은 사용자 상태(State), 이벤트 바인딩이 필요한 곳에 한정하여 사용합니다.

## 3. 백엔드 및 AI 연동 레이어 (Integration Layer)
프론트엔드는 MCP / FastAPI로 구성된 외부 지능형 비식별화 처리 계층(Processing Layer)과 독립적으로 통신합니다.

### 연동 인터페이스 구성
- **Configuration (.env)**:
  - `NEXT_PUBLIC_API_BASE_URL`: WAS FastAPI 엔드포인트 연동 (`/api/v1/deidentify`)
  - `NEXT_PUBLIC_LLM_PROVIDER`: Auto Level 측정용 LLM 모델 타겟 설정
- **통신 로직 (Phase 3 진행 예정)**:
  - 데모 페이지 내부에서 `fetch`/`axios` 기반의 Async/Await 모듈을 통해 Base64 이미지 또는 Multi-part 폼 변환 데이터를 전송.
  - Job Queueing 시스템을 고려하여 Status Poll 방식의 응답 추적기 레이어 설계.

## 4. 데이터 플로우 시나리오 (Demo Workflow)
1. **Input Phase**: 사용자가 이미지 Drag & Drop 및 자연어 Prompt ("자동차 번호판만 가려줘") 작성. Target Type (inner/outer) 결정.
2. **Transfer Phase**: Client Component가 멀티파트 요청 생성 → `api/v1/deidentify`로 전송.
3. **Wait & Render Phase**: Queue 혹은 Sync 응답을 대기하며 Loading State(스켈레톤 또는 분석 스피너 애니메이션) 표출.
4. **Output Phase**: 비식별화 처리된 Output Image URL 및 분석 Metadata 수신 및 화면 표출.
