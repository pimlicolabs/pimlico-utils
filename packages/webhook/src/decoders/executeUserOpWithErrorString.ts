// function executeUserOpWithErrorString(address to, uint256 value, bytes memory data, uint8 operation) external onlySupportedEntryPoint {

import { type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const ABI = [
    {
        name: "executeUserOpWithErrorString",
        type: "function",
        inputs: [
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
            },
            {
                name: "operation",
                type: "uint8",
                internalType: "uint8"
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const

export const executeUserOpWithErrorStringDecoder: CalldataDecoder = (
    calldata: Hex
) => {
    try {
        const {
            args: [to, value, data]
        } = decodeFunctionData({
            abi: ABI,
            data: calldata
        })

        return [{ to, value, data }]
    } catch (e) {
        return null
    }
}
