export enum OrderStatus {
  Pending = "PENDING",
  InEscrow = "IN_ESCROW",
  Released = "RELEASED",
  Refunded = "REFUNDED",
  Disputed = "DISPUTED",
}

export const ORDER_STATUSES = Object.values(OrderStatus);