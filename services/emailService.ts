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
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, name }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Email subscription error:', error);
        return {
            success: false,
            message: '',
            error: '네트워크 오류가 발생했습니다.',
        };
    }
}
