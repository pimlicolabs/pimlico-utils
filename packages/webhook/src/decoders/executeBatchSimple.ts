import { type Address, type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const EXECUTE_BATCH_SIMPLE_ABI = [
    {
        name: "executeBatch",
        type: "function",
        inputs: [
            {
                name: "targets",
                type: "address[]",
                internalType: "address[]"
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

export const executeBatchSimpleDecoder: CalldataDecoder = (
    calldata: Hex
): [Address[], Hex[]] | null => {
    try {
        const {
            args: [targets, datas]
        } = decodeFunctionData({
            abi: EXECUTE_BATCH_SIMPLE_ABI,
            data: calldata
        })

        return [Array.from(targets), Array.from(datas)]
    } catch (e) {
        return null
    }
}
