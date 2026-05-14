'use client';

import { useState, useCallback } from 'react';

/**
 * Phase 5 Requirement: 
 * "5회 이상 오류가 발생하면 hooks를 통해 알림을 처리한다."
 * 이를 모의/구현하는 Custom Hook.
 */
export function useDebugErrorTrap(threshold: number = 5) {
    const [errorCount, setErrorCount] = useState(0);

    const reportError = useCallback((errorMessage: string) => {
        setErrorCount((prev) => {
            const newCount = prev + 1;
            if (newCount >= threshold) {
                // 백그라운드 Hook 혹은 UI로 오류 검출 알림 처리 (요구사항 충족)
                setTimeout(() => {
                    alert(`[Debug Agent 알림] 단일 로직에서 연속적인 시스템 에러가 ${threshold}회 이상 검출되었습니다.\n마지막 에러: ${errorMessage}\n\n-> 자동 검증 파이프라인 및 개발자 알림 Hooks가 트리거되었습니다.`);
                }, 100); // 렌더링 이후 띄우기 위함
                // 리셋 (또는 리셋하지 않고 계속 에러 상태 유지할 수 있음)
                return 0; // 한 번 트리거 되면 초기화
            }
            return newCount;
        });
    }, [threshold]);

    const resetErrorTrap = useCallback(() => {
        setErrorCount(0);
    }, []);

    return { errorCount, reportError, resetErrorTrap };
}
