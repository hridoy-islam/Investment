'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from '@/routes/hooks';
import { AppDispatch, RootState } from '@/redux/store';
import {
  verifyEmail,
  resendOtp,
  updateAuthIsValided,
  logout
} from '@/redux/features/authSlice';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VerifyPage({ user }) {
  const [otp, setOtp] = useState(Array(4).fill(''));
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isCooldownActive, setIsCooldownActive] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef<HTMLInputElement[]>([]);
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const index = inputRefs.current.indexOf(e.currentTarget);
    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete'
    ) {
      e.preventDefault();
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      setOtp((prevOtp) => {
        const updatedOtp = [...prevOtp];
        updatedOtp[index] = '';
        return updatedOtp;
      });
      if (e.key === 'Backspace' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = inputRefs.current.indexOf(e.target);
    const val = e.target.value;
    if (/^[0-9]$/.test(val)) {
      const updated = [...otp];
      updated[index] = val;
      setOtp(updated);
      if (index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.select();

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (!new RegExp(`^[0-9]{${otp.length}}$`).test(pasted)) return;
    setOtp(pasted.split(''));
  };

 const handleOtpSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const otpCode = otp.join('');
  if (!user?.email) return setError('Email missing');

  try {
    const response = await dispatch(verifyEmail({ email: user.email, otp: otpCode }));

    // Check if the response indicates success
    if (response.success) {
      setIsVerified(true);
      dispatch(updateAuthIsValided(true));
    } else {
      setError('Verification failed. Please try again.');
    }
  } catch (err) {
    setError('Verification failed. Please try again.');
  }
};


  const handleResendOtp = async () => {
    try {
      await dispatch(resendOtp({ email: user?.email }));
      setResendCooldown(30);
      setIsCooldownActive(true);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCooldownActive && resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    } else if (resendCooldown === 0) {
      setIsCooldownActive(false);
    }
    return () => clearTimeout(timer);
  }, [isCooldownActive, resendCooldown]);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <Dialog open={!isVerified}>
  <DialogContent
    className="h-screen w-screen max-w-full border-none bg-gray-50 m-0 p-0 sm:rounded-none"
    onInteractOutside={(e) => e.preventDefault()}
    onEscapeKeyDown={(e) => e.preventDefault()}
  >
    {/* Relative container for absolute positioning */}
    <div className="relative flex h-full w-full items-center justify-center px-4">
      
      {/* Logout Button - Positioned at Top Right */}
      <Button
        onClick={handleLogout}
        className="absolute right-4 top-4 flex cursor-pointer items-center space-x-2 rounded-md bg-watney p-2 text-white hover:bg-watney/90"
      >
        <LogOut className="h-4 w-4" />
        <span className="font-semibold">Log out</span>
      </Button>

      {/* Verification Card */}
      <Card className="w-full max-w-2xl border border-gray-200 p-6 shadow-lg">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="text-xl font-medium text-gray-900">
            VERIFY YOUR EMAIL ADDRESS
          </h2>
          <p className="font-medium text-gray-700">
            A verification code has been sent to <br />
            <span className="text-sm font-bold">{user?.email}</span>
          </p>
          <p className="text-sm text-gray-600">
            Please check your inbox and enter the verification code below to
            verify your email address.
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}

          <form
            className="flex justify-center gap-2"
            onSubmit={handleOtpSubmit}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onPaste={handlePaste}
                ref={(el) => (inputRefs.current[index] = el!)}
                className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-white text-center text-xl font-medium shadow-sm outline-none focus:ring-2 focus:ring-primary sm:h-14 sm:w-14 sm:text-2xl"
              />
            ))}
          </form>

          <Button
            disabled={otp.some((digit) => digit === '')}
            onClick={handleOtpSubmit}
            className="mt-4 w-[200px] bg-watney text-white hover:bg-watney/90"
          >
            Verify OTP
          </Button>

          <div className="mt-2 flex items-center justify-center space-x-1 text-sm">
            <span className="text-gray-600">
              Didn&apos;t receive the code?
            </span>
            <button
              onClick={handleResendOtp}
              disabled={isCooldownActive}
              type="button"
              className={`font-medium transition-opacity duration-200 ${isCooldownActive ? 'cursor-not-allowed opacity-70' : 'hover:text-black/90'}`}
            >
              {isCooldownActive ? (
                <span className="flex items-center">
                  <svg
                    className="mr-1 h-3 w-3 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <span className="font-semibold text-gray-600 hover:underline">
                  Resend code
                </span>
              )}
            </button>
          </div>
        </div>
      </Card>
    </div>
  </DialogContent>
</Dialog>
  );
}
