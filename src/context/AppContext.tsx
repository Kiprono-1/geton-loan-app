import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  LoanApplication,
  NotificationItem,
  Screen,
  Transaction,
  User,
} from "../types";
import { genRef } from "../utils/format";
import { api } from "../lib/api";

interface AppState {
  screen: Screen;
  history: Screen[];
  user: User | null;
  currentLoan: LoanApplication | null;
  activeLoan: LoanApplication | null;
  transactions: Transaction[];
  notifications: NotificationItem[];
  isAuthed: boolean;
  toast: { message: string; type: "success" | "error" | "info" } | null;
}

interface AppContextValue extends AppState {
  navigate: (s: Screen) => void;
  back: () => void;
  login: (email: string, name?: string, userData?: any) => void;
  logout: () => void;
  register: (name: string, email: string, phone: string, userData?: any) => void;
  setCurrentLoan: (l: LoanApplication | null) => void;
  addPaidFee: (
    type: "activation" | "processing" | "insurance" | "verification" | "tax",
    amount: number,
  ) => void;
  payActivationFee: () => void;
  disburseLoan: () => void;
  updateUser: (patch: Partial<User>) => void;
  addNotification: (n: Omit<NotificationItem, "id" | "date" | "read">) => void;
  markAllNotificationsRead: () => void;
  addTransaction: (t: Omit<Transaction, "id" | "reference" | "date">) => Transaction;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const seedNotifications = (): NotificationItem[] => [
  {
    id: "n1",
    title: "Karibu GETON 🎉",
      message:
      "Your account has been created successfully. You can now request loans up to KSh 250,000.",
    type: "success",
    read: false,
    date: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "n2",
    title: "Limited time offer",
    message: "Reduced processing fee for first-time borrowers. Apply now!",
    type: "info",
    read: false,
    date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "n3",
    title: "Verify your National ID",
    message: "Verify your KRA PIN to maintain your premium loan tier.",
    type: "warning",
    read: false,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  // Start on home if previously logged in (in-memory only), otherwise splash
  const [screen, setScreen] = useState<Screen>("splash");
  const [history, setHistory] = useState<Screen[]>(["splash"]);
  const [user, setUser] = useState<User | null>(null);
  const [currentLoan, setCurrentLoan] = useState<LoanApplication | null>(null);
  const [activeLoan, setActiveLoan] = useState<LoanApplication | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toast, setToast] = useState<AppState["toast"]>(null);

  const navigate = useCallback((s: Screen) => {
    setHistory((h) => [...h, s]);
    setScreen(s);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, []);

  const back = useCallback(() => {
    setHistory((h) => {
      const next = [...h];
      next.pop();
      const prev = next[next.length - 1] ?? "home";
      setScreen(prev);
      return next;
    });
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  const login = useCallback(
    (email: string, name = "Alex Kamau", userData?: any) => {
      setUser({
        fullName: userData?.fullName ?? name,
        email: userData?.email ?? email,
        phone: userData?.phone ?? "+254 712 345 678",
        kycLevel: userData?.kycLevel ?? 1,
        creditScore: userData?.creditScore ?? 0,
        walletBalance: userData?.walletBalance ?? 0,
        joinedAt: userData?.createdAt ?? new Date().toISOString(),
      });
      setNotifications(seedNotifications());
      navigate("home");
      showToast("Karibu tena!", "success");
    },
    [navigate, showToast],
  );

  const register = useCallback(
    (name: string, email: string, phone: string, userData?: any) => {
      setUser({
        fullName: userData?.fullName ?? name,
        email: userData?.email ?? email,
        phone: userData?.phone ?? phone,
        kycLevel: userData?.kycLevel ?? 1,
        creditScore: userData?.creditScore ?? 0,
        walletBalance: userData?.walletBalance ?? 0,
        joinedAt: userData?.createdAt ?? new Date().toISOString(),
      });
      setNotifications(seedNotifications());
      navigate("home");
      showToast("Account created successfully!", "success");
    },
    [navigate, showToast],
  );

  const logout = useCallback(() => {
    api.auth.logout().catch(() => {}); // revoke refresh token on server
    setUser(null);
    setCurrentLoan(null);
    setActiveLoan(null);
    setTransactions([]);
    setNotifications([]);
    setHistory([]);
    setScreen("login");
  }, []);

  const addTransaction = useCallback(
    (t: Omit<Transaction, "id" | "reference" | "date">) => {
      const tx: Transaction = {
        ...t,
        id: genRef("TX"),
        reference: genRef(),
        date: new Date().toISOString(),
      };
      setTransactions((prev) => [tx, ...prev]);
      return tx;
    },
    [],
  );

  const addNotification = useCallback(
    (n: Omit<NotificationItem, "id" | "date" | "read">) => {
      setNotifications((prev) => [
        {
          ...n,
          id: genRef("NT"),
          date: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
    },
    [],
  );

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addPaidFee = useCallback(
    (
      type: "activation" | "processing" | "insurance" | "verification" | "tax",
      amount: number,
    ) => {
      setCurrentLoan((loan) => {
        if (!loan) return loan;
        return {
          ...loan,
          paidFees: [
            ...loan.paidFees,
            {
              type,
              amount,
              paidAt: new Date().toISOString(),
              reference: genRef("FEE"),
            },
          ],
        };
      });
    },
    [],
  );

  // Mark the single activation fee as paid (covers all sub-fees at once)
  const payActivationFee = useCallback(() => {
    setCurrentLoan((loan) => {
      if (!loan) return loan;
      return {
        ...loan,
        paidFees: [
          {
            type: "activation",
            amount: loan.activationFee,
            paidAt: new Date().toISOString(),
            reference: genRef("ACT"),
          },
        ],
        status: "approved",
      };
    });
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((u) => (u ? { ...u, ...patch } : u));
  }, []);

  const disburseLoan = useCallback(() => {
    setCurrentLoan((loan) => {
      if (!loan) return loan;
      const disbursed: LoanApplication = {
        ...loan,
        status: "active",
      };
      setActiveLoan(disbursed);
      setUser((u) =>
        u ? { ...u, walletBalance: u.walletBalance + loan.amount } : u,
      );
      return disbursed;
    });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      screen,
      history,
      user,
      currentLoan,
      activeLoan,
      transactions,
      notifications,
      isAuthed: !!user,
      toast,
      navigate,
      back,
      login,
      logout,
      register,
      setCurrentLoan,
      addPaidFee,
      payActivationFee,
      disburseLoan,
      updateUser,
      addNotification,
      markAllNotificationsRead,
      addTransaction,
      showToast,
    }),
    [
      screen,
      history,
      user,
      currentLoan,
      activeLoan,
      transactions,
      notifications,
      toast,
      navigate,
      back,
      login,
      logout,
      register,
      addPaidFee,
      payActivationFee,
      disburseLoan,
      updateUser,
      addNotification,
      markAllNotificationsRead,
      addTransaction,
      showToast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
