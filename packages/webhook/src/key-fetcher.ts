import * as crypto from "crypto";
import type { KeyFetcher, KeyFetcherOptions } from "./types";


const keysBaseURL = "https://api-staging.pimlico.io/webhook-public-key";

export class KeyCache {
    private cache = new Map<string, crypto.KeyObject>();
    private expirationInMs: number;

    constructor(expirationInMs: number) {
        this.expirationInMs = expirationInMs;
    }

    get(k: string): crypto.KeyObject | null | undefined {
        return this.cache.get(k);
    }

    set(k: string, v: crypto.KeyObject): void {
        this.cache.set(k, v);

        setTimeout(() => {
            this.cache.delete(k);
        }, this.expirationInMs);
    }
}

export const keyFetcher = (apiKey: string, options: KeyFetcherOptions = {}): KeyFetcher => {
    const fetch = options?.fetch ?? (() => Promise.reject(new Error("no fetch function provided")));
    const keyCache = options?.cache ?? new KeyCache(60 * 60 * 1000);

    const normalBaseURL = (options?.baseURL ?? keysBaseURL).replace(/\/$/, "");

    return async () => {
        const cachedKey = keyCache.get('key');

        if (cachedKey) {
            return cachedKey;
        }

        const url = `${normalBaseURL}?apikey=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            return Promise.reject(new Error(`error fetching key: ${response.status}`));
        }

        if (!response.body) {
            return Promise.reject(new Error("error fetching key: empty response"));
        }

        const keyBytes = await response.arrayBuffer();
        const key = crypto.createPublicKey(Buffer.from(keyBytes));

        keyCache.set('key', key);

        return key;
    };
};

export { keyFetcher as pimlicoKeyFetcher };