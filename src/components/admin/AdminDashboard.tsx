import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  FileText,
  AlertTriangle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { firestoreService } from '../../firebase/firestore';
import { GlassCard } from '../ui/GlassCard';
import { UserManager } from './UserManager';
import { ContentModeration } from './ContentModeration';
import { AnnouncementSender } from './AnnouncementSender';
import { EventCreator } from './EventCreator';

type Tab = 'dashboard' | 'users' | 'moderation' | 'announcements' | 'events';

interface Stats {
  totalUsers: number;
  totalRooms: number;
  totalPosts: number;
  totalReports: number;
  messagesToday: number;
  activeUsers: number;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRooms: 0,
    totalPosts: 0,
    totalReports: 0,
    messagesToday: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const users = await firestoreService.getAllUsers();
      const rooms = await firestoreService.getAllRooms();
      const reports = await firestoreService.getReports();

      setStats({
        totalUsers: users.length,
        totalRooms: rooms.length,
        totalPosts: 0,
        totalReports: reports.filter((r: any) => r.status === 'pending').length,
        messagesToday: 0,
        activeUsers: users.filter((u: any) => {
          const lastSeen = u.lastSeen;
          return (
            lastSeen &&
            new Date().getTime() - new Date(lastSeen).getTime() <
              24 * 60 * 60 * 1000
          );
        }).length,
      });
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.FC<any> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'moderation', label: 'Moderation', icon: AlertTriangle },
    { id: 'announcements', label: 'Announcements', icon: MessageSquare },
    { id: 'events', label: 'Events', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="text-white/50 text-sm">Welcome, Admin</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white/10 text-white border-b-2 border-[var(--accent)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
              color="blue"
              loading={loading}
            />
            <StatCard
              icon={MessageSquare}
              label="Total Rooms"
              value={stats.totalRooms}
              color="green"
              loading={loading}
            />
            <StatCard
              icon={FileText}
              label="Total Posts"
              value={stats.totalPosts}
              color="purple"
              loading={loading}
            />
            <StatCard
              icon={AlertTriangle}
              label="Pending Reports"
              value={stats.totalReports}
              color="red"
              loading={loading}
            />
            <StatCard
              icon={Activity}
              label="Active Users (24h)"
              value={stats.activeUsers}
              color="yellow"
              loading={loading}
            />
            <StatCard
              icon={TrendingUp}
              label="Messages Today"
              value={stats.messagesToday}
              color="pink"
              loading={loading}
            />
          </div>

          {/* Quick Actions */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton
                onClick={() => setActiveTab('announcements')}
                icon={<MessageSquare size={20} className="mb-2" />}
                title="Send Announcement"
                subtitle="Broadcast to all users"
              />
              <QuickActionButton
                onClick={() => setActiveTab('events')}
                icon={<Activity size={20} className="mb-2" />}
                title="Create Event"
                subtitle="Schedule site-wide event"
              />
              <QuickActionButton
                onClick={() => setActiveTab('moderation')}
                icon={<AlertTriangle size={20} className="mb-2" />}
                title="Review Reports"
                subtitle={`${stats.totalReports} pending`}
              />
              <QuickActionButton
                onClick={() => setActiveTab('users')}
                icon={<Users size={20} className="mb-2" />}
                title="Manage Users"
                subtitle={`${stats.totalUsers} registered`}
              />
            </div>
          </GlassCard>
        </div>
      )}

      {/* Other Tabs */}
      {activeTab === 'users' && <UserManager />}
      {activeTab === 'moderation' && <ContentModeration />}
      {activeTab === 'announcements' && <AnnouncementSender />}
      {activeTab === 'events' && <EventCreator />}
    </div>
  );
};

/* ─── Stat Card ─────────────────────────────────────────────────────────── */

interface StatCardProps {
  icon: React.FC<any>;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'pink';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  color,
  loading = false,
}) => {
  const colors: Record<StatCardProps['color'], string> = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} border backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon size={24} className="text-white/70" />
        {loading ? (
          <div className="h-8 w-12 rounded bg-white/10 animate-pulse" />
        ) : (
          <span className="text-2xl font-bold text-white">{value}</span>
        )}
      </div>
      <p className="text-white/70 text-sm">{label}</p>
    </motion.div>
  );
};

/* ─── Quick Action Button ────────────────────────────────────────────────── */

interface QuickActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  onClick,
  icon,
  title,
  subtitle,
}) => (
  <button
    onClick={onClick}
    className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-left"
  >
    {icon}
    <p className="font-semibold">{title}</p>
    <p className="text-xs text-white/50">{subtitle}</p>
  </button>
);
