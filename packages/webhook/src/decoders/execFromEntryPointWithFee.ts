import { type Address, type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const EXEC_FROM_ENTRY_POINT_WITH_FEE_ABI = [
    {
        name: "execFromEntryPointWithFee",
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
                name: "feeInfo",
                type: "tuple",
                internalType: "struct FeeInfo",
                components: [
                    {
                        name: "token",
                        type: "address",
                        internalType: "address"
                    },
                    {
                        name: "recipient",
                        type: "address",
                        internalType: "address"
                    },
                    {
                        name: "amount",
                        type: "uint256",
                        internalType: "uint256"
                    }
                ]
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const

export const execFromEntryPointWithFeeDecoder: CalldataDecoder = (
    calldata: Hex
) => {
    try {
        const {
            args: [to, value, data]
        } = decodeFunctionData({
            abi: EXEC_FROM_ENTRY_POINT_WITH_FEE_ABI,
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
