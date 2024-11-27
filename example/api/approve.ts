import type { VercelRequest, VercelResponse } from '@vercel/node'
import { pimlicoWebhookVerifier } from '@pimlico/webhook-verifier'

const apiKey = process.env.PIMLICO_API_KEY as string;

const verifyWebhook = pimlicoWebhookVerifier(apiKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(req.headers);
  console.log(req.body);

  const body = await verifyWebhook(req.headers as Record<string, string>, req.body);

  console.log(body);

  return res.status(200).json({
    sponsor: true
  })
}
