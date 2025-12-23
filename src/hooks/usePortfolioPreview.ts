import { useState, useEffect } from "react";
import { useAuthSession } from "./useAuthSession";
import { getPortfolio } from "@/services/portfolio/portfolioService";
import type { Portfolio } from "@/schemas/portfolio";

type PortfolioPreviewState = "idle" | "loading" | "success" | "error";

type UsePortfolioPreviewResult = {
  state: PortfolioPreviewState;
  isLoading: boolean;
  portfolio: Portfolio | null;
  error: string | null;
};

export const usePortfolioPreview = (): UsePortfolioPreviewResult => {
  const { user } = useAuthSession();
  const [state, setState] = useState<PortfolioPreviewState>("idle");
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setState("idle");
      setPortfolio(null);
      setError(null);
      return;
    }

    const loadPortfolio = async () => {
      setState("loading");
      setError(null);

      try {
        const fetchedPortfolio = await getPortfolio(user.id);

        if (fetchedPortfolio) {
          setPortfolio(fetchedPortfolio);
          setState("success");
        } else {
          setPortfolio(null);
          setError("No portfolio found");
          setState("error");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load portfolio";
        setError(errorMessage);
        setState("error");
        setPortfolio(null);
      }
    };

    loadPortfolio();
  }, [user]);

  return {
    state,
    isLoading: state === "loading",
    portfolio,
    error,
  };
};
