'use client';

import { useState, FormEvent } from 'react';

interface NewsletterSignupProps {
  variant?: 'footer' | 'hero' | 'inline';
  className?: string;
}

export function NewsletterSignup({ variant = 'footer', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || "You're subscribed!");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  if (variant === 'hero') {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition text-base"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed btn-press whitespace-nowrap"
          >
            {status === 'loading' ? 'Subscribing...' : 'Get Updates'}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`bg-gray-50 rounded-2xl p-6 ${className}`}>
        <h3 className="font-serif text-lg font-bold mb-2">Get Weekly Updates</h3>
        <p className="text-sm text-gray-500 mb-4">
          Be the first to know when bestsellers change.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition text-sm"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 btn-press"
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </form>
        {message && (
          <p className={`mt-2 text-xs ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  // Footer variant (default)
  return (
    <div className={className}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
        Stay Updated
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        Get weekly updates on new #1 bestsellers.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none transition text-sm"
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full px-4 py-2.5 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed btn-press text-sm"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-xs ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
