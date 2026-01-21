import type { Portfolio } from "@/schemas/portfolio";
import { cn } from "@/lib/utils";
import { Award, ExternalLink } from "lucide-react";

type DevPortfolioCertificationsSectionProps = {
  certifications: Portfolio["certifications"];
  radiusClasses: string;
};

export const DevPortfolioCertificationsSection = ({
  certifications,
  radiusClasses,
}: DevPortfolioCertificationsSectionProps) => {
  if (!certifications || certifications.length === 0) return null;

  return (
    <section className="border-b border-slate-200 py-14 dark:border-slate-800/50">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-8 font-mono text-sm tracking-wider text-slate-400 dark:text-slate-500">
          {"// certifications"}
        </h2>
        <p className="-mt-6 mb-8 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Credentials that validate tools, platforms, and best practices.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert) => (
            <div
              key={cert.id ?? `${cert.name}-${cert.issuer}`}
              className={cn(
                "group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/30",
                radiusClasses
              )}
              style={{
                borderColor: "color-mix(in oklab, var(--portfolio-primary) 20%, transparent)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    radiusClasses
                  )}
                  style={{
                    backgroundColor: "rgba(var(--portfolio-primary-rgb), 0.1)",
                  }}
                >
                  <Award
                    className="h-5 w-5 shrink-0"
                    style={{
                      color: "var(--portfolio-primary, #10b981)",
                      stroke: "currentColor",
                      fill: "none",
                    }}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {cert.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {cert.issuer}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
                      Issued: {cert.issueDate}
                    </p>
                    {cert.expiryDate && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">
                          •
                        </span>
                        <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
                          Expires: {cert.expiryDate}
                        </p>
                      </>
                    )}
                  </div>
                  {cert.credentialId && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      ID: {cert.credentialId}
                    </p>
                  )}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                      style={{ color: "var(--portfolio-primary)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      View credential
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


