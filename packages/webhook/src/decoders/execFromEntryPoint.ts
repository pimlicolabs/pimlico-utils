import { type Address, type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const EXEC_FROM_ENTRY_POINT_ABI = [
    {
        name: "execFromEntryPoint",
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
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const

export const execFromEntryPointDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [to, value, data]
        } = decodeFunctionData({
            abi: EXEC_FROM_ENTRY_POINT_ABI,
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
