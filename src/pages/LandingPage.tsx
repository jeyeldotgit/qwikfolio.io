import {
  LandingNav,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  StatsSection,
  CTASection,
  ContactSection,
  LandingFooter,
} from "@/components/landing";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <CTASection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
