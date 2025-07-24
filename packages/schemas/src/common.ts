import { type Hash, type Hex, getAddress, maxUint256 } from "viem"
import z from "zod/v4"
import { ofacList } from "./utils"

const hexDataPattern = /^0x[0-9A-Fa-f]*$/
const addressPattern = /^0x[0-9,a-f,A-F]{40}$/
const hexData32Pattern = /^0x([0-9a-fA-F][0-9a-fA-F]){32}$/

const addressSchema = z
    .string()
    .regex(addressPattern, { message: "not a valid hex address" })
    .transform((val) => getAddress(val))

const hexNumberSchema = z
    .string()
    .regex(hexDataPattern)
    .or(z.number())
    .or(z.bigint())
    .check((ctx) => {
        // This function is used to refine the input and provide a context where you have access to the path.
        try {
            if (ctx.value === "0x") {
                return
            }

            const bigIntData = BigInt(ctx.value) // Attempt to convert to BigInt to validate it can be done

            if (bigIntData > maxUint256) {
                ctx.issues.push({
                    code: "custom",
                    message:
                        "Invalid hexNumber, hexNumber cannot be greater than MAX_UINT_256",
                    input: ctx.value
                })
            }
        } catch {
            ctx.issues.push({
                code: "custom",
                message:
                    "Invalid input, expected a value that can be converted to bigint.",
                input: ctx.value
            })
        }
    })
    .transform((val) => {
        if (val === "0x") {
            return 0n
        }

        return BigInt(val)
    })
const hexDataSchema = z
    .string()
    .regex(hexDataPattern, { message: "not valid hex data" })
    .max(1000000, {
        message: "hex data too long, maximum length is 500,000 bytes"
    })
    .transform((val) => val.toLowerCase() as Hex)
const hexData32Schema = z
    .string()
    .regex(hexData32Pattern, { message: "not valid 32-byte hex data" })
    .transform((val) => val.toLowerCase() as Hash)

type Address = z.infer<typeof addressSchema>
type HexNumber = z.infer<typeof hexNumberSchema>
type HexData = z.infer<typeof hexDataSchema>
type HexData32 = z.infer<typeof hexData32Schema>

const compliantAddressSchema = addressSchema.refine(
    (val) => !ofacList.includes(val),
    {
        message: "Address is blacklisted"
    }
)

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

export {
    addressSchema,
    hexNumberSchema,
    hexDataSchema,
    hexData32Schema,
    compliantAddressSchema,
    jsonRpcSchema,
    jsonRpcResultSchema,
    type Address,
    type HexNumber,
    type HexData,
    type HexData32,
    type JSONRPCRequest
}
