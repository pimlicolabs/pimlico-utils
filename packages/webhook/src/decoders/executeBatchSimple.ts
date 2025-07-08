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

export const executeBatchSimpleDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [targets, data]
        } = decodeFunctionData({
            abi: EXECUTE_BATCH_SIMPLE_ABI,
            data: calldata
        })

        return targets.map((target, index) => ({
            to: target,
            value: 0n,
            data: data[index]
        }))
    } catch (e) {
        return null
    }
}
