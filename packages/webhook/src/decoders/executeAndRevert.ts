import { type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const EXECUTE_AND_REVERT_ABI = [
    {
        name: "executeAndRevert",
        type: "function",
        inputs: [
            {
                name: "target",
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

export const executeAndRevertDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [to, value, data]
        } = decodeFunctionData({
            abi: EXECUTE_AND_REVERT_ABI,
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
