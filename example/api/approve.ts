import type { VercelRequest, VercelResponse } from '@vercel/node'
import { pimlicoWebhookVerifier } from '@pimlico/webhook-verifier'

const apiKey = process.env.PIMLICO_API_KEY as string;

const verifyWebhook = pimlicoWebhookVerifier(apiKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = await verifyWebhook(req.headers as Record<string, string>, Buffer.from(JSON.stringify(req.body)));

  return res.status(200).json({
    sponsor: true
  })
}
