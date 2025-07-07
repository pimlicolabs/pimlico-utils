import { type Address, type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const ABI = [
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

export const executeBatchArraysDecoder: CalldataDecoder = (
    calldata: Hex
): [Address[], Hex[]] | null => {
    try {
        const {
            args: [targets, , datas]
        } = decodeFunctionData({
            abi: ABI,
            data: calldata
        })

        return [Array.from(targets), Array.from(datas)]
    } catch (e) {
        return null
    }
}
