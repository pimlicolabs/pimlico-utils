import { type Address, type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const EXECUTE_BATCH_Y6U_ABI = [
    {
        name: "executeBatch_y6U",
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
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const

export const executeBatchY6UDecoder: CalldataDecoder = (
    calldata: Hex
): [Address[], Hex[]] | null => {
    try {
        const {
            args: [targets, , datas]
        } = decodeFunctionData({
            abi: EXECUTE_BATCH_Y6U_ABI,
            data: calldata
        })

        return [Array.from(targets), Array.from(datas)]
    } catch (e) {
        return null
    }
}
