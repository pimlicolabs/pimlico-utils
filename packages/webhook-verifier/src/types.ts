import * as crypto from "crypto";
type Fetch = typeof fetch;

export type KeyFetcher = (version: string) => Promise<crypto.KeyObject>;

export interface KeyFetcherOptions {
    baseURL?: string;
    cache?: KeyCache;
    fetch?: Fetch;
}

export interface KeyCache {
    get(k: string): crypto.KeyObject | null | undefined;
    set(k: string, v: crypto.KeyObject): void;
}
