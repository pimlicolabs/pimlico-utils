import { type Address, type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const ABI = [
    {
        name: "enableModules",
        type: "function",
        inputs: [
            {
                name: "to",
                type: "address[]",
                internalType: "address[]"
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const

export const enableModulesDecoder: CalldataDecoder = (
    calldata: Hex
): [Address[], Hex[]] | null => {
    try {
        const {
            args: [targets]
        } = decodeFunctionData({
            abi: ABI,
            data: calldata
        })

        return [Array.from(targets), []]
    } catch (e) {
        return null
    }
}
