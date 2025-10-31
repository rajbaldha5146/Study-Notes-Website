export default function BookLoader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      {/* Book Loader Animation */}
      <div className="book-loader relative">
        {/* Floating gradient orbs for ambiance */}
        <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        <div className="book">
          <div className="cover"></div>
          <div className="page"></div>
          <div className="page"></div>
          <div className="page"></div>
          <div className="page"></div>
          <div className="page"></div>
          <div className="page"></div>
        </div>

        {/* Shadow beneath book */}
        <div className="book-shadow"></div>
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-3">
        <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold tracking-wide">
          {message}
        </p>
        
        {/* Animated dots */}
        <div className="flex space-x-2 justify-center items-center">
          <div className="loading-dot bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="loading-dot bg-gradient-to-r from-purple-500 to-purple-600" style={{ animationDelay: "0.15s" }}></div>
          <div className="loading-dot bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ animationDelay: "0.3s" }}></div>
        </div>

        {/* Progress bar (optional) */}
        <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full animate-loading-bar"></div>
        </div>
      </div>

      {/* Decorative sparkles */}
      <div className="sparkles">
        <div className="sparkle" style={{ top: '10%', left: '20%', animationDelay: '0s' }}>✨</div>
        <div className="sparkle" style={{ top: '80%', left: '80%', animationDelay: '0.5s' }}>✨</div>
        <div className="sparkle" style={{ top: '50%', left: '90%', animationDelay: '1s' }}>✨</div>
        <div className="sparkle" style={{ top: '30%', left: '10%', animationDelay: '1.5s' }}>✨</div>
      </div>
    </div>
  );
}