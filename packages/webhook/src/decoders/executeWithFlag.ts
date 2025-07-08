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
                name: "value",
                type: "uint256",
                internalType: "uint256"
            },
            {
                name: "data",
                type: "bytes",
                internalType: "bytes"
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

export const executeWithFlagDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [to, value, data]
        } = decodeFunctionData({
            abi: EXECUTE_WITH_FLAG_ABI,
            data: calldata
        })

        return [{ to, value, data }]
    } catch (e) {
        return null
    }
}
