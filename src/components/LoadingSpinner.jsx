import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ size = "md", message }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Loader2
        className={`${sizeClasses[size]} text-indigo-500 animate-spin`}
      />
      {message && (
        <p className="mt-3 text-sm text-neutral-500">{message}</p>
      )}
    </div>
  );
}
