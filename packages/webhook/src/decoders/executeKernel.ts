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

export const executeKernelDecoder: CalldataDecoder = (
    calldata: Hex
): [Address[], Hex[]] | null => {
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
): [Address[], Hex[]] => {
    // Initialize arrays for addresses and calldatas
    const addresses: Address[] = []
    const calldatas: Hex[] = []

    if (callType === CALLTYPE_SINGLE) {
        // Handle single call type
        const [target, , callData] = decodeSingle(executionCalldata)
        addresses.push(target)
        calldatas.push(callData)
    } else if (callType === CALLTYPE_BATCH) {
        // Handle batch call type
        const executions = decodeBatch(executionCalldata)
        for (const execution of executions) {
            addresses.push(execution.target)
            calldatas.push(execution.callData)
        }
    } else if (callType === CALLTYPE_DELEGATECALL) {
        // Handle delegate call type
        const [delegate, callData] = decodeDelegate(executionCalldata)
        addresses.push(delegate)
        calldatas.push(callData)
    }

    return [addresses, calldatas]
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
): { target: Address; value: bigint; callData: Hex }[] => {
    // Following LibERC7579's decodeBatch implementation
    const data = hexToBytes(executionCalldata)
    const result: { target: Address; value: bigint; callData: Hex }[] = []

    try {
        // First 32 bytes contain the offset to the array
        const offsetBytes = data.slice(0, 32)
        const offset = Number(fromHex(bytesToHex(offsetBytes) as Hex, "bigint"))

        // At the offset, we have the length of the array (32 bytes)
        if (data.length < offset + 32) return result

        const lengthBytes = data.slice(offset, offset + 32)
        const length = Number(fromHex(bytesToHex(lengthBytes) as Hex, "bigint"))

        // After the length, we have the array of pointers
        const pointersOffset = offset + 32

        // Process each pointer in the array
        for (let i = 0; i < length; i++) {
            if (data.length < pointersOffset + (i + 1) * 32) break

            // Get the pointer value
            const pointerBytes = data.slice(
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
            if (data.length < execOffset + 96) continue

            // Extract target address
            const targetBytes = data
                .slice(execOffset, execOffset + 32)
                .slice(-20)
            const targetHex = bytesToHex(targetBytes)
            const target = getAddress(`0x${targetHex.substring(2)}`)

            // Extract value
            const valueBytes = data.slice(execOffset + 32, execOffset + 64)
            const value = fromHex(bytesToHex(valueBytes) as Hex, "bigint")

            // Extract calldata offset and then the calldata itself
            const callDataOffsetBytes = data.slice(
                execOffset + 64,
                execOffset + 96
            )
            const callDataOffset = Number(
                fromHex(bytesToHex(callDataOffsetBytes) as Hex, "bigint")
            )

            // The calldata offset is relative to the execution struct start
            const callDataStart = execOffset + callDataOffset

            if (data.length < callDataStart + 32) continue

            // First 32 bytes at calldata position contain the length of the calldata
            const callDataLengthBytes = data.slice(
                callDataStart,
                callDataStart + 32
            )
            const callDataLength = Number(
                fromHex(bytesToHex(callDataLengthBytes) as Hex, "bigint")
            )

            if (data.length < callDataStart + 32 + callDataLength) continue

            // Extract the actual calldata
            const callDataBytes = data.slice(
                callDataStart + 32,
                callDataStart + 32 + callDataLength
            )
            const callData = bytesToHex(callDataBytes) as Hex

            result.push({ target, value, callData })
        }
    } catch (error) {
        console.error("Error decoding batch calldata:", error)
    }

    return result
}

// Decode delegate call data
const decodeDelegate = (executionCalldata: Hex): [Address, Hex] => {
    // Extract the first 20 bytes as the delegate address
    const delegateHex = slice(executionCalldata, 0, 20)
    const delegate = getAddress(delegateHex)

    // The rest is the calldata
    const callData = slice(executionCalldata, 20) as Hex

    return [delegate, callData]
}
