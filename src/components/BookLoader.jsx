import { Loader2 } from "lucide-react";

export default function BookLoader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}
