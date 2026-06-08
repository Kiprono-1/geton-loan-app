// Common types used across the backend

export type UserRole = "user" | "admin" | "compliance" | "support";

export type KycStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "rejected"
  | "expired";

export type KycLevel = 1 | 2 | 3;

export type LoanStatus =
  | "pending"
  | "fees-required"
  | "approved"
  | "active"
  | "repaid"
  | "defaulted"
  | "rejected"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed"
  | "abandoned"
  | "refunded";

export type TransactionType =
  | "fee"
  | "disbursement"
  | "repayment"
  | "deposit"
  | "withdrawal"
  | "refund"
  | "penalty";

export type TransactionStatus =
  | "pending"
  | "successful"
  | "failed";

export type PaymentChannel =
  | "mpesa-stk"
  | "mpesa-paybill"
  | "mpesa-c2b"
  | "bank-transfer"
  | "card"
  | "manual";

export type NotificationType = "info" | "success" | "warning" | "alert";

export type NotificationCategory =
  | "loan"
  | "payment"
  | "kyc"
  | "system"
  | "promo";

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  kycLevel: KycLevel;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
      device?: string;
      ip?: string;
    }
  }
}

export {};
