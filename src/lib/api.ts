const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8020/api/v1';

export interface DeidentifyRequest {
    image: File;
    prompt: string;
    target: 'inner' | 'outer';
    category?: string;
    shape?: 'bbox' | 'circle' | 'ellipse';
    level?: number | null; // number for 1-10, null for Auto
    apiKey?: string;
    onStatusUpdate?: (status: string) => void;
}

export interface DeidentifyResponse {
    success: boolean;
    message?: string;
    resultUrl?: string;
    metadata?: any;
    status?: string;
    jobId?: string;
}

/**
 * API 키 형식이 올바른지 확인합니다 (sk-mg- 접두어 확인)
 */
export const isValidApiKey = (key: string) => {
    return key.startsWith('sk-mg-');
};

export async function processDeidentify(req: DeidentifyRequest): Promise<DeidentifyResponse> {
    const formData = new FormData();
    formData.append('image', req.image);
    formData.append('prompt', req.prompt);
    formData.append('target', req.target);
    formData.append('category', req.category || 'VLM');
    formData.append('shape', req.shape || 'bbox');
    
    if (req.level !== undefined) {
        formData.append('level', req.level === null ? 'None' : req.level.toString());
    }

    const apiKey = req.apiKey || 'default-masgo-key';

    // API 키 유효성 검사 (기본 키 제외)
    if (apiKey !== 'default-masgo-key' && !isValidApiKey(apiKey)) {
        return { 
            success: false, 
            message: '유효하지 않은 API 키 형식입니다. (sk-mg- 접두어 필요)' 
        };
    }

    try {
        // 1. Enqueue the job
        const enqueueRes = await fetch(`${API_BASE_URL}/deidentify/enqueue`, {
            method: 'POST',
            headers: { 'X-API-Key': apiKey },
            body: formData,
        });

        const enqueueData = await enqueueRes.json();
        const status = enqueueData.status;

        if (status === 'waiting') {
            return { success: false, message: `Queue is currently full: ${enqueueData.message}` };
        }

        if (status !== 'queued') {
            return { success: false, message: enqueueData.message || 'Failed to queue the task.' };
        }

        const jobId = enqueueData.job_id;
        if (!jobId) {
            return { success: false, message: 'Job ID not received from server.' };
        }

        if (req.onStatusUpdate) req.onStatusUpdate('pending');

        // 2. Poll for status
        let attempts = 0;
        const maxAttempts = 60; // 120 seconds max if 2s interval
        const pollInterval = 2000; 

        while (attempts < maxAttempts) {
            const statusRes = await fetch(`${API_BASE_URL}/deidentify/status/${jobId}`, {
                headers: { 'X-API-Key': apiKey }
            });

            if (statusRes.ok) {
                const statusData = await statusRes.json();
                const currentStatus = statusData.status;

                if (currentStatus === 'success') {
                    if (req.onStatusUpdate) req.onStatusUpdate('completed');
                    return {
                        success: true,
                        // 테스트 코드의 download 로직 참조: /api/v1/download/{job_id}
                        resultUrl: `${API_BASE_URL}/download/${jobId}`,
                        metadata: statusData.result,
                        status: 'completed',
                        jobId
                    };
                } else if (currentStatus === 'failed') {
                    if (req.onStatusUpdate) req.onStatusUpdate('failed');
                    return {
                        success: false,
                        message: statusData.error || 'Job processing failed.',
                        status: 'failed'
                    };
                } else if (currentStatus === 'waiting') {
                    const pos = statusData.queue_position || 'unknown';
                    if (req.onStatusUpdate) req.onStatusUpdate(`waiting (Pos: ${pos})`);
                } else {
                    if (req.onStatusUpdate) req.onStatusUpdate(currentStatus);
                }
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        return { success: false, message: 'Processing timeout.' };

    } catch (error: any) {
        return {
            success: false,
            message: error.message || '네트워크 오류가 발생했습니다.',
        };
    }
}
