import type { Address } from "viem"
import type { UserOperation } from "viem/account-abstraction"

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
