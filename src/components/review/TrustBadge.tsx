'use client';

import { Shield, Star, Truck, Award, CheckCircle } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { StoreTrustProfile, TrustScoreFactors } from '@/types/review';

interface TrustScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TrustScoreBadge({ score, size = 'md', showLabel = true }: TrustScoreBadgeProps) {
  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-green-600 bg-green-100';
    if (s >= 75) return 'text-blue-600 bg-blue-100';
    if (s >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return 'Excellent';
    if (s >= 75) return 'Very Good';
    if (s >= 60) return 'Good';
    return 'Fair';
  };

  const sizeClasses = {
    sm: 'text-sm px-2 py-0.5',
    md: 'text-base px-3 py-1',
    lg: 'text-lg px-4 py-2',
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5 rounded-full font-medium', sizeClasses[size], getScoreColor(score))}>
      <Shield className={cn(size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
      <span>{score}%</span>
      {showLabel && <span className="text-xs opacity-75">{getScoreLabel(score)}</span>}
    </div>
  );
}

interface TrustProfileCardProps {
  profile: StoreTrustProfile;
  compact?: boolean;
}

export function TrustProfileCard({ profile, compact = false }: TrustProfileCardProps) {
  const factorLabels: Record<keyof TrustScoreFactors, { label: string; icon: typeof Star }> = {
    reviewScore: { label: 'Reviews', icon: Star },
    disputeScore: { label: 'Disputes', icon: Shield },
    fulfillmentScore: { label: 'Shipping', icon: Truck },
    volumeScore: { label: 'Experience', icon: Award },
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <TrustScoreBadge score={profile.trustScore} />
        {profile.badges.length > 0 && (
          <div className="flex gap-1">
            {profile.badges.slice(0, 2).map((badge) => (
              <StoreBadge key={badge} badge={badge} size="sm" />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-gray-900">Trust Score</h3>
        <TrustScoreBadge score={profile.trustScore} size="lg" />
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-3 mb-6">
        {(Object.keys(profile.factors) as (keyof TrustScoreFactors)[]).map((key) => {
          const { label, icon: Icon } = factorLabels[key];
          const value = profile.factors[key];
          const percentage = (value / 25) * 100;

          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2 text-gray-600">
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
                <span className="text-gray-900 font-medium">{value}/25</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-blue-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200 text-sm">
        <div>
          <span className="text-gray-500">Total Orders</span>
          <p className="font-medium text-gray-900">{profile.totalOrders}</p>
        </div>
        <div>
          <span className="text-gray-500">Avg Rating</span>
          <p className="font-medium text-gray-900">{profile.averageRating.toFixed(1)} / 5</p>
        </div>
        <div>
          <span className="text-gray-500">Dispute Rate</span>
          <p className="font-medium text-gray-900">{profile.disputeRate.toFixed(1)}%</p>
        </div>
        <div>
          <span className="text-gray-500">Avg Ship Time</span>
          <p className="font-medium text-gray-900">{profile.averageShipDays.toFixed(1)} days</p>
        </div>
      </div>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm text-gray-500 mb-2">Badges Earned</h4>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <StoreBadge key={badge} badge={badge} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

interface StoreBadgeProps {
  badge: string;
  size?: 'sm' | 'md';
}

const badgeConfig: Record<string, { label: string; color: 'gold' | 'success' | 'default' | 'warning' }> = {
  TOP_RATED: { label: 'Top Rated', color: 'gold' },
  HIGH_VOLUME: { label: 'High Volume', color: 'default' },
  DISPUTE_FREE: { label: 'Dispute Free', color: 'success' },
  CUSTOMER_FAVORITE: { label: 'Customer Favorite', color: 'gold' },
  FAST_SHIPPER: { label: 'Fast Shipper', color: 'success' },
};

export function StoreBadge({ badge, size = 'md' }: StoreBadgeProps) {
  const config = badgeConfig[badge] || { label: badge, color: 'default' as const };

  return (
    <Badge variant={config.color} className={size === 'sm' ? 'text-xs' : ''}>
      <CheckCircle className={cn('mr-1', size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      {config.label}
    </Badge>
  );
}
