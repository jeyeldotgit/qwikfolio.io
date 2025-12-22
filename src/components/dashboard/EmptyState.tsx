import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  onCreatePortfolio: () => void;
};

export const EmptyState = ({ onCreatePortfolio }: EmptyStateProps) => {
  return (
    <div className="max-w-xl mx-auto text-center py-16 px-4">
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
        You don&apos;t have a portfolio yet.
      </h1>
      <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
        Create a focused, career-ready portfolio in under 5 minutes. We handle
        the layout, you bring the content.
      </p>

      <div className="mt-8">
        <Button
          className="px-6 h-10 text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={onCreatePortfolio}
        >
          Create Your Portfolio
        </Button>
      </div>

      <div className="mt-8 text-left inline-block text-sm text-slate-600 dark:text-slate-300">
        <p className="font-medium mb-2">
          When you create a portfolio, you get:
        </p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Auto-generated public portfolio page</li>
          <li>Printable, recruiter-ready resume</li>
          <li>Shareable link you can drop anywhere</li>
        </ul>
      </div>
    </div>
  );
};
