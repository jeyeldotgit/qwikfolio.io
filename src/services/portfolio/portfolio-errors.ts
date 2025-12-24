export class PortfolioServiceError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "PortfolioServiceError";
    this.code = code;
  }
}
