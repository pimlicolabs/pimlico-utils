import { type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const EXECUTE_SINGLE_ABI = [
    {
        name: "execute",
        type: "function",
        inputs: [
            {
                name: "call",
                type: "tuple",
                internalType: "struct Call",
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

export const executeSingleDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [call]
        } = decodeFunctionData({
            abi: EXECUTE_SINGLE_ABI,
            data: calldata
        })

        return [call]
    } catch (e) {
        return null
    }
}
