import type { Address, Hex } from "viem"

export type CalldataDecoder = (calldata: Hex) =>
    | {
          to: Hex
          data: Hex
          value: bigint
      }[]
    | null
