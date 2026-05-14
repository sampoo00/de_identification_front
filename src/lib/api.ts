const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8020/api/v1';

export interface DeidentifyRequest {
    image: File;
    prompt: string;
    target: 'inner' | 'outer';
    category?: string;
    apiKey?: string;
}

export interface DeidentifyResponse {
    success: boolean;
    message?: string;
    resultUrl?: string;
    metadata?: any;
}

export async function processDeidentify(req: DeidentifyRequest): Promise<DeidentifyResponse> {
    const formData = new FormData();
    formData.append('image', req.image);
    formData.append('prompt', req.prompt);
    formData.append('target', req.target);
    formData.append('category', req.category || 'SEGMENTATION');

    const apiKey = req.apiKey || 'default-masgo-key'; // 실제 서비스에서는 localStorage/상태관리에서 가져옴

    try {
        const res = await fetch(`${API_BASE_URL}/deidentify/`, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                // FormData 사용시 Content-Type은 브라우저가 자동 설정함
            },
            body: formData,
        });

        if (!res.ok) {
            const errorText = await res.text();
            return { success: false, message: `API Error: ${res.status} - ${errorText}` };
        }

        // 서버 응답이 URL 문자열 혹은 JSON 정보 (Result: Image URL + Metadata 형식)
        const json = await res.json();

        // 백엔드 아키텍처에 맞춰 변경 가능 (여기서는 일반적인 json { result_url: '...' } 모델 가정)
        return {
            success: true,
            resultUrl: json.result_url || json.url || json.image_url,
            metadata: json.metadata || json,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || '네트워크 오류가 발생했습니다.',
        };
    }
}
