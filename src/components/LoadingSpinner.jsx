/**
 * Reusable loading spinner component
 * Provides consistent loading UI across the application
 */
export default function LoadingSpinner({ size = 'md', message = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center" role="status" aria-live="polite">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-indigo-600 border-t-transparent`}
        aria-label="Loading"
      />
      {message && (
        <p className="mt-3 text-sm text-gray-400">{message}</p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
