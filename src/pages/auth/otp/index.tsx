import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// import { resendOtp, validateRequestOtp } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useRouter } from '@/routes/hooks';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import theme from '@/assets/imges/home/theme.jpg';
import logo from '@/assets/imges/home/logo.png';

import { Link } from 'react-router-dom';
import { resendOtp, validateRequestOtp } from '@/redux/features/authSlice';

export default function Otp() {
  const [otp, setOtp] = useState(Array(4).fill(''));
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isCooldownActive, setIsCooldownActive] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const inputRefs = useRef([]);
  const router = useRouter();
  const email = localStorage.getItem('tp_otp_email');

  const handleKeyDown = (e) => {
    const index = inputRefs.current.indexOf(e.target);

    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'Tab' &&
      !e.metaKey
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
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleInput = (e) => {
    const { target } = e;
    const index = inputRefs.current.indexOf(target);
    if (target.value) {
      setOtp((prevOtp) => [
        ...prevOtp.slice(0, index),
        target.value,
        ...prevOtp.slice(index + 1)
      ]);
      if (index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (!new RegExp(`^[0-9]{${otp.length}}$`).test(text)) {
      return;
    }
    const digits = text.split('');
    setOtp(digits);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (!email) router.push('/forgot-password');
    const result: any = await dispatch(
      validateRequestOtp({ email, otp: otpCode })
    );
    if (result?.payload?.success) {
      console.log(result?.payload?.data);
      const decoded = jwtDecode(result?.payload?.data?.resetToken);
      localStorage.setItem(
        'tp_user_data',
        JSON.stringify({ ...decoded, token: result?.payload?.data?.resetToken })
      );
      router.push('/new-password');
    } else {
      setError('Invalid OTP');
    }
  };

  const handleResendOtp = async () => {
    try {
      console.log('Resending OTP to', email);
      // TODO: Replace this with your actual resend OTP logic
      await dispatch(resendOtp({ email }));
      setResendCooldown(30);
      setIsCooldownActive(true);
    } catch (err) {
      console.error(err);
      setError('Failed to resend OTP. Please try again.');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCooldownActive && resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else if (resendCooldown === 0) {
      setIsCooldownActive(false);
    }
    return () => clearTimeout(timer);
  }, [isCooldownActive, resendCooldown]);

  return (
    <div
      className="relative grid h-screen w-full lg:px-0"
      style={{
        backgroundImage: "url('/login.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Blur Overlay */}
      <div className="absolute inset-0 z-0 bg-black/10 backdrop-blur-none" />

      {/* OTP Form Panel - Left Aligned */}
      <div className="relative z-10 flex h-full w-full items-center justify-start p-4 lg:p-8">
        <div className="w-full max-w-lg space-y-6">
          <Card className="flex w-full flex-col justify-center space-y-4 rounded-xl border border-gray-200 bg-white p-6 backdrop-blur-md">
            <div className="flex flex-col space-y-6 text-left">
              <div className="flex flex-row items-center gap-4 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Verification Code
                </h1>
              </div>

              <p className="text-sm text-muted-foreground">
                Enter the verification code sent to your email.
              </p>
              {error && <p className="text-sm text-red-500">{error}</p>}

              <form
                id="otp-form"
                className="mt-4 flex justify-between gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleOtpSubmit(e);
                }}
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
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-400 bg-white text-center text-xl font-medium shadow-sm outline-none focus:ring-2 focus:ring-primary sm:h-16 sm:w-16 sm:text-3xl"
                  />
                ))}
              </form>

              <Button
                disabled={otp.some((digit) => digit === '')}
                onClick={handleOtpSubmit}
                className="mt-5 w-full bg-theme text-white hover:bg-theme/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Verify OTP
              </Button>

              <div className="mt-4 flex items-center justify-center space-x-1 text-sm">
                <span className="text-muted-foreground">
                  Didn't receive the code?
                </span>
                <button
                  className={`font-medium text-black ${isCooldownActive ? 'cursor-not-allowed opacity-70' : 'hover:text-black/90'}`}
                  onClick={handleResendOtp}
                  disabled={isCooldownActive}
                  type="button"
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
                    <span className="text-muted-foreground">Resend code</span>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
  
}
