import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useScrolled } from "@/hooks/useScrolled";

type NavLink = {
  label: string;
  href: string;
};

const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export const LandingNav = () => {
  const navigate = useNavigate();
  const scrolled = useScrolled();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm"
          : "bg-transparent"
      } border-b border-slate-200/50 dark:border-slate-800/50`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <Zap className="relative h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Qwik<span className="text-emerald-600 dark:text-emerald-400">Folio</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {link.label}
              </button>
            ))}

            <div className="ml-2 flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-700 dark:text-slate-300"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => navigate("/auth")}
              >
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <div className="px-4 py-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                className="w-full border-slate-300 dark:border-slate-700"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => navigate("/auth")}
              >
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

