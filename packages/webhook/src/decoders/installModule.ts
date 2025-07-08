import { type Address, type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const ABI = [
    {
        name: "installModule",
        type: "function",
        inputs: [
            {
                name: "moduleTypeId",
                type: "uint256",
                internalType: "uint256"
            },
            {
                name: "module",
                type: "address",
                internalType: "address"
            },
            {
                name: "initData",
                type: "bytes",
                internalType: "bytes"
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const

export const installModuleDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [, module, initData]
        } = decodeFunctionData({
            abi: ABI,
            data: calldata
        })

        return [
            {
                to: module,
                value: 0n,
                data: initData
            }
        ]
    } catch (e) {
        return null
    }
}
