import mockData from "../../mockdata.json";
import { portfolioSchema, type Portfolio } from "@/schemas/portfolio";

type UsePortfolioPreviewResult = {
  isLoading: boolean;
  portfolio: Portfolio | null;
};

export const usePortfolioPreview = (): UsePortfolioPreviewResult => {
  const parsed = portfolioSchema.safeParse(mockData);

  if (!parsed.success) {
    console.warn(
      "mockdata.json does not match portfolio schema for preview",
      parsed.error
    );
    return {
      isLoading: false,
      portfolio: null,
    };
  }

  return {
    isLoading: false,
    portfolio: parsed.data,
  };
};
