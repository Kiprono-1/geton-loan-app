import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as transactions from "../controllers/transactions.js";

const router = Router();

router.get("/", requireAuth, transactions.listTransactions);
router.get("/:id", requireAuth, transactions.getTransaction);

export default router;
