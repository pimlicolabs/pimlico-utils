import * as crypto from "node:crypto"
import { keyFetcher } from "./key-fetcher"
import type { PimlicoSponsorshipPolicyWebhookBody } from "./types"

export const pimlicoWebhookVerifier =
    (apiKey: string) =>
    async (headers: Record<string, string>, body: Buffer) => {
        const fetchKey = keyFetcher(apiKey)

        if (!Buffer.isBuffer(body)) {
            throw new Error("expected body to be a Buffer")
        }

        if (process.env.UNSAFE_SKIP_WEBHOOK_VERIFY != null) {
            return JSON.parse(
                body.toString()
            ) as PimlicoSponsorshipPolicyWebhookBody
        }

        if (!body || body.length === 0) {
            throw new Error("invalid webhook: empty payload")
        }

        const key = await fetchKey()

        const signature = Buffer.from(
            headers["pimlico-signature"] ?? "",
            "base64"
        )

        const message = Buffer.concat([body])

        if (!crypto.verify("sha256", message, key, signature)) {
            throw new Error("invalid webhook: signature validation failed")
        }

        return JSON.parse(
            body.toString()
        ) as PimlicoSponsorshipPolicyWebhookBody
    }
