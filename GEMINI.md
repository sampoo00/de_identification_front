GEMINI.md - LLM 기반 비식별화 사이트 구성 및 규칙

## 1. 프로젝트 개요 및 핵심 차별성
- **서비스 정의**: VLM(Vision Language Model), SAM(Segment Anything Model), Transformer 기반 AI 기술을 결합. 사용자가 자연어로 원하는 대상을 지정하면 AI가 객체를 정밀 자동 세그먼테이션하고 비식별화하는 플랫폼.
- **핵심 차별점**: UI/기획/마케팅 전반에 AI를 활용한 텍스트↔이미지 그라운딩 기반 대상 객체 추론 및 제어가능성 강조.
- **주요 시나리오**: 
  - 이미지 업로드 → 자연어 명령 → AI 객체 후보 바운딩 및 비식별화 → 비식별화 이미지 다운로드

## 2. 사이트 구성 및 기술 스택
- **사이트 구성**: 소개, 기술 설명, 데모, 사용자 키 생성 및 다운로드(GEMINI, OPENAI 방식 참고)
- **프론트엔드 스택**: React + Next.js 14 (App Router), TypeScript (strict mode, `any` 금지), Tailwind CSS v3

## 3. 개발 Phase 및 아키텍처 규칙
- **문서화**: 상세 기획 및 설계는 `doc/` 내부의 `ADR.md`, `ARCHITECTURE.md`, `PRD.md`, `UI_GUIDE.md`를 통해 관리.
- **비식별화 방식**: `reference/README_backend.md` 구조 기반.
- **키 관리**: 사용자별 API 키 생성, 삭제, 보기, 다운로드 기능 포함.

## 4. Agents / Skills / Hooks 운용 가이드
- **Agents (`.gemini/agents`)**:
  - `dev.md`: 개발 Agent로 서비스 개발 요소들을 Phase별로 구현.
  - `debug.md`: 검증 Agent로 Phase 종료 시 에러 검증 및 수정.
- **Skills (`.gemini/skills`)**: `karpathy-guidelines` 기반으로 기술 검토 및 코드 품질 관리 진행.
- **Hooks (`.gemini/settings.json`)**:
  - 파일 삭제 시 확인 절차 강제 (`delete_confirmation.sh`).
  - 코드 변경 후 `GEMINI.md`, `README.md`, `doc/*.md` 등 문서와 코드 동기화 (`sync_docs.sh`).
  - 단일 오류가 5번 이상 재발 시 Hook을 통해 알림 처리.

## 5. 금지 및 규제 사항
- 하드코딩된 환경변수, 비밀번호, API Key 소스코드 내 포함 금지 (`.env` 활용 필수).
- `node_modules` 디렉토리는 절대 Git 저장소에 커밋하지 않음.
