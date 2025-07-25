import z from "zod/v4"
import { addressSchema, gasPriceSchema, hexData32Schema, hexNumberSchema, userOperationReceiptSchema, userOperationStatusSchema } from "./common"
import { paymasterContextSchema } from "./paymaster-context"
import { stateOverridesSchema } from "./state-overrides"
import {
    entryPointAwareEip7677UserOperationSchema,
    entryPointAwarePartialUserOperationSchema,
    entryPointAwareUserOperationSchema,
    userOperationSchema
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
            const [discriminated, paymasterContext, stateOverrides] = validated

            return [
                discriminated.userOp,
                discriminated.entryPoint,
                paymasterContext,
                stateOverrides
            ] as const
        }),
    jsonrpc: z.literal("2.0"),
    id: z.number()
})

const chainIdRequestSchema = z.object({
    method: z.literal("eth_chainId"),
    params: z.tuple([]),
    jsonrpc: z.literal("2.0"),
    id: z.number(),
    result: hexNumberSchema
})

const supportedEntryPointsRequestSchema = z.object({
    method: z.literal("eth_supportedEntryPoints"),
    params: z.tuple([]),
    jsonrpc: z.literal("2.0"),
    id: z.number(),
    result: z.array(addressSchema)
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
    id: z.number(),
    result: z.union([
        z.object({
            callGasLimit: hexNumberSchema,
            preVerificationGas: hexNumberSchema,
            verificationGasLimit: hexNumberSchema,
            verificationGas: hexNumberSchema.optional()
        }),
        z.object({
            callGasLimit: hexNumberSchema,
            preVerificationGas: hexNumberSchema,
            verificationGasLimit: hexNumberSchema,
            paymasterVerificationGasLimit: hexNumberSchema.optional(),
            paymasterPostOpGasLimit: hexNumberSchema.optional()
        })
    ])
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
    id: z.number(),
    result: hexData32Schema
})

const boostSendUserOperationRequestSchema = sendUserOperationRequestSchema.extend({
    method: z.literal("boost_sendUserOperation"),
})

const getUserOperationByHashRequestSchema = z.object({
    method: z.literal("eth_getUserOperationByHash"),
    params: z.tuple([hexData32Schema]),
    jsonrpc: z.literal("2.0"),
    id: z.number(),
    result: z
        .object({
            userOperation: userOperationSchema,
            entryPoint: addressSchema,
            blockNumber: hexNumberSchema,
            blockHash: hexData32Schema,
            transactionHash: hexData32Schema
        }).nullable()
})

const getUserOperationReceiptRequestSchema = z.object({
    method: z.literal("eth_getUserOperationReceipt"),
    params: z.tuple([hexData32Schema]),
    jsonrpc: z.literal("2.0"),
    id: z.number(),
    result: userOperationReceiptSchema.nullable()
})

const debugClearStateSchema = z.object({
    method: z.literal("debug_bundler_clearState"),
    params: z.tuple([]),
    result: z.literal("ok")
})

const debugClearMempoolSchema = z.object({
    method: z.literal("debug_bundler_clearMempool"),
    params: z.tuple([]),
    result: z.literal("ok")
})

const debugDumpMempoolSchema = z.object({
    method: z.literal("debug_bundler_dumpMempool"),
    params: z.tuple([addressSchema]),
    result: z.array(userOperationSchema)
})

const debugSendBundleNowSchema = z.object({
    method: z.literal("debug_bundler_sendBundleNow"),
    params: z.tuple([]),
    result: z.literal("ok")
})

const debugSetBundlingModeSchema = z.object({
    method: z.literal("debug_bundler_setBundlingMode"),
    params: z.tuple([z.enum(["manual", "auto"])]),
    result: z.literal("ok")
})

const debugSetReputationSchema = z.object({
    method: z.literal("debug_bundler_setReputation"),
    params: z.tuple([
        z.array(
            z.object({
                address: addressSchema,
                opsSeen: hexNumberSchema,
                opsIncluded: hexNumberSchema
            })
        ),
        addressSchema
    ]),
    result: z.literal("ok")
})

const debugDumpReputationSchema = z.object({
    method: z.literal("debug_bundler_dumpReputation"),
    params: z.tuple([addressSchema]),
    result: z.array(
        z.object({
            address: addressSchema,
            opsSeen: hexNumberSchema,
            opsIncluded: hexNumberSchema,
            status: hexNumberSchema.optional()
        })
    )
})

const debugClearReputationSchema = z.object({
    method: z.literal("debug_bundler_clearReputation"),
    params: z.tuple([]),
    result: z.literal("ok")
})

const debugGetStakeStatusSchema = z.object({
    method: z.literal("debug_bundler_getStakeStatus"),
    params: z.tuple([addressSchema, addressSchema]),
    result: z.object({
        stakeInfo: z.object({
            addr: z.string(),
            stake: z
                .string()
                .or(z.number())
                .or(z.bigint())
                .transform((val) => Number(val).toString()),
            unstakeDelaySec: z
                .string()
                .or(z.number())
                .or(z.bigint())
                .transform((val) => Number(val).toString())
        }),
        isStaked: z.boolean()
    })
})

const pimlicoGetUserOperationStatusSchema = z.object({
    method: z.literal("pimlico_getUserOperationStatus"),
    params: z.tuple([hexData32Schema]),
    result: userOperationStatusSchema
})

const pimlicoGetUserOperationGasPriceSchema = z.object({
    method: z.literal("pimlico_getUserOperationGasPrice"),
    params: z.tuple([]),
    result: gasPriceSchema
})

const pimlicoSendUserOperationNowSchema = z.object({
    method: z.literal("pimlico_sendUserOperationNow"),
    params: z.tuple([userOperationSchema, addressSchema]),
    result: userOperationReceiptSchema.or(z.null())
})

const pimlicoSimulateAssetChangeSchema = z.object({
    method: z.literal("pimlico_simulateAssetChange"),
    params: z.union([
        z.tuple([
            userOperationSchema,
            addressSchema, // entryPoint
            z.object({
                addresses: z.array(addressSchema),
                tokens: z.array(addressSchema)
            })
        ]),
        z.tuple([
            userOperationSchema,
            addressSchema, // entryPoint
            z.object({
                addresses: z.array(addressSchema),
                tokens: z.array(addressSchema)
            }),
            stateOverridesSchema // optional state overrides
        ])
    ]),
    result: z.array(
        z.object({
            address: addressSchema,
            token: addressSchema,
            balanceBefore: hexNumberSchema,
            balanceAfter: hexNumberSchema
        })
    )
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
    getUserOperationReceiptRequestSchema,
    debugClearStateSchema,
    debugClearMempoolSchema,
    debugDumpMempoolSchema,
    debugSendBundleNowSchema,
    debugSetBundlingModeSchema,
    debugSetReputationSchema,
    debugDumpReputationSchema,
    debugClearReputationSchema,
    boostSendUserOperationRequestSchema,
    debugGetStakeStatusSchema,
    pimlicoGetUserOperationStatusSchema,
    pimlicoGetUserOperationGasPriceSchema,
    pimlicoSendUserOperationNowSchema,
    pimlicoSimulateAssetChangeSchema
}
