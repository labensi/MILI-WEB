import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserX, Shield, Ban, CheckCircle, AlertCircle, Mail, Calendar } from 'lucide-react';
import { User } from '../../types';
import { firestoreService } from '../../firebase/firestore';
import { auth } from '../../firebase/config';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import toast from 'react-hot-toast';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const allUsers = await firestoreService.getAllUsers();
    setUsers(allUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    setLoading(false);
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBanUser = async (user: User) => {
    try {
      await firestoreService.updateUser(user.uid, { isBanned: true });
      toast.success(`${user.displayName} has been banned`);
      await loadUsers();
      setShowBanModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (user: User) => {
    try {
      await firestoreService.updateUser(user.uid, { isBanned: false });
      toast.success(`${user.displayName} has been unbanned`);
      await loadUsers();
    } catch (error) {
      toast.error('Failed to unban user');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.displayName}'s account? This action cannot be undone.`)) {
      try {
        // Note: In production, you'd need to delete from Firebase Auth as well
        await firestoreService.updateUser(user.uid, { isBanned: true });
        toast.success(`${user.displayName}'s account has been deactivated`);
        await loadUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleMakeAdmin = async (user: User) => {
    try {
      await firestoreService.updateUser(user.uid, { isAdmin: true });
      toast.success(`${user.displayName} is now an admin`);
      await loadUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleRemoveAdmin = async (user: User) => {
    if (user.email === 'admin@milichat.com') {
      toast.error('Cannot remove super admin privileges');
      return;
    }
    try {
      await firestoreService.updateUser(user.uid, { isAdmin: false });
      toast.success(`Admin privileges removed from ${user.displayName}`);
      await loadUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users by name, username, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-input w-full pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center text-white/50 py-8">Loading users...</div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar user={user} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{user.displayName}</p>
                        {user.isAdmin && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                        {user.isBanned && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                            Banned
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/50">@{user.username}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                        <div className="flex items-center gap-1">
                          <Mail size={12} />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {user.isBanned ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<CheckCircle size={14} />}
                        onClick={() => handleUnbanUser(user)}
                      >
                        Unban
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Ban size={14} />}
                        onClick={() => {
                          setSelectedUser(user);
                          setShowBanModal(true);
                        }}
                      >
                        Ban
                      </Button>
                    )}
                    
                    {!user.isAdmin && user.email !== 'admin@milichat.com' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Shield size={14} />}
                        onClick={() => handleMakeAdmin(user)}
                      >
                        Make Admin
                      </Button>
                    )}
                    
                    {user.isAdmin && user.email !== 'admin@milichat.com' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Shield size={14} />}
                        onClick={() => handleRemoveAdmin(user)}
                      >
                        Remove Admin
                      </Button>
                    )}
                    
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<UserX size={14} />}
                      onClick={() => handleDeleteUser(user)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="text-center text-white/50 py-8">
              No users found
            </div>
          )}
        </div>
      )}

      {/* Ban Confirmation Modal */}
      <Modal isOpen={showBanModal} onClose={() => setShowBanModal(false)} title="Confirm Ban">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="text-red-400" size={24} />
              <div>
                <p className="text-white font-semibold">Ban {selectedUser.displayName}?</p>
                <p className="text-white/70 text-sm">This user will not be able to log in or access any features.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowBanModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleBanUser(selectedUser)} className="flex-1">
                Confirm Ban
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
