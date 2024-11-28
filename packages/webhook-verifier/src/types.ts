import * as crypto from "crypto";
import { Address } from "viem";
import { UserOperation } from "viem/_types/account-abstraction/types/userOperation";
type Fetch = typeof fetch;

export type KeyFetcher = () => Promise<crypto.KeyObject>;

export interface KeyFetcherOptions {
    baseURL?: string;
    cache?: KeyCache;
    fetch?: Fetch;
}

export interface KeyCache {
    get(k: string): crypto.KeyObject | null | undefined;
    set(k: string, v: crypto.KeyObject): void;
}

export type PimlicoWebhookBody = PimlicoSponsorshipPolicyWebhookBody;

export type PimlicoSponsorshipPolicyWebhookBody = {
    type: "sponsorshipPolicy.webhook",
    data: {
        object: {
            userOperation: UserOperation,
            entryPoint: Address,
            chainId: number,
            sponsorshipPolicyId: string
        }
    }
}