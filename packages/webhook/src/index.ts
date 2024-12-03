import basex from "base-x"
import { Webhook } from "svix"
import type { PimlicoSponsorshipPolicyWebhookBody } from "./types"

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvxyz" // no 'w', it's used for padding only

const bs58 = basex(ALPHABET)

export const pimlicoWebhookVerifier = (webhookSecret: string) => {
    const webhookSecretHex = Buffer.from(
        bs58.decode(webhookSecret.replace("pim_whsec_", ""))
    ).toString("hex")

    const verify = (headers: Record<string, string>, payload: string) => {
        const wh = new Webhook(webhookSecretHex)

        if (!payload || payload.length === 0) {
            throw new Error("invalid webhook: empty payload")
        }

        return wh.verify(
            payload,
            headers
        ) as PimlicoSponsorshipPolicyWebhookBody
    }

    return verify
}
