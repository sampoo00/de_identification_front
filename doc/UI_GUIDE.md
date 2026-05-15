# UI/UX Guide

본 문서는 MasGO 비식별화 시스템의 사용자 인터페이스 및 경험적 요소(Aesthetics)에 대한 명세서입니다.

## 1. 디자인 원칙 (Rich Aesthetics)
본 애플리케이션은 사용자로 하여금 "Premium 및 State of the Art" 이미지를 각인시킬 수 있도록 최신 모던 웹 트렌드를 준수합니다.

- **Vibrant & Dark Mode 기조**: 서비스의 민감 데이터 처리 특성(프라이버시 보안)과 고급 AI 엔진의 신뢰성을 시각화하기 위해 최상위 배경을 순흑색에 가까운 **`bg-gray-950`**으로 가져갑니다.
- **포인트 컬러 (Accent Colors)**:
  - 딥 블루(`blue-500`, `blue-600`): 기본 버튼, 인터랙션 및 프라이머리 텍스트
  - 바이올렛/퍼플 그라데이션: 백그라운드 Glow 이펙트 및 하이라이트(`bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6]`)
- **글래스모피즘 (Glassmorphism)**: 
  - 공통 네비게이션, 카드 형식 등은 투명도를 유지(`bg-gray-900/50`)하고 배경 블러(`backdrop-blur-md/sm`)를 주어 UI 간 깊이감(Depth)을 형성합니다.
  - 관련 Tailwind 클래스: `bg-gray-900/80 backdrop-blur-md border border-gray-800`

## 2. 타이포그래피 (Typography)
- **폰트 패밀리**: 기본적으로 **`Inter`** (Next/Font/Google 제공) 고딕/산세리프 서체를 사용하여 가독성과 모던함을 챙깁니다. 영어와 한글 모두 깔끔하게 떨어지는 라인 높이를 가집니다.
- **계층 구조**:
  - `h1`: `text-4xl font-bold tracking-tight md:text-6xl`
  - `h2`: `text-2xl font-semibold mb-4`
  - `Body`: `text-gray-300` / `text-gray-400`
  
## 3. 레이아웃 (Layout & Grid)
- **Max-Width 제한**: 콘텐츠 영역의 가시성을 위해 화면의 최고 너비를 `max-w-7xl` 단위로 제한합니다. (섹션에 따라 `max-w-5xl`, `max-w-4xl`로 집중도 조절됨 - ex: Keys, Technology 페이지)
- **반응형 (Responsive)**:
  - 모바일(`xs`~`sm`): 단일 컬럼 그리드 적용, 여백 좁게 설정(`px-4`). Navigation 내 항목 간소화.
  - 태블릿(`md` 이상): 2컬럼 지원, 네비게이션 전체 노출. `px-6`
  - 데스크톱(`lg` 이상): 3컬럼 확장(Demo Input vs Preview 비율 등 조정). `px-8`

## 4. 인터랙션 및 애니메이션 (Micro-animations)
기능(MVP)에 머무르지 않고, 사용자와 상호작용하는 느낌을 제공합니다.
- **버튼 Hover 상태**: 단순 배경색 변경에 그치지 않고 은은한 그림자(Glow) 효과를 더함. (`shadow-[0_0_15px_rgba(37,99,235,0.4)]` -> hover 시 Opacity 및 반경 증가)
- **전환(Transitions)**: 색상 변경, 호버 이펙트 등 모든 동적 변환 요소에는 `transition-all` 또는 `transition-colors`를 삽입하여 부드러운 전환을 보장합니다.
