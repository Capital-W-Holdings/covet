'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, X, Copy, Check, MessageCircle, Mail, Facebook, Twitter, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
  variant?: 'icon' | 'button';
}

interface ShareOption {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  color: string;
}

export function ShareButton({ 
  url, 
  title, 
  description = '', 
  image,
  className,
  variant = 'icon'
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Use Web Share API if available (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        // User cancelled or error - fall back to menu
        if ((err as Error).name !== 'AbortError') {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOptions: ShareOption[] = [
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      action: copyToClipboard,
      color: copied ? 'text-green-600' : 'text-gray-600',
    },
    {
      name: 'iMessage',
      icon: MessageCircle,
      action: () => {
        window.open(`sms:&body=${encodeURIComponent(`${title} - ${url}`)}`);
      },
      color: 'text-green-500',
    },
    {
      name: 'WhatsApp',
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`);
      },
      color: 'text-green-600',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
      },
      color: 'text-blue-600',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
      },
      color: 'text-sky-500',
    },
    {
      name: 'Pinterest',
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
        </svg>
      ),
      action: () => {
        const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}${image ? `&media=${encodeURIComponent(image)}` : ''}`;
        window.open(pinterestUrl);
      },
      color: 'text-red-600',
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => {
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this item on Covet: ${url}`)}`);
      },
      color: 'text-gray-600',
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleNativeShare}
        className={cn(
          'transition-colors',
          variant === 'icon' 
            ? 'p-3 bg-white/90 rounded-full hover:bg-white text-gray-600 hover:text-brand-charcoal'
            : 'inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700',
          className
        )}
        aria-label="Share"
      >
        <Share2 className={variant === 'icon' ? 'w-5 h-5' : 'w-4 h-4'} />
        {variant === 'button' && <span>Share</span>}
      </button>

      {/* Share Menu */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Share Sheet */}
          <div className={cn(
            'z-50 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden',
            // Mobile: bottom sheet
            'fixed inset-x-0 bottom-0 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-64',
            'animate-in slide-in-from-bottom-4 md:slide-in-from-top-2 md:fade-in duration-200'
          )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-medium text-gray-900">Share</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full md:hidden"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Options */}
            <div className="p-2 grid grid-cols-4 md:grid-cols-2 gap-1">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    option.action();
                    if (option.name !== 'Copy Link') {
                      setIsOpen(false);
                    }
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center bg-gray-100', option.color)}>
                    <option.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-600">{option.name}</span>
                </button>
              ))}
            </div>

            {/* URL Preview */}
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 truncate flex-1">{url}</span>
              </div>
            </div>

            {/* Safe area padding for mobile */}
            <div className="h-safe-area-bottom md:hidden" />
          </div>
        </>
      )}
    </div>
  );
}
