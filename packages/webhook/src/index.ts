import basex from "base-x"
import { Webhook } from "svix"
import type { Address, Hex } from "viem"
import type { PimlicoSponsorshipPolicyWebhookBody } from "./types"
import type { CalldataDecoder } from "./decoders/base"
import { enableModulesDecoder } from "./decoders/enableModules"
import { execBatchTransactionFromEntrypointDecoder } from "./decoders/execBatchTransactionFromEntrypoint"
import { execFromEntryPointDecoder } from "./decoders/execFromEntryPoint"
import { execFromEntryPointWithFeeDecoder } from "./decoders/execFromEntryPointWithFee"
import { executeDecoder } from "./decoders/execute"
import { executeAddressBytesDecoder } from "./decoders/executeAddressBytes"
import { executeAndRevertDecoder } from "./decoders/executeAndRevert"
import { executeBatchDecoder } from "./decoders/executeBatch"
import { executeBatchArraysDecoder } from "./decoders/executeBatchArrays"
import { executeBatchCallDecoder } from "./decoders/executeBatchCall"
import { executeBatchSimpleDecoder } from "./decoders/executeBatchSimple"
import { executeBatchY6UDecoder } from "./decoders/executeBatchY6U"
import { executeBySenderDecoder } from "./decoders/executeBySender"
import { executeCallDecoder } from "./decoders/executeCall"
import { executeKernelDecoder } from "./decoders/executeKernel"
import { executeNcCDecoder } from "./decoders/executeNcC"
import { executeSingleDecoder } from "./decoders/executeSingle"
import { executeUserOpDecoder } from "./decoders/executeUserOp"
import { executeUserOpWithErrorStringDecoder } from "./decoders/executeUserOpWithErrorString"
import { executeWithFlagDecoder } from "./decoders/executeWithFlag"
import { installModuleDecoder } from "./decoders/installModule"
import { multiSendDecoder } from "./decoders/multiSend"
import { transferDecoder } from "./decoders/transfer"

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvxyz" // no 'w', it's used for padding only

const bs58 = basex(ALPHABET)

export const pimlicoWebhookVerifier = (webhookSecret: string) => {
    const webhookSecretHex = Buffer.from(
        bs58.decode(webhookSecret.replace("pim_whsec_", ""))
    ).toString("hex")

    const verify = (headers: Record<string, string>, payload: string) => {
        const wh = new Webhook(webhookSecretHex)

        if (!payload || payload.length === 0) {
            throw new Error("invalid webhook: empty payload")
        }

        return wh.verify(
            payload,
            headers
        ) as PimlicoSponsorshipPolicyWebhookBody
    }

    return verify
}

const decoders: CalldataDecoder[] = [
    enableModulesDecoder,
    execBatchTransactionFromEntrypointDecoder,
    execFromEntryPointDecoder,
    execFromEntryPointWithFeeDecoder,
    executeDecoder,
    executeAddressBytesDecoder,
    executeAndRevertDecoder,
    executeBatchDecoder,
    executeBatchArraysDecoder,
    executeBatchCallDecoder,
    executeBatchSimpleDecoder,
    executeBatchY6UDecoder,
    executeBySenderDecoder,
    executeCallDecoder,
    executeKernelDecoder,
    executeNcCDecoder,
    executeSingleDecoder,
    executeUserOpDecoder,
    executeUserOpWithErrorStringDecoder,
    executeWithFlagDecoder,
    installModuleDecoder,
    multiSendDecoder,
    transferDecoder
]

export const getCallDataTargets = (callData: Hex): Address[] => {
    for (const decoder of decoders) {
        const result = decoder(callData)

        if (result === null) continue

        const [targets, parsedCallData] = result

        const internalTargets = parsedCallData.flatMap((calldata) =>
            getCallDataTargets(calldata)
        )

        const response = [...targets, ...internalTargets]

        return Array.from(new Set(response))
    }

    return []
}
