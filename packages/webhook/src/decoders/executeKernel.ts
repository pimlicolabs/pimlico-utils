import {
    type Address,
    type Hex,
    bytesToHex,
    decodeFunctionData,
    fromHex,
    getAddress,
    hexToBytes,
    slice
} from "viem"
import type { CalldataDecoder } from "./base"

const ABI = [
    {
        name: "execute",
        type: "function",
        inputs: [
            {
                name: "mode",
                type: "bytes32",
                internalType: "bytes32"
            },
            {
                name: "data",
                type: "bytes",
                internalType: "bytes"
            }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const

// Call types from the Kernel contract
const CALLTYPE_SINGLE = "0x00"
const CALLTYPE_BATCH = "0x01"
const CALLTYPE_DELEGATECALL = "0xff"

export const executeKernelDecoder: CalldataDecoder = (calldata: Hex) => {
    try {
        // Attempt to decode the function calldata
        const decoded = decodeFunctionData({
            abi: ABI,
            data: calldata
        })

        const [mode, executionCalldata] = decoded.args

        // Extract call type from the first byte of the mode
        const callType = slice(mode, 0, 1)
        // Extract addresses and calldatas based on the call type
        return decodeByCallType(callType, executionCalldata)
    } catch (e) {
        return null
    }
}

const decodeByCallType = (
    callType: Hex,
    executionCalldata: Hex
): ReturnType<CalldataDecoder> => {
    const calls: ReturnType<CalldataDecoder> = []

    if (callType === CALLTYPE_SINGLE) {
        // Handle single call type
        const [to, value, data] = decodeSingle(executionCalldata)
        calls.push({
            to,
            value,
            data
        })
    } else if (callType === CALLTYPE_BATCH) {
        // Handle batch call type
        const executions = decodeBatch(executionCalldata)
        for (const execution of executions) {
            calls.push({
                ...execution
            })
        }
    } else if (callType === CALLTYPE_DELEGATECALL) {
        // Handle delegate call type
        calls.push({
            ...decodeDelegate(executionCalldata)
        })
    }

    return calls
}

// Decode a single execution calldata (target, value, data)
const decodeSingle = (executionCalldata: Hex): [Address, bigint, Hex] => {
    // Extract the first 20 bytes as the target address
    const targetHex = slice(executionCalldata, 0, 20)
    const target = getAddress(targetHex)

    // Extract the next 32 bytes as the value
    const valueHex = slice(executionCalldata, 20, 52)
    const value = BigInt(valueHex)

    // The rest is the calldata
    const callData = slice(executionCalldata, 52) as Hex

    return [target, value, callData]
}

// Decode batch execution calldata into execution structs
const decodeBatch = (
    executionCalldata: Hex
): { to: Address; value: bigint; data: Hex }[] => {
    // Following LibERC7579's decodeBatch implementation
    const callData = hexToBytes(executionCalldata)
    const result: { to: Address; value: bigint; data: Hex }[] = []

    try {
        // First 32 bytes contain the offset to the array
        const offsetBytes = callData.slice(0, 32)
        const offset = Number(fromHex(bytesToHex(offsetBytes) as Hex, "bigint"))

        // At the offset, we have the length of the array (32 bytes)
        if (callData.length < offset + 32) return result

        const lengthBytes = callData.slice(offset, offset + 32)
        const length = Number(fromHex(bytesToHex(lengthBytes) as Hex, "bigint"))

        // After the length, we have the array of pointers
        const pointersOffset = offset + 32

        // Process each pointer in the array
        for (let i = 0; i < length; i++) {
            if (callData.length < pointersOffset + (i + 1) * 32) break

            // Get the pointer value
            const pointerBytes = callData.slice(
                pointersOffset + i * 32,
                pointersOffset + (i + 1) * 32
            )
            const pointer = Number(
                fromHex(bytesToHex(pointerBytes) as Hex, "bigint")
            )

            // The pointer is relative to the pointers array start
            const execOffset = pointersOffset + pointer

            // At the execution offset, we have:
            // - target address (32 bytes, but only last 20 bytes are used)
            // - value (32 bytes)
            // - calldata offset (32 bytes)
            if (callData.length < execOffset + 96) continue

            // Extract target address
            const targetBytes = callData
                .slice(execOffset, execOffset + 32)
                .slice(-20)
            const targetHex = bytesToHex(targetBytes)
            const to = getAddress(`0x${targetHex.substring(2)}`)

            // Extract value
            const valueBytes = callData.slice(execOffset + 32, execOffset + 64)
            const value = fromHex(bytesToHex(valueBytes) as Hex, "bigint")

            // Extract calldata offset and then the calldata itself
            const callDataOffsetBytes = callData.slice(
                execOffset + 64,
                execOffset + 96
            )
            const callDataOffset = Number(
                fromHex(bytesToHex(callDataOffsetBytes) as Hex, "bigint")
            )

            // The calldata offset is relative to the execution struct start
            const callDataStart = execOffset + callDataOffset

            if (callData.length < callDataStart + 32) continue

            // First 32 bytes at calldata position contain the length of the calldata
            const callDataLengthBytes = callData.slice(
                callDataStart,
                callDataStart + 32
            )
            const callDataLength = Number(
                fromHex(bytesToHex(callDataLengthBytes) as Hex, "bigint")
            )

            if (callData.length < callDataStart + 32 + callDataLength) continue

            // Extract the actual calldata
            const callDataBytes = callData.slice(
                callDataStart + 32,
                callDataStart + 32 + callDataLength
            )
            const data = bytesToHex(callDataBytes) as Hex

            result.push({ to, value, data })
        }
    } catch (error) {
        console.error("Error decoding batch calldata:", error)
    }

    return result
}

// Decode delegate call data
const decodeDelegate = (
    executionCalldata: Hex
): {
    to: Address
    data: Hex
    value: bigint
} => {
    // Extract the first 20 bytes as the delegate address
    const delegateHex = slice(executionCalldata, 0, 20)
    const to = getAddress(delegateHex)

    // The rest is the calldata
    const data = slice(executionCalldata, 20) as Hex

    return {
        to,
        value: 0n,
        data
    }
}
