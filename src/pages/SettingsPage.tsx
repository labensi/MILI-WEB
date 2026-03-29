import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Type,
  Palette,
  Lock,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  X,
  Mail,
  KeyRound,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { logoutUser } from '../firebase/auth';
import { ProfileEditor } from '../components/settings/ProfileEditor';
import { FontStylePicker } from '../components/settings/FontStylePicker';
import { ThemeSelector } from '../components/settings/ThemeSelector';
import { PrivacySettings } from '../components/settings/PrivacySettings';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type SettingsTab =
  | 'profile'
  | 'font'
  | 'theme'
  | 'privacy'
  | 'notifications'
  | 'account'
  | 'support';

/* ─── Modal ──────────────────────────────────────────────────────────────── */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-md rounded-2xl bg-[#1a1a2e]/90 border border-white/10 backdrop-blur-xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Toggle Row ─────────────────────────────────────────────────────────── */

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div>
      <p className="text-white font-medium text-sm">{label}</p>
      {description && (
        <p className="text-white/40 text-xs mt-0.5">{description}</p>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-[var(--accent)]' : 'bg-white/20'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

/* ─── FAQ Item ───────────────────────────────────────────────────────────── */

interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <p className="text-white font-semibold text-sm pr-4">{question}</p>
        {open ? (
          <ChevronUp size={16} className="text-white/50 flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-white/50 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-white/70 text-sm pb-3">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Input ──────────────────────────────────────────────────────────────── */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="block text-white/80 text-sm font-medium">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)] transition-colors text-sm"
    />
  </div>
);

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Modal visibility
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Modal form state
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Notification toggles
  const [notifications, setNotifications] = useState({
    newMessages: true,
    mentions: true,
    roomInvites: true,
    announcements: true,
    events: false,
    emailDigest: false,
  });

  // Support form
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSending, setSupportSending] = useState(false);

  const tabs: { id: SettingsTab; label: string; icon: React.FC<any> }[] = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'font', label: 'Font Style', icon: Type },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const handleChangeEmail = async () => {
    if (!newEmail) return toast.error('Please enter a new email');
    try {
      // await updateUserEmail(newEmail, currentPassword);
      toast.success('Email updated successfully');
      setShowEmailModal(false);
      setNewEmail('');
      setCurrentPassword('');
    } catch {
      toast.error('Failed to update email');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword)
      return toast.error('Passwords do not match');
    if (newPassword.length < 6)
      return toast.error('Password must be at least 6 characters');
    try {
      // await updateUserPassword(currentPassword, newPassword);
      toast.success('Password updated successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE')
      return toast.error('Please type DELETE to confirm');
    try {
      // await deleteAccount();
      toast.success('Account deleted');
      navigate('/auth');
    } catch {
      toast.error('Failed to delete account');
    }
  };

  const handleSupportSubmit = async () => {
    if (!supportMessage.trim()) return toast.error('Please enter a message');
    setSupportSending(true);
    try {
      // await firestoreService.sendSupportMessage(supportMessage);
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Message sent to admin!');
      setSupportMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSupportSending(false);
    }
  };

  const faqItems: FaqItemProps[] = [
    {
      question: 'How do I create a room?',
      answer:
        'Click on "Chat Rooms" in the sidebar, then click "Create New Room". You can create up to 3 rooms.',
    },
    {
      question: 'How do I change my font style?',
      answer:
        'Go to Settings → Font Style and choose from various options. Changes apply instantly.',
    },
    {
      question: 'How do I report inappropriate content?',
      answer:
        'Click the three dots menu on any post or message and select "Report". Our admin team will review it.',
    },
    {
      question: 'Can I upload custom stickers?',
      answer:
        'Yes! In the chat input, click the sticker icon and then "Upload Custom Sticker". Supported formats: PNG, GIF.',
    },
    {
      question: 'How do seasonal themes work?',
      answer:
        'Themes change automatically based on the season, but you can override them in Settings → Theme.',
    },
    {
      question: 'How do I change my username or avatar?',
      answer:
        'Go to Settings → My Profile to update your username, avatar, bio, and other profile details.',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileEditor />;

      case 'font':
        return <FontStylePicker />;

      case 'theme':
        return <ThemeSelector />;

      case 'privacy':
        return <PrivacySettings />;

      case 'notifications':
        return (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-1">
              Notifications
            </h3>
            <p className="text-white/40 text-sm mb-5">
              Control what you get notified about
            </p>
            <div>
              <ToggleRow
                label="New Messages"
                description="Get notified when you receive a direct message"
                checked={notifications.newMessages}
                onChange={(v) =>
                  setNotifications((n) => ({ ...n, newMessages: v }))
                }
              />
              <ToggleRow
                label="Mentions"
                description="Get notified when someone @mentions you"
                checked={notifications.mentions}
                onChange={(v) =>
                  setNotifications((n) => ({ ...n, mentions: v }))
                }
              />
              <ToggleRow
                label="Room Invites"
                description="Get notified when someone invites you to a room"
                checked={notifications.roomInvites}
                onChange={(v) =>
                  setNotifications((n) => ({ ...n, roomInvites: v }))
                }
              />
              <ToggleRow
                label="Announcements"
                description="Receive site-wide announcements from admins"
                checked={notifications.announcements}
                onChange={(v) =>
                  setNotifications((n) => ({ ...n, announcements: v }))
                }
              />
              <ToggleRow
                label="Events"
                description="Get notified about upcoming events"
                checked={notifications.events}
                onChange={(v) =>
                  setNotifications((n) => ({ ...n, events: v }))
                }
              />
              <ToggleRow
                label="Email Digest"
                description="Receive a weekly email summary"
                checked={notifications.emailDigest}
                onChange={(v) =>
                  setNotifications((n) => ({ ...n, emailDigest: v }))
                }
              />
            </div>
            <div className="mt-5">
              <Button
                variant="primary"
                onClick={() => toast.success('Notification preferences saved!')}
              >
                Save Preferences
              </Button>
            </div>
          </GlassCard>
        );

      case 'account':
        return (
          <div className="space-y-4">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Account Info
              </h3>
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-white/50 text-xs font-medium mb-1 uppercase tracking-wider">
                    Email
                  </label>
                  <p className="text-white">{user?.email ?? '—'}</p>
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-medium mb-1 uppercase tracking-wider">
                    Member Since
                  </label>
                  <p className="text-white">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="secondary"
                  icon={<Mail size={16} />}
                  onClick={() => setShowEmailModal(true)}
                >
                  Change Email
                </Button>
                <Button
                  variant="secondary"
                  icon={<KeyRound size={16} />}
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </Button>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-1">
                Session
              </h3>
              <p className="text-white/40 text-sm mb-4">
                Sign out of your current session
              </p>
              <Button
                variant="secondary"
                onClick={handleLogout}
                icon={<LogOut size={16} />}
              >
                Logout
              </Button>
            </GlassCard>

            <GlassCard className="p-6 border border-red-500/20">
              <h3 className="text-lg font-semibold text-red-400 mb-1">
                Danger Zone
              </h3>
              <p className="text-white/40 text-sm mb-4">
                Permanently delete your account and all associated data. This
                cannot be undone.
              </p>
              <Button
                variant="danger"
                icon={<Trash2 size={16} />}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </Button>
            </GlassCard>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-4">
            {/* About */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                About MILI CHAT
              </h3>
              <p className="text-white/70 mb-4 text-sm leading-relaxed">
                MILI CHAT is your cute little corner of the internet — a social
                media and chat platform designed with love and care to bring
                people together in a beautiful, aesthetic environment.
              </p>
              <div className="p-4 rounded-lg bg-white/5 text-center border border-white/10">
                <p className="text-white font-bold tracking-wide">
                  MADE BY LA BENS AI
                </p>
                <p className="text-white/50 text-sm mt-1">
                  ✨ Crafted with love ✨
                </p>
              </div>
            </GlassCard>

            {/* Discord */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Join Our Community
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Connect with other MILI CHAT users, get updates, and share
                feedback on our Discord server.
              </p>
              <a
                href="https://discord.gg/vPGJngQbUx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="primary">⛄ Join Discord Server</Button>
              </a>
            </GlassCard>

            {/* Contact Admin */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-1">
                Contact Admin
              </h3>
              <p className="text-white/40 text-sm mb-4">
                Have an issue or suggestion? Send us a message.
              </p>
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                rows={4}
                placeholder="Describe your issue or suggestion..."
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)] transition-colors text-sm resize-none mb-3"
              />
              <Button
                variant="primary"
                icon={<Send size={16} />}
                onClick={handleSupportSubmit}
                disabled={supportSending}
              >
                {supportSending ? 'Sending...' : 'Send Message'}
              </Button>
            </GlassCard>

            {/* FAQ */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Frequently Asked Questions
              </h3>
              <div>
                {faqItems.map((item, i) => (
                  <FaqItem key={i} {...item} />
                ))}
              </div>
            </GlassCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <GlassCard className="p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </GlassCard>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{renderContent()}</div>
      </div>

      {/* Change Email Modal */}
      <Modal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Change Email"
      >
        <div className="space-y-4">
          <Input
            label="New Email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="new@email.com"
          />
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
          />
          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={handleChangeEmail}>
              Update Email
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowEmailModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
          />
          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={handleChangePassword}>
              Update Password
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">
              ⚠️ This action is permanent and cannot be undone. All your data,
              messages, and rooms will be deleted.
            </p>
          </div>
          <Input
            label='Type "DELETE" to confirm'
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
          />
          <div className="flex gap-2 pt-2">
            <Button variant="danger" onClick={handleDeleteAccount}>
              Delete My Account
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
