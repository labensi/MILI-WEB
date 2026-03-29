import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { GlassCard } from '../components/ui/GlassCard';

const ADMIN_EMAIL = 'admin@milichat.com';

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Guard: only real admin can view this page
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const isAdmin = user.isAdmin || user.email === ADMIN_EMAIL;
    if (!isAdmin) {
      navigate('/feed');
    }
  }, [user, navigate]);

  if (!user) return null;

  const isAdmin = user.isAdmin || user.email === ADMIN_EMAIL;
  if (!isAdmin) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Admin header banner */}
      <GlassCard className="p-5 mb-6" hover={false}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Crown size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">MILI CHAT Admin Panel</h1>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20">
                <Shield size={12} className="text-yellow-400" />
                <span className="text-yellow-400 text-xs font-semibold">Verified Admin</span>
              </div>
            </div>
            <p className="text-white/50 text-sm mt-0.5">
              Logged in as <strong className="text-white">{user.email}</strong> · Full admin access
            </p>
          </div>
          <div className="text-right text-xs text-white/30">
            <p>MILI CHAT v1.0</p>
            <p>MADE BY LA BENS AI</p>
          </div>
        </div>
      </GlassCard>

      {/* Main dashboard component */}
      <AdminDashboard />
    </motion.div>
  );
};
