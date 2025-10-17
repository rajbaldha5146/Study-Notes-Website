import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const hasVerified = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link - no token provided');
      return;
    }

    // Prevent multiple verification attempts
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        const result = await verifyEmail(token);
        
        if (result.success) {
          setStatus('success');
          setMessage('Email verified successfully! You are now logged in.');
          
          // Start countdown
          let timeLeft = 5;
          setCountdown(timeLeft);
          
          const countdownInterval = setInterval(() => {
            timeLeft -= 1;
            setCountdown(timeLeft);
            
            if (timeLeft <= 0) {
              clearInterval(countdownInterval);
              navigate('/app', { replace: true });
            }
          }, 1000);
          
          return () => clearInterval(countdownInterval);
        } else {
          setStatus('error');
          setMessage(result.message || 'Email verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verify();
  }, [searchParams, verifyEmail, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Verifying Email
              </h2>
              <p className="text-gray-400">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900 mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-400 mb-6">
                Welcome! Your account has been verified and you're now logged in.
              </p>
              
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 mb-6">
                <div className="flex items-center justify-center space-x-2 text-blue-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Redirecting to your dashboard in {countdown} seconds...
                  </span>
                </div>
              </div>

              <Link
                to="/app"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Go to Dashboard Now
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900 mb-4">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-400 mb-6">
                {message}
              </p>
              
              <div className="space-y-3">
                <Link
                  to="/resend-verification"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Resend Verification Email</span>
                </Link>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;