import { pimlicoWebhookVerifier } from "@pimlico/webhook"
import type { VercelRequest, VercelResponse } from "@vercel/node"

const webhookSecret = process.env.PIMLICO_WEBHOOK_SECRET as string

const verifyWebhook = pimlicoWebhookVerifier(webhookSecret)

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const webhookEvent = verifyWebhook(
        req.headers as Record<string, string>,
        JSON.stringify(req.body)
    )

    // console.log(webhookEvent.data.object.userOperation)

    return res.status(200).json({
        sponsor: true
    })
}
