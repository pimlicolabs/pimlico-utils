import { type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const ABI = [
    {
        name: "executeBySender",
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

export const executeBySenderDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [calls]
        } = decodeFunctionData({
            abi: ABI,
            data: calldata
        })

        return calls.map((call) => ({ ...call }))
    } catch (e) {
        return null
    }
}
