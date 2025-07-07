import type { Address, Hex } from "viem"

export type CalldataDecoder = (calldata: Hex) => [Address[], Hex[]] | null
