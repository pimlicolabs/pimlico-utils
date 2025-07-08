import { type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

// https://openchain.xyz/signatures?query=0xb61d27f6
const ABI = [
    {
        name: "transfer",
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
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const

export const transferDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [to, value]
        } = decodeFunctionData({
            abi: ABI,
            data: calldata
        })

        return [{ to, value, data: "0x" }]
    } catch (e) {
        return null
    }
}
