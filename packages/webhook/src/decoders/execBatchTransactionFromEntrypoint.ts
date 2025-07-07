import { type Address, type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const EXEC_BATCH_TRANSACTION_FROM_ENTRYPOINT_ABI = [
    {
        name: "execBatchTransactionFromEntrypoint",
        type: "function",
        inputs: [
            {
                name: "targets",
                type: "address[]",
                internalType: "address[]"
            },
            {
                name: "values",
                type: "uint256[]",
                internalType: "uint256[]"
            },
            {
                name: "datas",
                type: "bytes[]",
                internalType: "bytes[]"
            },
            {
                name: "flag",
                type: "uint8",
                internalType: "uint8"
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const

export const execBatchTransactionFromEntrypointDecoder: CalldataDecoder = (
    calldata: Hex
): [Address[], Hex[]] | null => {
    try {
        const {
            args: [targets, , datas]
        } = decodeFunctionData({
            abi: EXEC_BATCH_TRANSACTION_FROM_ENTRYPOINT_ABI,
            data: calldata
        })

        return [Array.from(targets), Array.from(datas)]
    } catch (e) {
        return null
    }
}
