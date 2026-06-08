# How to Integrate the Frontend with the Backend

The frontend at `/` currently uses local in-memory state via `AppContext`.
To make it a real app that talks to the backend, follow this pattern:

## 1. Wrap the app with the AuthProvider

The `api` client handles JWT tokens automatically via `localStorage` and
transparent refresh. You just need to call the API methods.

## 2. Example: Real login flow

Replace the current `login` function in `src/context/AppContext.tsx`:

```tsx
import { api } from "../lib/api";

const login = useCallback(
  async (email: string, name?: string) => {
    try {
      // For demo: use a simple password (in real flow, user enters it)
      const res = await api.auth.login({
        email,
        password: "Demo1234!", // or pull from form
      });
      setUser(res.user);
      setNotifications(res.user.kycStatus === "approved" ? seedNotifications() : []);
      navigate("home");
      showToast("Karibu tena!", "success");
    } catch (err) {
      showToast(err.message || "Login failed", "error");
    }
  },
  [navigate, showToast],
);
```

## 3. Example: Apply for a loan

```tsx
import { api } from "../lib/api";

const proceed = async () => {
  try {
    const res = await api.loans.apply({ amount, tenure, purpose });
    setCurrentLoan(res.loan);
    navigate("loan-offer");
  } catch (err: any) {
    if (err.code === "LOAN_REJECTED") {
      showToast(err.message, "error");
    } else {
      showToast(err.message || "Application failed", "error");
    }
  }
};
```

## 4. Example: Pay activation fee

```tsx
import { api } from "../lib/api";

const handlePay = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setLoading(true);
    navigate("payment-processing");

    // Initiate STK push
    const intent = await api.payments.initiateActivation({
      loanId: currentLoan.id,
      phone: mpesaPhone,
    });

    // Poll for completion (webhook will also fire)
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const status = await api.payments.verify(intent.reference);
      if (status.status === "success") {
        navigate("loan-disbursed");
        return;
      }
      if (status.status === "failed") {
        showToast("Payment failed. Please try again.", "error");
        navigate("fee-required");
        return;
      }
    }
    showToast("Payment is taking longer than expected.", "info");
  } catch (err: any) {
    showToast(err.message, "error");
  } finally {
    setLoading(false);
  }
};
```

## 5. Recommended: Use React Query

For production, install `@tanstack/react-query` for better data fetching:

```bash
npm install @tanstack/react-query
```

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "./lib/api";

function useLoans() {
  return useQuery({
    queryKey: ["loans"],
    queryFn: () => api.loans.list(),
  });
}

function useApplyLoan() {
  return useMutation({
    mutationFn: api.loans.apply,
    onSuccess: (data) => {
      // handle success
    },
  });
}
```

## 6. Configuration

Set the API URL in `.env.local`:

```
VITE_API_URL=http://localhost:3000/api/v1
```

For production, set it to your deployed backend URL.

## 7. CORS

The backend has CORS configured to allow your frontend origin. Make sure
`FRONTEND_URL` in `backend/.env` matches your frontend URL.
