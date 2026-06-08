export type Screen =
  | "splash"
  | "onboarding"
  | "login"
  | "register"
  | "home"
  | "loan-apply"
  | "loan-offer"
  | "fee-required"
  | "payment"
  | "payment-processing"
  | "payment-success"
  | "loan-disbursed"
  | "transactions"
  | "loans"
  | "profile"
  | "notifications"
  | "support"
  | "kyc"
  | "wallet"
  | "personal-info"
  | "payment-methods"
  | "security"
  | "settings"
  | "referral"
  | "withdraw"
  | "deposit"
  | "edit-profile-photo"
  | "change-password"
  | "change-pin"
  | "login-activity"
  | "data-sharing"
  | "languages"
  | "rate-app"
  | "terms"
  | "privacy"
  | "licenses"
  | "about"
  | "kyc-id"
  | "kyc-mpesa"
  | "kyc-kra"
  | "kyc-selfie"
  | "add-bank"
  | "add-card"
  | "add-airtel"
  | "contact";

export interface User {
  fullName: string;
  email: string;
  phone: string;
  nationalId?: string;
  kraPin?: string;
  mpesaNumber?: string;
  bank?: string;
  accountNumber?: string;
  kycLevel: 1 | 2 | 3;
  creditScore: number;
  walletBalance: number;
  joinedAt: string;
}

export interface LoanApplication {
  id?: string;
  amount: number;
  tenure: number; // months
  purpose: string;
  monthlyPayment: number;
  totalRepayment: number;
  interestRate: number;
  activationFee: number;
  processingFee: number;
  insuranceFee: number;
  verificationFee: number;
  totalRequiredFees: number;
  paidFees: PaidFee[];
  status: "pending" | "fees-required" | "approved" | "disbursed" | "active";
  createdAt: string;
}

export interface PaidFee {
  type: "activation" | "processing" | "insurance" | "verification" | "tax";
  amount: number;
  paidAt: string;
  reference: string;
}

export interface Transaction {
  id: string;
  type: "fee" | "disbursement" | "repayment" | "deposit" | "withdrawal";
  description: string;
  amount: number;
  status: "successful" | "pending" | "failed";
  date: string;
  reference: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "alert";
  read: boolean;
  date: string;
}
