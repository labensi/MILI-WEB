import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageSquare, Users, AlertCircle, CheckCircle } from 'lucide-react';

export type NotificationType = 'message' | 'reaction' | 'mention' | 'members' | 'error' | 'success';

interface ChatNotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  avatar?: string;
  onDismiss: () => void;
  autoClose?: number; // ms
}

/**
 * ChatNotification Component
 * In-chat notification banner for updates and alerts
 */
export const ChatNotification: React.FC<ChatNotificationProps> = ({
  type,
  title,
  message,
  avatar,
  onDismiss,
  autoClose = 5000,
}) => {
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onDismiss, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'reaction':
        return <Heart className="w-5 h-5" />;
      case 'mention':
        return <Bell className="w-5 h-5" />;
      case 'members':
        return <Users className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    const baseClass = 'bg-white/10 border border-white/20';
    const iconColor = 'text-white';

    switch (type) {
      case 'error':
        return {
          container: 'bg-red-500/10 border-red-500/30',
          icon: 'text-red-400',
          text: 'text-red-100',
        };
      case 'success':
        return {
          container: 'bg-green-500/10 border-green-500/30',
          icon: 'text-green-400',
          text: 'text-green-100',
        };
      case 'mention':
        return {
          container: 'bg-amber-500/10 border-amber-500/30',
          icon: 'text-amber-400',
          text: 'text-amber-100',
        };
      default:
        return {
          container: baseClass,
          icon: iconColor,
          text: 'text-white',
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`${styles.container} rounded-lg p-4 flex items-start gap-3 mb-4`}
    >
      {/* Icon */}
      <div className={styles.icon}>{getIcon()}</div>

      {/* Content */}
      <div className="flex-1">
        <p className="font-semibold text-white">{title}</p>
        <p className={`text-sm ${styles.text}`}>{message}</p>
      </div>

      {/* Close Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDismiss}
        className={`text-lg hover:opacity-100 opacity-70 transition-opacity`}
      >
        ✕
      </motion.button>
    </motion.div>
  );
};

interface ChatNotificationsContainerProps {
  notifications: (ChatNotificationProps & { id: string })[];
  onDismiss: (id: string) => void;
}

/**
 * ChatNotificationsContainer Component
 * Container for managing multiple notifications
 */
export const ChatNotificationsContainer: React.FC<ChatNotificationsContainerProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <motion.div className="fixed top-4 left-4 right-4 max-w-md z-notification">
      <AnimatePresence>
        {notifications.map((notif) => (
          <ChatNotification
            key={notif.id}
            {...notif}
            onDismiss={() => onDismiss(notif.id)}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
