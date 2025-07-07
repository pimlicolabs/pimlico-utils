import { type Address, type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const EXECUTE_NCC_ABI = [
    {
        name: "execute_ncC",
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

export const executeNcCDecoder: CalldataDecoder = (
    calldata: Hex
): [Address[], Hex[]] | null => {
    try {
        const {
            args: [target, , data]
        } = decodeFunctionData({
            abi: EXECUTE_NCC_ABI,
            data: calldata
        })

        return [[target], [data]]
    } catch (e) {
        return null
    }
}
