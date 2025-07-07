import { type Address, type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

// https://openchain.xyz/signatures?query=0x51945447
const EXECUTE_WITH_FLAG_ABI = [
    {
        name: "execute",
        type: "function",
        inputs: [
            {
                name: "to",
                type: "address",
                internalType: "address"
            },
            {
                name: "data",
                type: "bytes",
                internalType: "bytes"
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const

export const executeAddressBytesDecoder: CalldataDecoder = (
    calldata: Hex
): [Address[], Hex[]] | null => {
    try {
        const {
            args: [target, data]
        } = decodeFunctionData({
            abi: EXECUTE_WITH_FLAG_ABI,
            data: calldata
        })

        return [[target], [data]]
    } catch (e) {
        return null
    }
}
