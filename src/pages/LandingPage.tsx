import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Code,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-['Roboto']">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        } border-b border-slate-200/50 dark:border-slate-800/50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center">
              <Zap className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                QwikFolio.io
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <a
                href="#features"
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Features
              </a>

              <a
                href="#contact"
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Contact
              </a>
              <ThemeToggle className="mr-2" />
              <Button
                variant="outline"
                className="ml-2 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 h-9"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button
                className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-9"
                onClick={() => navigate("/auth")}
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#features"
                className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                <div className="flex justify-center py-2">
                  <ThemeToggle variant="dropdown" />
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full justify-center bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  onClick={() => navigate("/auth")}
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Add padding to account for fixed header */}
      <div className="pt-16 md:pt-20">
        {/* Hero Section */}
        <div id="home" className="relative overflow-hidden pt-8 md:pt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                Build Your Professional Portfolio
                <span className="text-indigo-600 dark:text-indigo-400">
                  {" "}
                  in Minutes
                </span>
              </h1>
              <p className="mt-6 text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Create a stunning portfolio and resume with zero design skills.
                Just fill out our simple forms and get a professional online
                presence instantly.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
                  onClick={() => navigate("/auth")}
                >
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-6 text-lg"
                  onClick={() => {
                    const featuresSection = document.getElementById("features");
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  See How It Works
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-16 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Everything You Need to Shine
              </h2>
              <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                QwikFolio takes care of the design and layout, so you can focus
                on your content.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Easy Forms
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Fill out simple forms with your information. No coding or
                  design skills required.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Instant Preview
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  See your portfolio come to life in real-time as you fill out
                  the forms.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  One-Click Export
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Download your resume as PDF or share your portfolio with a
                  single click.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div
          id="pricing"
          className="bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900"
        >
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to build your portfolio?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have already created their
              portfolios with QwikFolio.
            </p>
            <Button className="bg-white text-indigo-600 hover:bg-white/90 px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Get In Touch
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Have questions? We're here to help you create your perfect
                portfolio.
              </p>
            </div>
            <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
              <form className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                    placeholder="Your message..."
                  ></textarea>
                </div>
                <div>
                  <Button
                    type="submit"
                    className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    Send Message <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <span className="ml-2 text-xl font-bold text-slate-900 dark:text-white">
                  QwikFolio
                </span>
              </div>
              <p className="mt-4 md:mt-0 text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} QwikFolio. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
