# Architecture Decision Records (ADR)

이 문서는 지능형 비식별화 시스템(GEMINI) 프론트엔드 프로젝트 내의 주요 아키텍처 결정 사항을 기록합니다.

## ADR-001: Next.js 14 App Router 및 Tailwind CSS 채택
- **날짜**: 2026-05-14
- **상태**: 승인됨 (Phase 1 적용 완료)
- **배경**: AI 서비스 특성상 빠른 렌더링 성능과 SEO 최적화, 그리고 유연한 라우팅이 필요합니다. 더불어 모던한(Rich Aesthetics) UI의 빠른 구현이 요구됩니다.
- **결정 사항**:
  - React 기반의 프레임워크인 **Next.js 14**를 채택하며, 최신 라우팅 패러다임인 **App Router**(`src/app` 트랙)를 사용합니다.
  - 전역 상태나 스타일링의 복잡도를 낮추고 직관적인 유틸리티 클래스를 제공하는 **Tailwind CSS v3**를 사용합니다.
  - 타입 안정성 보장을 위해 **TypeScript (Strict Mode)**를 기본 적용하며, `any` 타입 사용을 강력히 금지합니다.
- **결과**:
  - `src/app` 및 하위 폴더별(`demo`, `keys`, `technology`)로 직관적인 파일 기반 라우팅이 설정되었습니다.
  - Tailwind 컴파일러를 통해 빌드 크기를 최소화하면서 글로벌 Dark Theme 및 Glassmorphism UI 구현이 용이해졌습니다.

## ADR-002: 보안 및 인증 체계 (API Key)
- **배경**: VLM/SAM3 기반 백엔드 API 시스템 접근 제어 및 사용자별 사용량 모니터링이 필요합니다.
- **결정 사항**:
  - 별도의 세션보다 **API Token(Secret Key)** 기반의 인증 체계를 채택합니다.
  - 프론트엔드 내 `/keys` 라우트를 통해 API Key 발급 및 관리 UI를 제공하여 사용자가 외부 애플리케이션 및 스크립트에서도 모델 환경을 사용할 수 있도록 보장합니다.

## ADR-003: 페이즈(Phase) 기반 점진적 구현 프로세스
- **결정 사항**:
  - 개발(dev)/검증(debug) 에이전트를 Phase 단위로 교차 운용합니다.
  - UI 기반 구축(Phase 1~2) -> API 연동(Phase 3) -> 심화 기능 및 최적화(Phase 4~5)의 흐름으로 진행하여 에러 전파를 차단합니다.
