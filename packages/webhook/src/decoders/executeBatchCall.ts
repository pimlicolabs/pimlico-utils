import { type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const EXECUTE_BATCH_CALL_ABI = [
    {
        name: "executeBatchCall",
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

export const executeBatchCallDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [targets, values, data]
        } = decodeFunctionData({
            abi: EXECUTE_BATCH_CALL_ABI,
            data: calldata
        })

        return targets.map((target, index) => ({
            to: target,
            value: values[index],
            data: data[index]
        }))
    } catch (e) {
        return null
    }
}
