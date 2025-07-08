import { type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

// https://openchain.xyz/signatures?query=0xb61d27f6
const EXECUTE_ABI = [
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

export const executeDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [to, value, data]
        } = decodeFunctionData({
            abi: EXECUTE_ABI,
            data: calldata
        })

        return [
            {
                to,
                value,
                data
            }
        ]
    } catch (e) {
        return null
    }
}
