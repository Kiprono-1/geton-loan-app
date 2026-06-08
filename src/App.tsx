import { AppProvider, useApp } from "./context/AppContext";
import { SplashScreen } from "./screens/SplashScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LoanApplyScreen } from "./screens/LoanApplyScreen";
import { LoanOfferScreen } from "./screens/LoanOfferScreen";
import { FeeRequiredScreen } from "./screens/FeeRequiredScreen";
import { PaymentScreen } from "./screens/PaymentScreen";
import { PaymentProcessingScreen } from "./screens/PaymentProcessingScreen";
import { PaymentSuccessScreen } from "./screens/PaymentSuccessScreen";
import { LoanDisbursedScreen } from "./screens/LoanDisbursedScreen";
import { LoansScreen } from "./screens/LoansScreen";
import { TransactionsScreen } from "./screens/TransactionsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { KycScreen } from "./screens/KycScreen";
import { SupportScreen } from "./screens/SupportScreen";
import { WalletScreen } from "./screens/WalletScreen";
import { PersonalInfoScreen } from "./screens/PersonalInfoScreen";
import { PaymentMethodsScreen } from "./screens/PaymentMethodsScreen";
import { SecurityScreen } from "./screens/SecurityScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ReferralScreen } from "./screens/ReferralScreen";
import { WithdrawScreen } from "./screens/WithdrawScreen";
import { DepositScreen } from "./screens/DepositScreen";
import { ContactScreen } from "./screens/ContactScreen";
import { ChangePasswordScreen } from "./screens/ChangePasswordScreen";
import { ChangePinScreen } from "./screens/ChangePinScreen";
import { LoginActivityScreen } from "./screens/LoginActivityScreen";
import { AboutScreen } from "./screens/AboutScreen";
import { TermsScreen } from "./screens/TermsScreen";
import { PrivacyScreen } from "./screens/PrivacyScreen";
import { LicensesScreen } from "./screens/LicensesScreen";
import { EditProfilePhotoScreen } from "./screens/EditProfilePhotoScreen";
import { AddBankScreen } from "./screens/AddBankScreen";
import { AddCardScreen } from "./screens/AddCardScreen";
import { AddAirtelScreen } from "./screens/AddAirtelScreen";
import { RateAppScreen } from "./screens/RateAppScreen";
import { LanguagesScreen } from "./screens/LanguagesScreen";
import { DataSharingScreen } from "./screens/DataSharingScreen";
import { KycIdScreen } from "./screens/KycIdScreen";
import { KycMpesaScreen } from "./screens/KycMpesaScreen";
import { KycKraScreen } from "./screens/KycKraScreen";
import { KycSelfieScreen } from "./screens/KycSelfieScreen";
import { Toast } from "./components/Toast";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";

function Router() {
  const { screen } = useApp();

  let view: React.ReactNode;
  switch (screen) {
    case "splash":
      view = <SplashScreen />;
      break;
    case "onboarding":
      view = <OnboardingScreen />;
      break;
    case "login":
      view = <LoginScreen />;
      break;
    case "register":
      view = <RegisterScreen />;
      break;
    case "home":
      view = <HomeScreen />;
      break;
    case "loan-apply":
      view = <LoanApplyScreen />;
      break;
    case "loan-offer":
      view = <LoanOfferScreen />;
      break;
    case "fee-required":
      view = <FeeRequiredScreen />;
      break;
    case "payment":
      view = <PaymentScreen />;
      break;
    case "payment-processing":
      view = <PaymentProcessingScreen />;
      break;
    case "payment-success":
      view = <PaymentSuccessScreen />;
      break;
    case "loan-disbursed":
      view = <LoanDisbursedScreen />;
      break;
    case "loans":
      view = <LoansScreen />;
      break;
    case "transactions":
      view = <TransactionsScreen />;
      break;
    case "profile":
      view = <ProfileScreen />;
      break;
    case "notifications":
      view = <NotificationsScreen />;
      break;
    case "kyc":
      view = <KycScreen />;
      break;
    case "support":
      view = <SupportScreen />;
      break;
    case "wallet":
      view = <WalletScreen />;
      break;
    case "personal-info":
      view = <PersonalInfoScreen />;
      break;
    case "payment-methods":
      view = <PaymentMethodsScreen />;
      break;
    case "security":
      view = <SecurityScreen />;
      break;
    case "settings":
      view = <SettingsScreen />;
      break;
    case "referral":
      view = <ReferralScreen />;
      break;
    case "withdraw":
      view = <WithdrawScreen />;
      break;
    case "deposit":
      view = <DepositScreen />;
      break;
    case "contact":
      view = <ContactScreen />;
      break;
    case "change-password":
      view = <ChangePasswordScreen />;
      break;
    case "change-pin":
      view = <ChangePinScreen />;
      break;
    case "login-activity":
      view = <LoginActivityScreen />;
      break;
    case "about":
      view = <AboutScreen />;
      break;
    case "terms":
      view = <TermsScreen />;
      break;
    case "privacy":
      view = <PrivacyScreen />;
      break;
    case "licenses":
      view = <LicensesScreen />;
      break;
    case "edit-profile-photo":
      view = <EditProfilePhotoScreen />;
      break;
    case "add-bank":
      view = <AddBankScreen />;
      break;
    case "add-card":
      view = <AddCardScreen />;
      break;
    case "add-airtel":
      view = <AddAirtelScreen />;
      break;
    case "rate-app":
      view = <RateAppScreen />;
      break;
    case "languages":
      view = <LanguagesScreen />;
      break;
    case "data-sharing":
      view = <DataSharingScreen />;
      break;
    case "kyc-id":
      view = <KycIdScreen />;
      break;
    case "kyc-mpesa":
      view = <KycMpesaScreen />;
      break;
    case "kyc-kra":
      view = <KycKraScreen />;
      break;
    case "kyc-selfie":
      view = <KycSelfieScreen />;
      break;
    default:
      view = <SplashScreen />;
  }

  // Some screens (auth flow, splash) take over the full viewport
  // without showing the site chrome. Once the user is in the app,
  // we show the standard website header/footer.
  const isChromeVisible =
    screen !== "splash" &&
    screen !== "onboarding" &&
    screen !== "login" &&
    screen !== "register";

  return (
    <div key={screen} className="flex min-h-screen flex-col animate-fade-in">
      {isChromeVisible && <SiteHeader />}
      <main className="flex-1">{view}</main>
      {isChromeVisible && <SiteFooter />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
      <Toast />
    </AppProvider>
  );
}
