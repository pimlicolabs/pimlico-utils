import type { Address, Hex } from "viem"

export type CalldataDecoder = (calldata: Hex) =>
    | {
          to: Address
          data: Hex
          value: bigint
      }[]
    | null
