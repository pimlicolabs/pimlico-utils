import z from "zod/v4"
import { addressSchema, hexData32Schema, hexNumberSchema } from "./common"
import { paymasterContextSchema } from "./paymaster-context"
import { stateOverridesSchema } from "./state-overrides"
import {
    entryPointAwareEip7677UserOperationSchema,
    entryPointAwarePartialUserOperationSchema,
    entryPointAwareUserOperationSchema
} from "./userop"

const pmSupportedEntryPointsRequestSchema = z.object({
    method: z.literal("pm_supportedEntryPoints"),
    params: z.tuple([]),
    jsonrpc: z.literal("2.0"),
    id: z.number()
})

const pmGetPaymasterDataParamsSchema = z
    .tuple([
        z.looseObject({}),
        addressSchema,
        hexNumberSchema,
        paymasterContextSchema.nullish()
    ])
    .transform((params) => {
        const [userOp, entryPoint, ...rest] = params

        return [{ userOp, entryPoint }, ...rest]
    })
    .pipe(
        z.tuple([
            entryPointAwareEip7677UserOperationSchema,
            z.bigint(),
            paymasterContextSchema.nullish()
        ])
    )
    .transform((validated) => {
        const [discriminated, ...rest] = validated

        return [
            discriminated.userOp,
            discriminated.entryPoint,
            ...rest
        ] as const
    })

const pmGetPaymasterStubDataRequestSchema = z.object({
    method: z.literal("pm_getPaymasterStubData"),
    params: pmGetPaymasterDataParamsSchema,
    jsonrpc: z.literal("2.0"),
    id: z.number()
})

const pmGetPaymasterDataRequestSchema = z.object({
    method: z.literal("pm_getPaymasterData"),
    params: pmGetPaymasterDataParamsSchema,
    jsonrpc: z.literal("2.0"),
    id: z.number()
})

const pmSponsorUserOperationRequestSchema = z.object({
    method: z.literal("pm_sponsorUserOperation"),
    params: z
        .tuple([
            z.looseObject({}),
            addressSchema,
            z.looseObject({}).nullish(),
            z.looseObject({}).nullish()
        ])
        .transform((params) => {
            const [userOp, entryPoint, ...rest] = params
            return [{ userOp, entryPoint }, ...rest]
        })
        .pipe(
            z.tuple([
                entryPointAwareEip7677UserOperationSchema,
                paymasterContextSchema.nullish(),
                stateOverridesSchema.nullish()
            ])
        )
        .transform((validated) => {
            const [discriminated, ...rest] = validated

            return [
                discriminated.userOp,
                discriminated.entryPoint,
                ...rest
            ] as const
        }),
    jsonrpc: z.literal("2.0"),
    id: z.number()
})

const chainIdRequestSchema = z.object({
    method: z.literal("eth_chainId"),
    params: z.tuple([]),
    jsonrpc: z.literal("2.0"),
    id: z.number()
})

const supportedEntryPointsRequestSchema = z.object({
    method: z.literal("eth_supportedEntryPoints"),
    params: z.tuple([]),
    jsonrpc: z.literal("2.0"),
    id: z.number()
})

const estimateUserOperationGasRequestSchema = z.object({
    method: z.literal("eth_estimateUserOperationGas"),
    params: z
        .tuple([z.looseObject({}), addressSchema, z.looseObject({}).optional()])
        .transform((params) => {
            const [userOp, entryPoint, stateOverrides] = params

            return [{ userOp, entryPoint }, stateOverrides]
        })
        .pipe(
            z.tuple([
                entryPointAwarePartialUserOperationSchema,
                stateOverridesSchema.optional()
            ])
        )
        .transform((validated) => {
            const [discriminated, ...rest] = validated

            return [
                discriminated.userOp,
                discriminated.entryPoint,
                ...rest
            ] as const
        }),
    jsonrpc: z.literal("2.0"),
    id: z.number()
})

const sendUserOperationRequestSchema = z.object({
    method: z.literal("eth_sendUserOperation"),
    params: z
        .tuple([z.looseObject({}), addressSchema])
        .transform((params) => {
            const [userOp, entryPoint] = params

            return [{ userOp, entryPoint }]
        })
        .pipe(z.tuple([entryPointAwareUserOperationSchema]))
        .transform((validated) => {
            const [discriminated] = validated

            return [discriminated.userOp, discriminated.entryPoint] as const
        }),
    jsonrpc: z.literal("2.0"),
    id: z.number()
})

const getUserOperationByHashRequestSchema = z.object({
    method: z.literal("eth_getUserOperationByHash"),
    params: z.tuple([hexData32Schema]),
    jsonrpc: z.literal("2.0"),
    id: z.number()
})

const getUserOperationReceiptRequestSchema = z.object({
    method: z.literal("eth_getUserOperationReceipt"),
    params: z.tuple([hexData32Schema]),
    jsonrpc: z.literal("2.0"),
    id: z.number()
})

export {
    pmSupportedEntryPointsRequestSchema,
    pmGetPaymasterStubDataRequestSchema,
    pmGetPaymasterDataRequestSchema,
    pmSponsorUserOperationRequestSchema,
    chainIdRequestSchema,
    supportedEntryPointsRequestSchema,
    estimateUserOperationGasRequestSchema,
    sendUserOperationRequestSchema,
    getUserOperationByHashRequestSchema,
    getUserOperationReceiptRequestSchema
}
