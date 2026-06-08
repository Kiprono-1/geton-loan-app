import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { audit } from "../middleware/audit.js";
import * as wallet from "../controllers/wallet.js";

const router = Router();

router.get("/", requireAuth, wallet.getWallet);
router.post(
  "/deposit",
  requireAuth,
  audit("wallet.deposit", "Transaction"),
  validate(wallet.depositSchema),
  wallet.deposit,
);
router.post(
  "/withdraw",
  requireAuth,
  audit("wallet.withdraw", "Transaction"),
  validate(wallet.withdrawSchema),
  wallet.withdraw,
);

export default router;
