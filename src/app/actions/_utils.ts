

export type ActionResult<T = undefined> = {
    success: boolean;
    data?: T;
    error?: string;
};

export function ok<T>(data?: T): ActionResult<T> {
    return { success: true, data };
}

export function fail(message: string): ActionResult {
    return { success: false, error: message };
}
