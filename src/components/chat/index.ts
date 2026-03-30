/**
 * Chat Components Barrel Export
 * Centralized export point for all chat-related components
 * Provides clean imports throughout the application
 * 
 * Usage:
 * import { ChatHeader, EnhancedMessageInput, ThreadView } from '@/components/chat';
 */

// Header & Navigation
export { ChatHeader } from './ChatHeader';
export type { ChatHeaderProps } from './ChatHeader';

// User & Presence
export { UserPresenceIndicator, ChatStatusBar } from './UserPresenceIndicator';
export type { UserPresenceIndicatorProps, ChatStatusBarProps } from './UserPresenceIndicator';

// Search & Discovery
export { ChatSearch } from './ChatSearch';
export type { ChatSearchProps, SearchResult } from './ChatSearch';

// Message Features
export { PinnedMessagesViewer } from './PinnedMessagesViewer';
export type { PinnedMessagesViewerProps } from './PinnedMessagesViewer';

export { ChatNotification, ChatNotificationsContainer } from './ChatNotification';
export type { ChatNotificationProps, ChatNotificationsContainerProps, ChatNotificationType } from './ChatNotification';

export { EnhancedMessageInput } from './EnhancedMessageInput';
export type { EnhancedMessageInputProps } from './EnhancedMessageInput';

// Reactions
export { MessageReactions, ReactionSummary, ReactionDetails } from './MessageReactions';
export type { MessageReaction, MessageReactionsProps, ReactionSummaryProps, ReactionDetailsProps } from './MessageReactions';

// Threads
export { ThreadPreview, ThreadView } from './ThreadView';
export type { ThreadMessage, ThreadPreviewProps, ThreadViewProps } from './ThreadView';

// Metadata & Rich Content
export {
  AttachmentGrid,
  LinkPreviewCard,
  CodeBlock,
  EmbedMetadata,
} from './ChatMetadata';
export type {
  Attachment,
  LinkPreview,
  AttachmentGridProps,
  LinkPreviewProps,
  CodeBlockProps,
  EmbedMetadataProps,
} from './ChatMetadata';

// Statistics
export {
  ChatStatisticsDisplay,
  TopContributors,
  ActivityChart,
} from './ChatStatistics';
export type {
  ChatStatistics,
  ChatStatisticsDisplayProps,
  TopContributorsProps,
  ActivityChartProps,
} from './ChatStatistics';

// Quick Settings
export { RoomQuickSettings } from './RoomQuickSettings';
export type { RoomQuickSettingsProps, RoomSettings } from './RoomQuickSettings';

// Direct Messages
export { DirectMessagePreview, DirectMessageList } from './DirectMessagePreview';
export type {
  DMPreview,
  DirectMessagePreviewProps,
  DirectMessageListProps,
} from './DirectMessagePreview';

/**
 * Component Organization by Feature:
 * 
 * 📌 HEADER & DISPLAY
 * - ChatHeader: Room information and quick actions
 * 
 * 👥 PRESENCE & STATUS
 * - UserPresenceIndicator: Individual user status display
 * - ChatStatusBar: Aggregate typing/online status
 * 
 * 🔍 SEARCH & DISCOVERY
 * - ChatSearch: Searchable input with async results
 * 
 * 📌 MESSAGE MANAGEMENT
 * - PinnedMessagesViewer: Manage pinned messages
 * - ChatNotification: In-chat notification banners
 * - EnhancedMessageInput: Advanced message input with features
 * 
 * 😊 INTERACTIONS
 * - MessageReactions: Emoji reactions with counts
 * - ReactionSummary: Compact reaction display
 * - ReactionDetails: Detailed reaction information
 * 
 * 🧵 THREADING
 * - ThreadPreview: Compact thread preview
 * - ThreadView: Full thread view with replies
 * 
 * 📎 RICH CONTENT
 * - AttachmentGrid: File attachment display
 * - LinkPreviewCard: Rich link previews
 * - CodeBlock: Formatted code blocks
 * - EmbedMetadata: Discord-style embeds
 * 
 * 📊 ANALYTICS
 * - ChatStatisticsDisplay: Room statistics grid
 * - TopContributors: Top message senders
 * - ActivityChart: Hourly activity visualization
 * 
 * ⚙️ SETTINGS & CONFIGURATION
 * - RoomQuickSettings: Quick room settings panel
 * - DirectMessagePreview: DM conversation preview
 * - DirectMessageList: List of direct messages
 */
