import type { VercelRequest, VercelResponse } from "@vercel/node"

export default function handler(req: VercelRequest, res: VercelResponse) {
    setTimeout(() => {
        return res.status(200).json({
            sponsor: true
        })
    }, 10_000)
}
