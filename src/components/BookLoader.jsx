export default function BookLoader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="book-loader">
        <div className="book">
          <div className="cover"></div>
          <div className="page"></div>
          <div className="page"></div>
          <div className="page"></div>
          <div className="page"></div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          {message}
        </p>
        <div className="flex space-x-1 mt-2 justify-center">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
