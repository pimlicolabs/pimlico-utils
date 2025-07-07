import { type Address, type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

// https://openchain.xyz/signatures?query=0x9e5d4c49
const EXECUTE_CALL_ABI = [
    {
        name: "executeCall",
        type: "function",
        inputs: [
            {
                name: "to",
                type: "address",
                internalType: "address"
            },
            {
                name: "value",
                type: "uint256",
                internalType: "uint256"
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

export const executeCallDecoder: CalldataDecoder = (
    calldata: Hex
): [Address[], Hex[]] | null => {
    try {
        const {
            args: [target]
        } = decodeFunctionData({
            abi: EXECUTE_CALL_ABI,
            data: calldata
        })

        return [[target], []]
    } catch (e) {
        return null
    }
}
