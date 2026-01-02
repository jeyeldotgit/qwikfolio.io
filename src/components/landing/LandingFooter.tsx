import { Zap, Github, Twitter } from "lucide-react";

export const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Qwik<span className="text-emerald-600 dark:text-emerald-400">Folio</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {currentYear} QwikFolio. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <button
              type="button"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              onClick={() => console.log("Privacy Policy")}
            >
              Privacy
            </button>
            <button
              type="button"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              onClick={() => console.log("Terms of Service")}
            >
              Terms
            </button>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

