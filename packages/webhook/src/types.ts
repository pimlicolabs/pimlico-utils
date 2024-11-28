import type * as crypto from "node:crypto"
import type { Address } from "viem"
import type { UserOperation } from "viem/account-abstraction"
type Fetch = typeof fetch

export type KeyFetcher = () => Promise<crypto.KeyObject>

export interface KeyFetcherOptions {
    baseURL?: string
    cache?: KeyCache
    fetch?: Fetch
}

export interface KeyCache {
    get(k: string): crypto.KeyObject | null | undefined
    set(k: string, v: crypto.KeyObject): void
}

export type PimlicoWebhookBody = PimlicoSponsorshipPolicyWebhookBody

export type PimlicoSponsorshipPolicyWebhookBody = {
    type: "sponsorshipPolicy.webhook"
    data: {
        object: {
            userOperation: UserOperation
            entryPoint: Address
            chainId: number
            sponsorshipPolicyId: string
        }
    }
}
