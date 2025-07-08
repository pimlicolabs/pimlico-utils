import { type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const EXECUTE_BATCH_ABI = [
    {
        name: "executeBatch",
        type: "function",
        inputs: [
            {
                name: "calls",
                type: "tuple[]",
                internalType: "struct Call[]",
                components: [
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
                ]
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const

export const executeBatchDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [calls]
        } = decodeFunctionData({
            abi: EXECUTE_BATCH_ABI,
            data: calldata
        })

        return calls.map((call) => ({
            ...call
        }))
    } catch (e) {
        return null
    }
}
