import type { Address } from "viem"
import type { UserOperation } from "viem/account-abstraction"

export type PimlicoWebhookBody = PimlicoSponsorshipPolicyWebhookBody

export type PimlicoSponsorshipPolicyWebhookBody = {
    type:
        | "user_operation.sponsorship.requested"
        | "user_operation.sponsorship.finalized"
    data: {
        object: {
            userOperation: UserOperation
            entryPoint: Address
            chainId: number
            sponsorshipPolicyId: string
            apiKey: string
            paymasterContext: unknown
        }
    }
}
