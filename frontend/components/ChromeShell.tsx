import IconSprite from "./IconSprite";
import Preloader from "./Preloader";
import CustomCursor from "./CustomCursor";
import AuroraBackground from "./AuroraBackground";
import ToastStack from "./ToastStack";
import CookieBanner from "./CookieBanner";
import TickerBar from "./TickerBar";
import MainNav from "./MainNav";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import BackToTop from "./BackToTop";
import WhatsAppButton from "./WhatsAppButton";
import SupportTicket from "./SupportTicket";
import SiteModals from "./SiteModals";
import GlobalUX from "./GlobalUX";
import Chatbot from "./Chatbot";

export default function ChromeShell({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <IconSprite />
      <Preloader />
      <CustomCursor />
      <AuroraBackground />
      <ToastStack />
      <CookieBanner />

      <TickerBar />
      <MainNav />

      {children}

      <Footer />

      <ScrollProgress />
      <BackToTop />
      <WhatsAppButton />
      <SupportTicket />
      <SiteModals />
      <Chatbot />
      <GlobalUX />
    </>
  );
}
