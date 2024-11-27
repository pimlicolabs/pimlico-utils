import * as crypto from "crypto";
import { KeyFetcher } from "./types";
import { keyFetcher } from "./key-fetcher";

const messageHeaders = [
    "pimlico-key-version",
];

export const pimlicoWebhookVerifier = (apiKey: string) => async (headers: Record<string, string>, body: Buffer) => {
    const fetchKey = keyFetcher(apiKey);

    if (!Buffer.isBuffer(body)) {
        throw new Error("expected body to be a Buffer");
    }

    if (process.env.UNSAFE_SKIP_WEBHOOK_VERIFY != null) {
        return JSON.parse((body).toString());
    }

    if (!headers["content-type"]?.startsWith("application/json")) {
        throw new Error(`invalid webhook: expected application/json, got: ${headers["content-type"]}`);
    }

    const keyVersion = headers["pimlico-key-version"];

    if (!keyVersion) {
        throw new Error("invalid webhook: missing pimlico-key-version");
    }

    if (!body || body.length == 0) {
        throw new Error("invalid webhook: empty payload");
    }

    return new Promise(async (resolve, reject) => {
        const key = await fetchKey(keyVersion);

        const signature = Buffer.from(headers["pimlico-signature"] ?? "", "base64");

        const message = Buffer.concat(
            [
                ...messageHeaders.map((h) => Buffer.from(String(headers[h]))),
                body
            ],
        );

        if (!crypto.verify("sha256", message, key, signature)) {
            throw new Error("invalid webhook: signature validation failed");
        }

        resolve(JSON.parse(body.toString()));
    });
};
