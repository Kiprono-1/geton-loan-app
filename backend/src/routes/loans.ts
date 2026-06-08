import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { audit } from "../middleware/audit.js";
import * as loans from "../controllers/loans.js";

const router = Router();

router.post("/calculate", validate(loans.calculateSchema), loans.calculate);
router.post("/apply", requireAuth, audit("loan.apply", "Loan"), validate(loans.applyLoanSchema), loans.applyForLoan);
router.get("/", requireAuth, loans.listLoans);
router.get("/:id", requireAuth, loans.getLoan);
router.post("/:id/disburse", requireAuth, audit("loan.disburse", "Loan"), loans.disburseLoan);
router.post("/:id/repay", requireAuth, audit("loan.repay", "Loan"), loans.initiateRepayment);
router.post("/:id/cancel", requireAuth, audit("loan.cancel", "Loan"), loans.cancelLoan);

export default router;
