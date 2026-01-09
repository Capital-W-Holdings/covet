'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface SocialLoginButtonsProps {
  mode: 'login' | 'register';
  onSuccess?: (provider: string, token: string) => void;
  onError?: (provider: string, error: string) => void;
  disabled?: boolean;
  className?: string;
}

type SocialProvider = 'google' | 'apple';

// =============================================================================
// Provider Configurations
// =============================================================================

const providers: Record<SocialProvider, {
  name: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  hoverBg: string;
}> = {
  google: {
    name: 'Google',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    bgColor: 'bg-white',
    textColor: 'text-gray-700',
    hoverBg: 'hover:bg-gray-50',
  },
  apple: {
    name: 'Apple',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    ),
    bgColor: 'bg-black',
    textColor: 'text-white',
    hoverBg: 'hover:bg-gray-900',
  },
};

// =============================================================================
// Component
// =============================================================================

export function SocialLoginButtons({
  mode,
  onSuccess,
  onError,
  disabled = false,
  className,
}: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

  const handleSocialLogin = async (provider: SocialProvider) => {
    if (disabled || loadingProvider) return;
    
    setLoadingProvider(provider);

    try {
      // In production, this would:
      // 1. For Google: Use Google Identity Services or redirect to OAuth
      // 2. For Apple: Use Apple Sign In JS SDK
      
      // Mock implementation - simulate OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Simulate API call to our backend
      const response = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          // In production, this would be the OAuth token from the provider
          mockToken: `mock_${provider}_token_${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.(provider, data.token);
      } else {
        onError?.(provider, data.error?.message || 'Authentication failed');
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      onError?.(provider, 'Authentication failed. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const actionText = mode === 'login' ? 'Sign in' : 'Sign up';

  return (
    <div className={cn('space-y-3', className)}>
      {(Object.keys(providers) as SocialProvider[]).map((provider) => {
        const config = providers[provider];
        const isLoading = loadingProvider === provider;

        return (
          <button
            key={provider}
            type="button"
            onClick={() => handleSocialLogin(provider)}
            disabled={disabled || !!loadingProvider}
            className={cn(
              'w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg font-medium transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              config.bgColor,
              config.textColor,
              config.hoverBg,
              provider === 'google' ? 'border-gray-300' : 'border-transparent'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              config.icon
            )}
            <span>
              {isLoading ? 'Connecting...' : `${actionText} with ${config.name}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// Divider Component
// =============================================================================

interface AuthDividerProps {
  text?: string;
  className?: string;
}

export function AuthDivider({ text = 'or continue with email', className }: AuthDividerProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-gray-500">{text}</span>
      </div>
    </div>
  );
}
