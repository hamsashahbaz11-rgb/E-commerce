'use client';
import React, { useState } from 'react';

export default function OtpVerification() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('enterEmail');  
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('enterOtp');
        setMessage('OTP sent to your email. Please check your inbox.');
      } else {
        setMessage(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      setMessage('Error sending OTP');
    }
    setLoading(false);
  }

  async function verifyOtp() {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('OTP verified! Access granted.');
        // TODO: Proceed with login or next step
      } else {
        setMessage(data.error || 'Invalid OTP');
      }
    } catch (error) {
      setMessage('Error verifying OTP');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      {step === 'enterEmail' && (
        <>
          <h2 className="text-xl font-semibold mb-4">Enter your email</h2>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            onClick={sendOtp}
            disabled={!email || loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </>
      )}

      {step === 'enterOtp' && (
        <>
          <h2 className="text-xl font-semibold mb-4">Enter OTP</h2>
          <input
            type="text"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            maxLength={6}
          />
          <button
            onClick={verifyOtp}
            disabled={otp.length !== 6 || loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            onClick={() => setStep('enterEmail')}
            className="mt-2 w-full text-center text-blue-600 underline"
          >
            Resend OTP
          </button>
        </>
      )}

      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  );
}