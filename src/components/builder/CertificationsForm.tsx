import type { Certification } from "@/schemas/portfolio";
import { FormCard } from "@/components/form/FormCard";
import { FormSection } from "@/components/form/FormSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

type CertificationsFormProps = {
  value: Certification[];
  onChange: (value: Certification[]) => void;
  errors?: Record<number, Record<string, string>>;
  className?: string;
};

export const CertificationsForm = ({
  value,
  onChange,
  errors = {},
  className,
}: CertificationsFormProps) => {
  const handleCertificationChange = (
    index: number,
    updated: Certification
  ) => {
    onChange(value.map((cert, idx) => (idx === index ? updated : cert)));
  };

  const handleRemoveCertification = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  const handleAddCertification = () => {
    onChange([
      ...value,
      {
        id: undefined,
        name: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
      },
    ]);
  };

  return (
    <FormCard
      title="Certifications"
      description="Showcase your professional certifications and credentials."
      className={className}
    >
      <div className="space-y-6">
        {value.map((cert, index) => {
          // Use id if available, otherwise use index for stable key
          // This prevents key changes when user types, which causes input to lose focus
          const stableKey = cert.id ?? `cert-new-${index}`;
          return (
          <FormSection
            key={stableKey}
            title={`Certification ${index + 1}`}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`cert-name-${index}`} required>
                    Certification Name
                  </Label>
                  <Input
                    id={`cert-name-${index}`}
                    placeholder="e.g., AWS Certified Solutions Architect"
                    value={cert.name}
                    onChange={(event) =>
                      handleCertificationChange(index, {
                        ...cert,
                        name: event.target.value,
                      })
                    }
                    className={cn(
                      errors[index]?.name &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors[index]?.name && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors[index].name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`cert-issuer-${index}`} required>
                    Issuer
                  </Label>
                  <Input
                    id={`cert-issuer-${index}`}
                    placeholder="e.g., Amazon Web Services"
                    value={cert.issuer}
                    onChange={(event) =>
                      handleCertificationChange(index, {
                        ...cert,
                        issuer: event.target.value,
                      })
                    }
                    className={cn(
                      errors[index]?.issuer &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors[index]?.issuer && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors[index].issuer}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`cert-issue-date-${index}`} required>
                    Issue Date
                  </Label>
                  <Input
                    id={`cert-issue-date-${index}`}
                    placeholder="2023-06"
                    value={cert.issueDate}
                    onChange={(event) =>
                      handleCertificationChange(index, {
                        ...cert,
                        issueDate: event.target.value,
                      })
                    }
                    className={cn(
                      errors[index]?.issueDate &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors[index]?.issueDate && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors[index].issueDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`cert-expiry-date-${index}`}>
                    Expiry Date (optional)
                  </Label>
                  <Input
                    id={`cert-expiry-date-${index}`}
                    placeholder="2026-06"
                    value={cert.expiryDate ?? ""}
                    onChange={(event) =>
                      handleCertificationChange(index, {
                        ...cert,
                        expiryDate: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`cert-credential-id-${index}`}>
                    Credential ID (optional)
                  </Label>
                  <Input
                    id={`cert-credential-id-${index}`}
                    placeholder="e.g., ABC123XYZ"
                    value={cert.credentialId ?? ""}
                    onChange={(event) =>
                      handleCertificationChange(index, {
                        ...cert,
                        credentialId: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`cert-credential-url-${index}`}>
                    Credential URL (optional)
                  </Label>
                  <Input
                    id={`cert-credential-url-${index}`}
                    type="url"
                    placeholder="https://..."
                    value={cert.credentialUrl ?? ""}
                    onChange={(event) =>
                      handleCertificationChange(index, {
                        ...cert,
                        credentialUrl: event.target.value,
                      })
                    }
                    className={cn(
                      errors[index]?.credentialUrl &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors[index]?.credentialUrl && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors[index].credentialUrl}
                    </p>
                  )}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View credential
                    </a>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50/60 dark:hover:bg-red-950/40"
                  onClick={() => handleRemoveCertification(index)}
                >
                  Remove certification
                </Button>
              </div>
            </div>
          </FormSection>
          );
        })}

        <div className="flex justify-start">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddCertification}
          >
            Add another certification
          </Button>
        </div>
      </div>
    </FormCard>
  );
};

