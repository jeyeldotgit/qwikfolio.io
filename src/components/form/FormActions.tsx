import { Button } from "@/components/ui/button";

type FormActionsProps = {
  isSubmitting?: boolean;
  primaryLabel?: string;
};

export const FormActions = ({
  isSubmitting = false,
  primaryLabel = "Save section",
}: FormActionsProps) => {
  return (
    <div className="flex items-center justify-end pt-2">
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : primaryLabel}
      </Button>
    </div>
  );
};
