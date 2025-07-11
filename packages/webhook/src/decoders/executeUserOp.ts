import { type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const EXECUTE_USER_OP_ABI = [
    {
        name: "executeUserOp",
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

export const executeUserOpDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [to, value, data]
        } = decodeFunctionData({
            abi: EXECUTE_USER_OP_ABI,
            data: calldata
        })

        return [{ to, value, data }]
    } catch (e) {
        return null
    }
}
