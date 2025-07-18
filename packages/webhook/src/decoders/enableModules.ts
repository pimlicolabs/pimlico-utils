import { type Hex, decodeFunctionData } from "viem"
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

export const enableModulesDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [targets]
        } = decodeFunctionData({
            abi: ABI,
            data: calldata
        })

        return targets.map((x) => ({
            to: x,
            value: 0n,
            data: "0x"
        }))
    } catch (e) {
        return null
    }
}
