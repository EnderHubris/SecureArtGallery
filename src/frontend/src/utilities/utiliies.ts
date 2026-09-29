// method is specifically made for running in the browser
export async function str2sha256(value: string): Promise<string> {
    const data = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * By default with no explicit definition
 * this is ran in context of nginx where
 * there us a reverse-proxy of /api -> localhost:8888
 * 
 * @returns 
 */
export function GetBackendStr(dir: string) {
    const url = new URL((import.meta.env.VITE_BACK_END_HOST ?? '/api/') + dir)
    return url.toString();
}