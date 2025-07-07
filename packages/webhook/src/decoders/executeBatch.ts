import { type Address, type Hex, decodeFunctionData } from "viem"
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

export const executeBatchDecoder: CalldataDecoder = (
    calldata: Hex
): [Address[], Hex[]] | null => {
    try {
        const {
            args: [calls]
        } = decodeFunctionData({
            abi: EXECUTE_BATCH_ABI,
            data: calldata
        })

        const targets = calls.map((call) => call.to)
        const calldatas = calls.map((call) => call.data)

        return [targets, calldatas]
    } catch (e) {
        return null
    }
}
