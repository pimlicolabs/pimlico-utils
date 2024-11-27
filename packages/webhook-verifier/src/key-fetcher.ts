import * as crypto from "crypto";
import { KeyFetcher, KeyFetcherOptions } from "./types";


const keysBaseURL = "https://api.pimlico.io/webhook-key";

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
    const fetch = options?.fetch ?? global.fetch;
    const keyCache = options?.cache ?? new KeyCache(60 * 60 * 1000);

    const normalBaseURL = (options?.baseURL ?? keysBaseURL).replace(/\/$/, "");

    return (version: string) =>
        new Promise(async (res) =>
            res(
                (keyCache.get(version)) ??
                fetch(`${normalBaseURL}/${version}?apiKey=${apiKey}`).then(async (r) => {
                    if (!r.ok) {
                        return Promise.reject(
                            new Error(`error fetching key: ${r.status}`)
                        );
                    }

                    if (!r.body) {
                        return Promise.reject(
                            new Error("error fetching key: empty response")
                        );
                    }

                    const keyBytes = await r.arrayBuffer();
                    const key = crypto.createPublicKey(Buffer.from(keyBytes));

                    keyCache.set(version, key);

                    return key;
                })
            )
        );
};

export { keyFetcher as pimlicoKeyFetcher };