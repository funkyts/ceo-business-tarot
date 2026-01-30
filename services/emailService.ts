export interface SubscribeRequest {
    email: string;
    name: string;
}

export interface SubscribeResponse {
    success: boolean;
    message: string;
    error?: string;
}

export async function subscribeEmail(email: string, name: string): Promise<SubscribeResponse> {
    try {
        console.log('🔵 Sending request to /api/subscribe');
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, name }),
        });

        console.log('🔵 Response status:', response.status);
        console.log('🔵 Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('🔴 API Error:', errorText);
            return {
                success: false,
                message: '',
                error: `API 오류: ${response.status} - ${errorText}`
            };
        }

        const data = await response.json();
        console.log('🟢 API Success:', data);
        return data;
    } catch (error) {
        console.error('🔴 Network error:', error);
        return {
            success: false,
            message: '',
            error: `네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        };
    }
}
