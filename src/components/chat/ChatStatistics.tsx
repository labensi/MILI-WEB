import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Eye,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export interface ChatStatistics {
  totalMembers?: number;
  totalMessages?: number;
  activeUsers?: number;
  viewsToday?: number;
  createdAt?: Date;
  lastActivityAt?: Date;
  averageMessagesPerDay?: number;
  topContributors?: Array<{
    userId: string;
    userName: string;
    messageCount: number;
  }>;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  variant?: 'default' | 'compact';
}

/**
 * StatCard Component
 * Individual statistic card with icon, value, and optional trend indicator
 */
const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subtext,
  trend = 'neutral',
  color = 'var(--theme-accent)',
  variant = 'default',
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return color;
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-2"
      >
        <div
          style={{ backgroundColor: `${getTrendColor()}20` }}
          className="p-1.5 rounded-lg text-sm"
          style={{ color: getTrendColor() }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-white/50">{label}</p>
          <p className="text-sm font-bold text-white">{value}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <GlassCard className="p-4 space-y-3 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs md:text-sm text-white/60 font-medium">{label}</p>
            <p className="text-xl md:text-2xl font-bold text-white mt-1">
              {value}
            </p>
            {subtext && (
              <p className="text-xs text-white/50 mt-1">{subtext}</p>
            )}
          </div>
          <motion.div
            animate={{
              scale: trend === 'up' ? [1, 1.1, 1] : 1,
              rotate: trend === 'up' ? 0 : trend === 'down' ? 180 : 0,
            }}
            transition={{
              duration: 2,
              repeat: trend === 'up' ? Infinity : 0,
            }}
            style={{ color: getTrendColor() }}
            className="p-2 rounded-lg bg-white/5"
          >
            {trend === 'up' || trend === 'down' ? (
              <TrendingUp size={20} />
            ) : (
              icon
            )}
          </motion.div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

interface ChatStatisticsDisplayProps {
  stats: ChatStatistics;
  layout?: 'grid' | 'compact' | 'horizontal';
  isLoading?: boolean;
}

/**
 * ChatStatisticsDisplay Component
 * Display comprehensive chat/room statistics
 * Shows member count, message count, activity, and trends
 */
export const ChatStatisticsDisplay: React.FC<ChatStatisticsDisplayProps> = ({
  stats,
  layout = 'grid',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className={`grid ${
        layout === 'grid' ? 'grid-cols-2 md:grid-cols-4' : ''
      } gap-3`}>
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-32 rounded-xl bg-white/5"
          />
        ))}
      </div>
    );
  }

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const calculateDaysActive = () => {
    if (!stats.createdAt) return 0;
    const now = new Date();
    const created = new Date(stats.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (layout === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        {stats.totalMembers && (
          <StatCard
            icon={<Users size={18} />}
            label="Members"
            value={formatNumber(stats.totalMembers)}
            variant="compact"
          />
        )}
        {stats.totalMessages && (
          <StatCard
            icon={<MessageSquare size={18} />}
            label="Messages"
            value={formatNumber(stats.totalMessages)}
            variant="compact"
          />
        )}
        {stats.activeUsers && (
          <StatCard
            icon={<Activity size={18} />}
            label="Active Now"
            value={stats.activeUsers}
            variant="compact"
            color="#10b981"
          />
        )}
      </motion.div>
    );
  }

  if (layout === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 overflow-x-auto"
      >
        {stats.totalMembers && (
          <StatCard
            icon={<Users size={16} />}
            label="Members"
            value={formatNumber(stats.totalMembers)}
            variant="compact"
          />
        )}
        {stats.totalMessages && (
          <StatCard
            icon={<MessageSquare size={16} />}
            label="Messages"
            value={formatNumber(stats.totalMessages)}
            variant="compact"
          />
        )}
        {stats.activeUsers && (
          <StatCard
            icon={<Activity size={16} />}
            label="Active"
            value={stats.activeUsers}
            variant="compact"
            color="#10b981"
          />
        )}
        {stats.averageMessagesPerDay && (
          <StatCard
            icon={<TrendingUp size={16} />}
            label="Avg/Day"
            value={Math.round(stats.averageMessagesPerDay)}
            variant="compact"
          />
        )}
      </motion.div>
    );
  }

  // Grid layout (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3"
    >
      {stats.totalMembers && (
        <StatCard
          icon={<Users size={24} />}
          label="Members"
          value={formatNumber(stats.totalMembers)}
          subtext={`${stats.activeUsers || 0} active now`}
          trend={stats.activeUsers && stats.activeUsers > 0 ? 'up' : 'neutral'}
        />
      )}

      {stats.totalMessages && (
        <StatCard
          icon={<MessageSquare size={24} />}
          label="Total Messages"
          value={formatNumber(stats.totalMessages)}
          subtext={`Avg ${Math.round(stats.averageMessagesPerDay || 0)}/day`}
          trend="up"
        />
      )}

      {stats.viewsToday && (
        <StatCard
          icon={<Eye size={24} />}
          label="Views Today"
          value={formatNumber(stats.viewsToday)}
          trend={stats.viewsToday > 0 ? 'up' : 'neutral'}
        />
      )}

      {stats.createdAt && (
        <StatCard
          icon={<Clock size={24} />}
          label="Days Active"
          value={calculateDaysActive()}
          subtext={new Date(stats.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
          })}
        />
      )}
    </motion.div>
  );
};

interface TopContributorsProps {
  contributors: ChatStatistics['topContributors'];
  isLoading?: boolean;
  maxVisible?: number;
}

/**
 * TopContributors Component
 * Display top message contributors/active users
 */
export const TopContributors: React.FC<TopContributorsProps> = ({
  contributors = [],
  isLoading = false,
  maxVisible = 5,
}) => {
  if (isLoading) {
    return (
      <GlassCard className="p-4 space-y-2">
        <h3 className="font-bold text-white mb-3">Top Contributors</h3>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-8 rounded-lg bg-white/5"
          />
        ))}
      </GlassCard>
    );
  }

  const displayContributors = contributors.slice(0, maxVisible);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <GlassCard className="p-4 space-y-3">
        <h3 className="font-bold text-white">Top Contributors</h3>

        {displayContributors.length > 0 ? (
          <motion.div className="space-y-2">
            {displayContributors.map((contributor, idx) => {
              const maxMessages = displayContributors[0]?.messageCount || 1;
              const percentage = (contributor.messageCount / maxMessages) * 100;

              return (
                <motion.div
                  key={contributor.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white font-medium">
                      {idx + 1}. {contributor.userName}
                    </span>
                    <span className="text-white/60 text-xs">
                      {contributor.messageCount} msg
                    </span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-2 rounded-full bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent)]/50"
                  />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <p className="text-sm text-white/50 text-center py-4">
            No activity yet
          </p>
        )}
      </GlassCard>
    </motion.div>
  );
};

interface ActivityChartProps {
  data: Array<{
    hour: number;
    messageCount: number;
  }>;
  isLoading?: boolean;
}

/**
 * ActivityChart Component
 * Display hourly activity pattern visualization
 */
export const ActivityChart: React.FC<ActivityChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <GlassCard className="p-4">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-40 rounded-lg bg-white/5"
        />
      </GlassCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <GlassCard className="p-4 text-center text-white/50">
        No activity data available
      </GlassCard>
    );
  }

  const maxMessages = Math.max(...(data.map((d) => d.messageCount) || [1]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <GlassCard className="p-4">
        <h3 className="font-bold text-white mb-4">Activity Pattern (24h)</h3>
        <div className="flex items-end justify-between gap-1 h-32">
          {data.map((point, idx) => {
            const height = (point.messageCount / maxMessages) * 100;
            return (
              <motion.div
                key={idx}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: idx * 0.03 }}
                whileHover={{ scale: 1.1, scaleX: 1.2 }}
                className="flex-1 bg-gradient-to-t from-[var(--theme-accent)] to-[var(--theme-accent)]/50 rounded-t-lg cursor-pointer group relative"
                title={`${point.hour}:00 - ${point.messageCount} messages`}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                  {point.messageCount}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-white/50 mt-2">
          <span>00:00</span>
          <span>12:00</span>
          <span>23:00</span>
        </div>
      </GlassCard>
    </motion.div>
  );
};
