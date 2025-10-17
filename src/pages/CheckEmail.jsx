import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const CheckEmail = () => {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const { resendVerification } = useAuth();

  // Get email from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const email =
    urlParams.get("email") || localStorage.getItem("pendingVerificationEmail");

  const handleResendEmail = async () => {
    if (!email) return;

    setResending(true);
    const result = await resendVerification(email);

    if (result.success) {
      setResent(true);
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-900 mb-4">
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-400">
              We've sent a verification link to your email address
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-white mb-2">
                  Registration Successful!
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  We've sent a verification email to:
                </p>
                <p className="text-sm font-mono text-blue-400 bg-gray-800 px-3 py-2 rounded border border-gray-600">
                  {email || "your email address"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-medium text-white mb-2">
                Next Steps:
              </h4>
              <ol className="text-sm text-gray-400 space-y-1">
                <li className="flex items-center space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Check your email inbox</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>Click the "Verify Email" button</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>You'll be automatically logged in</span>
                </li>
              </ol>
            </div>
          </div>

          <div className="space-y-3">
            {!resent ? (
              <button
                onClick={handleResendEmail}
                disabled={resending || !email}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 ${resending ? "animate-spin" : ""}`}
                />
                <span>
                  {resending ? "Resending..." : "Resend Verification Email"}
                </span>
              </button>
            ) : (
              <div className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-900 border border-green-700 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">
                  Email sent successfully!
                </span>
              </div>
            )}

            <Link
              to="/login"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
