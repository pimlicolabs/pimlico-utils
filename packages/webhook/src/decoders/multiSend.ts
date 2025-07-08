import { type Address, type Hex, decodeFunctionData } from "viem"
import type { CalldataDecoder } from "./base"

const ABI = [
    {
        name: "multiSend",
        type: "function",
        inputs: [
            {
                name: "transactions",
                type: "bytes",
                internalType: "bytes"
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const

// MultiSend function signature: 0x8d80ff0a
export const multiSendDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        const {
            args: [transactions]
        } = decodeFunctionData({
            abi: ABI,
            data: calldata
        })

        const calls: { to: Address; value: bigint; data: Hex }[] = []

        // Remove 0x prefix for easier processing
        const txData = transactions.slice(2)

        // Process each transaction in the batch
        let i = 0
        while (i < txData.length) {
            // 1 byte for operation
            // const operation = parseInt(txData.slice(i, i + 2), 16);
            i += 2

            // 20 bytes for address
            const to = `0x${txData.slice(i, i + 40)}` as Address
            i += 40

            // 32 bytes for value
            // We don't need the value for our purposes
            const value = BigInt(Number.parseInt(txData.slice(i, i + 64), 16))
            i += 64

            // 32 bytes for data length
            const dataLength = Number.parseInt(txData.slice(i, i + 64), 16) * 2 // Convert bytes to hex chars (1 byte = 2 hex chars)
            i += 64

            // Read the data
            const data = `0x${txData.slice(i, i + dataLength)}` as Hex
            i += dataLength

            calls.push({
                to,
                value,
                data
            })
        }

        return calls
    } catch (e) {
        return null
    }
}
