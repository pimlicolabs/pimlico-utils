import { z } from "zod/v4"

const rpcCallSchema = z
    .object({
        jsonrpc: z.literal("2.0"),
        id: z.number(),
        method: z.string(),
        params: z
            .array(z.unknown())
            .optional()
            .transform((val) => val ?? [])
    })
    .strict()

const jsonRpcSchema = z.union([rpcCallSchema, z.array(rpcCallSchema)])

type JSONRPCRequest = z.infer<typeof jsonRpcSchema>

const jsonRpcResultSchema = z
    .object({
        jsonrpc: z.literal("2.0"),
        id: z.number(),
        result: z.unknown()
    })
    .strict()

type JSONRPCResponse = z.infer<typeof jsonRpcResultSchema>

export { jsonRpcSchema, jsonRpcResultSchema, type JSONRPCRequest, type JSONRPCResponse }