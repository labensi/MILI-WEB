# Chat Components Documentation

Complete reference guide for all chat UI components in the MILI Chat application.

**Last Updated:** 2024
**Version:** 1.0.0
**Framework:** React 18.2.0 + TypeScript 5.2.2
**Animation Library:** Framer Motion 10.16.16

---

## Table of Contents

1. [Overview](#overview)
2. [Component Library](#component-library)
3. [Usage Examples](#usage-examples)
4. [Integration Patterns](#integration-patterns)
5. [Styling & theming](#styling--theming)
6. [Best Practices](#best-practices)
7. [Accessibility](#accessibility)
8. [Performance Tips](#performance-tips)

---

## Overview

The chat components library provides a comprehensive set of production-ready UI components for building modern messaging interfaces. Each component is:

- **Fully Typed:** Complete TypeScript interfaces for all props
- **Animated:** Smooth Framer Motion animations with spring physics
- **Themed:** Integrates with CSS custom properties for dynamic theming
- **Accessible:** ARIA labels and keyboard navigation where applicable
- **Responsive:** Mobile-first design with adaptive layouts

### Architecture

```
src/components/chat/
├── ChatHeader.tsx                 # Room info & quick actions
├── UserPresenceIndicator.tsx      # Status indicators
├── ChatSearch.tsx                 # Searchable input
├── PinnedMessagesViewer.tsx       # Pinned message management
├── ChatNotification.tsx           # Notification banners
├── EnhancedMessageInput.tsx       # Advanced message input
├── MessageReactions.tsx           # Emoji reactions
├── ThreadView.tsx                 # Message threads
├── ChatMetadata.tsx               # Attachments & embeds
├── ChatStatistics.tsx             # Analytics & stats
├── RoomQuickSettings.tsx          # Room settings panel
├── DirectMessagePreview.tsx       # DM conversation previews
└── index.ts                       # Barrel export
```

---

## Component Library

### 1. ChatHeader

**Purpose:** Display room/channel information with quick action buttons.

**Component:** `ChatHeader`
**Props Interface:** `ChatHeaderProps`

```typescript
interface ChatHeaderProps {
  room?: Room;
  memberCount?: number;
  onSettings?: () => void;
  onInfo?: () => void;
  onNotifications?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
}
```

**Features:**
- Room name and description display
- Member count badge
- Loading skeleton state
- Action buttons: Settings, Info, Notifications, Close (mobile)
- Responsive design with collapsing actions

**Example:**
```tsx
import { ChatHeader } from '@/components/chat';

export const MyChat = () => {
  return (
    <ChatHeader
      room={currentRoom}
      memberCount={members.length}
      onSettings={() => openSettings()}
      onInfo={() => showRoomInfo()}
      onNotifications={() => toggleNotifications()}
    />
  );
};
```

---

### 2. UserPresenceIndicator & ChatStatusBar

**Purpose:** Show user online/offline/typing status with visual indicators.

**Components:** `UserPresenceIndicator`, `ChatStatusBar`
**Props Interface:** `UserPresenceIndicatorProps`, `ChatStatusBarProps`

**UserPresenceIndicator:**
```typescript
interface UserPresenceIndicatorProps {
  user?: User;
  isTyping?: boolean;
  showStatus?: boolean;
  compact?: boolean;
}
```

**ChatStatusBar:**
```typescript
interface ChatStatusBarProps {
  typingUsers?: string[];
  onlineCount?: number;
  totalMembers?: number;
  animated?: boolean;
}
```

**Features:**
- Real-time online/offline status
- Typing indicator with animation
- Pulsing status dot with color coding
- Compact and full modes
- Aggregate online count display

**Status Colors:**
- 🟢 Green (#4ade80): Online
- ⚪ Gray (rgba(255,255,255,0.3)): Offline
- 🔵 Blue (#3b82f6): Typing

**Example:**
```tsx
import { UserPresenceIndicator, ChatStatusBar } from '@/components/chat';

export const StatusDemo = () => {
  return (
    <>
      <UserPresenceIndicator 
        user={user} 
        isTyping={currentlyTyping} 
        showStatus 
      />
      <ChatStatusBar 
        typingUsers={["John", "Sarah"]} 
        onlineCount={42} 
        totalMembers={100}
      />
    </>
  );
};
```

---

### 3. ChatSearch

**Purpose:** Searchable input for messages, users, and rooms with live results.

**Component:** `ChatSearch`
**Props Interface:** `ChatSearchProps`

```typescript
export interface SearchResult {
  id: string;
  type: 'message' | 'user' | 'room';
  title: string;
  subtitle?: string;
  avatar?: string;
  timestamp?: Date;
}

interface ChatSearchProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelectResult: (result: SearchResult) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

**Features:**
- Debounced async search (300ms)
- localStorage-based recent searches (max 5)
- Search result types with icons
- Click-outside detection
- Clear button with animation
- Loading spinner

**Example:**
```tsx
import { ChatSearch } from '@/components/chat';

const handleSearch = async (query: string) => {
  const results = await searchAPI.find(query);
  return results.map(r => ({
    id: r.id,
    type: 'message',
    title: r.content,
    timestamp: new Date(r.createdAt),
  }));
};

export const SearchDemo = () => {
  return (
    <ChatSearch 
      onSearch={handleSearch}
      onSelectResult={(result) => {
        console.log('Selected:', result);
      }}
      placeholder="Search messages..."
    />
  );
};
```

---

### 4. PinnedMessagesViewer

**Purpose:** Display and manage pinned messages in a room.

**Component:** `PinnedMessagesViewer`
**Props Interface:** `PinnedMessagesViewerProps`

```typescript
interface PinnedMessagesViewerProps {
  pinnedMessages?: Message[];
  onUnpin?: (messageId: string) => void;
  onJumpTo?: (message: Message) => void;
}
```

**Features:**
- List of pinned message preview cards
- Expandable full message view
- Unpin button with hover reveal
- Jump to message in chat
- Message count badge
- Scrollable container with custom scrollbar
- Staggered animation entrance

**Example:**
```tsx
import { PinnedMessagesViewer } from '@/components/chat';

export const RoomChat = () => {
  return (
    <PinnedMessagesViewer
      pinnedMessages={room.pinnedMessages}
      onUnpin={(msgId) => unpinMessage(msgId)}
      onJumpTo={(msg) => scrollToMessage(msg.id)}
    />
  );
};
```

---

### 5. ChatNotification & ChatNotificationsContainer

**Purpose:** In-chat notification banners for alerts and updates.

**Components:** `ChatNotification`, `ChatNotificationsContainer`
**Props Interface:** `ChatNotificationProps`, `ChatNotificationsContainerProps`

```typescript
type ChatNotificationType = 'message' | 'reaction' | 'mention' | 'members' | 'error' | 'success';

interface ChatNotificationProps {
  id: string;
  type: ChatNotificationType;
  message: string;
  onClose?: () => void;
  autoCloseDuration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ChatNotificationsContainerProps {
  notifications: ChatNotificationProps[];
  onRemove?: (id: string) => void;
  maxVisible?: number;
}
```

**Notification Types & Icons:**
- 💬 `message`: New message
- ❤️ `reaction`: Someone reacted
- 🔔 `mention`: You were mentioned
- 👥 `members`: Member activity
- ⚠️ `error`: Error alert
- ✓ `success`: Success confirmation

**Features:**
- Type-specific styling and icons
- Auto-dismiss with configurable timeout (default 5000ms)
- Smooth spring animation entrance
- Close button for manual dismissal
- Color-coded: error (red), success (green), mention (amber), default (transparent)

**Example:**
```tsx
import { ChatNotification, ChatNotificationsContainer } from '@/components/chat';

export const NotificationDemo = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  return (
    <>
      <ChatNotificationsContainer
        notifications={notifications}
        onRemove={(id) => setNotifications(prev => 
          prev.filter(n => n.id !== id)
        )}
      />
      <button onClick={() => addNotification('success', 'Message sent!')}>
        Send Notification
      </button>
    </>
  );
};
```

---

### 6. EnhancedMessageInput

**Purpose:** Advanced message input textarea with productivity features.

**Component:** `EnhancedMessageInput`
**Props Interface:** `EnhancedMessageInputProps`

```typescript
interface EnhancedMessageInputProps {
  onSend: (message: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  hasAttachments?: boolean;
  onAttachmentClick?: () => void;
}
```

**Features:**
- Auto-expanding textarea (min 1 row, max 200px height)
- Character counter (4000 char limit) with progressive warnings
- Typing indicator callback (1 second debounce)
- Smart keyboard handling: Enter=send, Shift+Enter=newline
- Attachment button support (Plus icon)
- Format hints display (bold, italic, code)
- Loading state during send operation
- Character limit warnings: >90%=yellow, >100%=red/disabled

**Keyboard Shortcuts:**
- `Enter`: Send message
- `Shift+Enter`: New line
- `Ctrl/Cmd+Enter`: Send (alternative)

**Example:**
```tsx
import { EnhancedMessageInput } from '@/components/chat';

export const ChatInput = () => {
  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <EnhancedMessageInput
      onSend={handleSend}
      onTyping={(isTyping) => setTypingStatus(isTyping)}
      hasAttachments={true}
      onAttachmentClick={() => openFilePicker()}
      placeholder="Type a message..."
    />
  );
};
```

---

### 7. MessageReactions

**Purpose:** Display and manage emoji reactions on messages.

**Components:** `MessageReactions`, `ReactionSummary`, `ReactionDetails`
**Props Interfaces:** `MessageReactionsProps`, `ReactionSummaryProps`, `ReactionDetailsProps`

```typescript
export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
  currentUserReacted: boolean;
}

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
  disabled?: boolean;
  compact?: boolean;
}
```

**Common Emoji Set:**
`👍 ❤️ 😂 😮 😢 🔥 ✨ 😍 🎉 👏 💯 🚀 🤔 😴 💀 👿 🙌 💪`

**Features:**
- Animated reaction pills with counts
- Click to add/remove reactions
- Dropdown emoji picker with grid layout
- Hover tooltips showing who reacted
- Reaction summary view with top emoji
- Detailed reaction breakdown by user

**Example:**
```tsx
import { MessageReactions, ReactionDetails } from '@/components/chat';

export const ReactionDemo = () => {
  const [reactions, setReactions] = useState([
    { emoji: '👍', count: 5, userIds: ['u1', 'u2'], currentUserReacted: false },
    { emoji: '❤️', count: 3, userIds: ['u3', 'u4'], currentUserReacted: true },
  ]);

  return (
    <MessageReactions
      reactions={reactions}
      onAddReaction={(emoji) => addReaction(emoji)}
      onRemoveReaction={(emoji) => removeReaction(emoji)}
    />
  );
};
```

---

### 8. ThreadView & ThreadPreview

**Purpose:** Display message threads and replies.

**Components:** `ThreadView`, `ThreadPreview`
**Props Interfaces:** `ThreadViewProps`, `ThreadPreviewProps`

```typescript
export interface ThreadMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  reactionCount?: number;
}

interface ThreadViewProps {
  parentMessage: ThreadMessage;
  replies: ThreadMessage[];
  onClose?: () => void;
  onSendReply?: (content: string) => Promise<void>;
  isLoading?: boolean;
  currentUserId?: string;
}

interface ThreadPreviewProps {
  parentMessage: ThreadMessage;
  replyCount: number;
  lastReplyAuthor?: string;
  onOpenThread?: () => void;
  compact?: boolean;
}
```

**Features:**
- Parent message display with context
- Reply count and last reply info
- Full thread view with all replies
- Reply input with send button
- Edit/delete buttons for own messages
- Reaction count display
- Click-to-expand preview mode

**Example:**
```tsx
import { ThreadView, ThreadPreview } from '@/components/chat';

export const ThreadDemo = () => {
  const [selectedThread, setSelectedThread] = useState(null);

  return (
    <>
      {messages.map(msg => msg.replyCount > 0 && (
        <ThreadPreview
          key={msg.id}
          parentMessage={msg}
          replyCount={msg.replyCount}
          onOpenThread={() => setSelectedThread(msg)}
        />
      ))}
      
      {selectedThread && (
        <ThreadView
          parentMessage={selectedThread}
          replies={selectedThread.replies}
          onSendReply={(content) => addReply(selectedThread.id, content)}
          onClose={() => setSelectedThread(null)}
        />
      )}
    </>
  );
};
```

---

### 9. Chat Metadata Components

**Purpose:** Display rich content including attachments, links, code, and embeds.

**Components:** `AttachmentGrid`, `LinkPreviewCard`, `CodeBlock`, `EmbedMetadata`

#### AttachmentGrid

```typescript
export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'file';
  url: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: Date;
}

interface AttachmentGridProps {
  attachments: Attachment[];
  onDownload?: (attachment: Attachment) => void;
  disabled?: boolean;
}
```

**Features:**
- Image grid with hover overlay
- File list with type-specific icons
- Download button for each file
- File size display
- Responsive grid layout

#### LinkPreviewCard

```typescript
export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
}
```

**Features:**
- Rich link preview with thumbnail
- Title and description
- Domain indicator
- Click-through to full link

#### CodeBlock

```typescript
interface CodeBlockProps {
  code: string;
  language: string;
  onCopy?: () => void;
}
```

**Features:**
- Syntax highlighting placeholder
- Language label
- Copy button with visual feedback
- Horizontally scrollable

#### EmbedMetadata

```typescript
interface EmbedMetadataProps {
  title?: string;
  description?: string;
  thumbnail?: string;
  color?: string;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: string;
  timestamp?: Date;
}
```

**Features:**
- Discord-style embeds
- Colored left border
- Title and description
- Custom fields with inline layout
- Footer with timestamp

**Example:**
```tsx
import { AttachmentGrid, LinkPreviewCard, CodeBlock, EmbedMetadata } from '@/components/chat';

export const MetadataDemo = () => {
  return (
    <>
      <AttachmentGrid
        attachments={[
          { id: '1', name: 'image.png', type: 'image', url: '/img.png' },
        ]}
        onDownload={(file) => downloadFile(file)}
      />

      <LinkPreviewCard
        links={[
          {
            url: 'https://example.com',
            title: 'Example Site',
            description: 'A great example',
            domain: 'example.com',
          },
        ]}
      />

      <CodeBlock
        code={`const hello = () => console.log("world");`}
        language="typescript"
        onCopy={() => onCopyCode()}
      />

      <EmbedMetadata
        title="System Alert"
        description="Your subscription will expire soon"
        color="#f97316"
        fields={[
          { name: 'Expires', value: '2024-12-31' },
        ]}
      />
    </>
  );
};
```

---

### 10. ChatStatistics

**Purpose:** Display analytics and room statistics.

**Components:** `ChatStatisticsDisplay`, `TopContributors`, `ActivityChart`

```typescript
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
```

**ChatStatisticsDisplay:**
- Layouts: grid (default), compact, horizontal
- Stat cards with icons and trend indicators
- Loading skeleton state
- Number formatting (K, M for thousands/millions)

**TopContributors:**
- Leaderboard of top message senders
- Message count display
- Visual progress bars with animations
- Configurable max visible

**ActivityChart:**
- Hourly activity visualization
- Bar chart with hover tooltips
- 24-hour time span
- Peak activity highlighting

**Example:**
```tsx
import { ChatStatisticsDisplay, TopContributors, ActivityChart } from '@/components/chat';

export const StatsDemo = () => {
  const stats: ChatStatistics = {
    totalMembers: 250,
    totalMessages: 5420,
    activeUsers: 42,
    createdAt: new Date('2024-01-01'),
    averageMessagesPerDay: 67,
    topContributors: [
      { userId: 'u1', userName: 'Alice', messageCount: 1200 },
      { userId: 'u2', userName: 'Bob', messageCount: 980 },
    ],
  };

  return (
    <>
      <ChatStatisticsDisplay stats={stats} layout="grid" />
      <TopContributors contributors={stats.topContributors} maxVisible={5} />
      <ActivityChart data={hourlyActivityData} />
    </>
  );
};
```

---

### 11. RoomQuickSettings

**Purpose:** Quick access to room settings and configuration.

**Component:** `RoomQuickSettings`
**Props Interface:** `RoomQuickSettingsProps`

```typescript
export interface RoomSettings {
  muted: boolean;
  notifications: 'all' | 'mentions' | 'none';
  archived: boolean;
  hidden: boolean;
  isPrivate: boolean;
}

interface RoomQuickSettingsProps {
  settings: RoomSettings;
  onSettingChange: (key: keyof RoomSettings, value: any) => void;
  onDelete?: () => void;
  isOwner?: boolean;
}
```

**Features:**
- Compact settings button expands to modal
- Mute/unmute toggle
- Notification level selector (all/mentions/none)
- Visibility toggle (hidden/visible)
- Archive function
- Delete room (owner only)
- Click-outside to close
- Smooth animations

**Example:**
```tsx
import { RoomQuickSettings } from '@/components/chat';

export const RoomHeader = () => {
  const [settings, setSettings] = useState<RoomSettings>({
    muted: false,
    notifications: 'all',
    archived: false,
    hidden: false,
    isPrivate: false,
  });

  return (
    <RoomQuickSettings
      settings={settings}
      onSettingChange={(key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
      }}
      onDelete={() => deleteRoom()}
      isOwner={isRoomOwner}
    />
  );
};
```

---

### 12. Direct Message Components

**Purpose:** Display and manage direct message conversations.

**Components:** `DirectMessagePreview`, `DirectMessageList`

```typescript
export interface DMPreview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount?: number;
  isPinned?: boolean;
  isOnline?: boolean;
}
```

**DirectMessagePreview:**
- User avatar with online indicator
- Last message snippet (truncated)
- Unread count badge
- Pin/delete actions on hover
- Time since last message
- Online status animation

**DirectMessageList:**
- Multiple DM previews in list
- Pinned DMs section at top
- Loading skeleton state
- Empty state message
- Staggered animation entrance

**Example:**
```tsx
import { DirectMessageList } from '@/components/chat';

export const DMSidebar = () => {
  const [dms, setDms] = useState<DMPreview[]>([...]);
  const [selectedId, setSelectedId] = useState('');

  return (
    <DirectMessageList
      dms={dms}
      selectedDmId={selectedId}
      onSelectDm={(id) => setSelectedId(id)}
      onPinDm={(id) => pinDM(id)}
      onDeleteDm={(id) => deleteDM(id)}
    />
  );
};
```

---

## Usage Examples

### Complete Chat Interface

```tsx
import {
  ChatHeader,
  ChatSearch,
  PinnedMessagesViewer,
  EnhancedMessageInput,
  ChatNotificationsContainer,
  ThreadView,
} from '@/components/chat';

export const ChatRoom = ({ roomId }: { roomId: string }) => {
  const [selectedThread, setSelectedThread] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { room, messages, members } = useChatRoom(roomId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ChatHeader
        room={room}
        memberCount={members.length}
        onSettings={() => showSettings()}
      />

      {/* Search */}
      <ChatSearch
        onSearch={searchMessages}
        onSelectResult={handleSearchResult}
      />

      {/* Pinned Messages */}
      <PinnedMessagesViewer
        pinnedMessages={room.pinnedMessages}
        onJumpTo={(msg) => scrollToMessage(msg.id)}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id}>
            {/* Message render */}
            {msg.replyCount > 0 && (
              <ThreadPreview
                parentMessage={msg}
                replyCount={msg.replyCount}
                onOpenThread={() => setSelectedThread(msg)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <EnhancedMessageInput
        onSend={(content) => sendMessage(content)}
        onTyping={(isTyping) => setTypingStatus(isTyping)}
        hasAttachments
        onAttachmentClick={() => openFilePicker()}
      />

      {/* Notifications */}
      <ChatNotificationsContainer
        notifications={notifications}
        onRemove={(id) => removeNotification(id)}
      />

      {/* Thread View */}
      {selectedThread && (
        <ThreadView
          parentMessage={selectedThread}
          replies={selectedThread.replies}
          onSendReply={(content) => addReply(content)}
          onClose={() => setSelectedThread(null)}
        />
      )}
    </div>
  );
};
```

---

## Integration Patterns

### With Firebase

```tsx
import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { EnhancedMessageInput } from '@/components/chat';

export const FirebaseIntegration = ({ roomId }: { roomId: string }) => {
  const handleSend = async (content: string) => {
    await addDoc(collection(db, 'messages'), {
      roomId,
      content,
      createdAt: serverTimestamp(),
      userId: auth.currentUser?.uid,
    });
  };

  return <EnhancedMessageInput onSend={handleSend} />;
};
```

### With Zustand

```tsx
import { create } from 'zustand';
import { ChatNotification } from '@/components/chat';

const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

export const NotificationManager = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <ChatNotificationsContainer
      notifications={notifications}
      onRemove={removeNotification}
    />
  );
};
```

---

## Styling & Theming

All components use CSS custom properties for theming:

```css
:root {
  --theme-accent: #3b82f6;      /* Primary accent color */
  --theme-primary: #1f2937;     /* Primary background */
  --theme-secondary: #374151;   /* Secondary background */
  --theme-text: #ffffff;        /* Text color */
  --theme-text-muted: rgba(255,255,255,0.6);
  --theme-glow: rgba(59, 130, 246, 0.3);
  --theme-border: rgba(255,255,255,0.1);
}
```

### Custom Theme Example

```tsx
export const CustomTheme = () => {
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-accent', '#f97316');
    document.documentElement.style.setProperty('--theme-primary', '#1c1c1c');
  }, []);

  return <ChatHeader room={room} />;
};
```

---

## Best Practices

### 1. Performance Optimization

```tsx
// Memoize components that don't need frequent re-renders
const MemoizedThreadPreview = memo(ThreadPreview);

// Use callbacks for event handlers
const handleAddReaction = useCallback((emoji: string) => {
  addReactionToMessage(messageId, emoji);
}, [messageId]);
```

### 2. Error Handling

```tsx
const SafeEnhancedInput = () => {
  const handleSend = useCallback(async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to send message',
      });
    }
  }, []);

  return <EnhancedMessageInput onSend={handleSend} />;
};
```

### 3. Loading States

```tsx
<ChatStatisticsDisplay
  stats={stats}
  isLoading={isLoading}
/>

<TopContributors
  contributors={contributors}
  isLoading={isLoading}
/>
```

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- **Keyboard Navigation:** All interactive elements are keyboard accessible
- **ARIA Labels:** Components include proper ARIA attributes
- **Color Contrast:** Sufficient contrast ratios for readability
- **Focus Management:** Clear focus indicators on interactive elements

### Example: Accessible Message Input

```tsx
<EnhancedMessageInput
  onSend={handleSend}
  placeholder="Type your message (Enter to send, Shift+Enter for newline)"
  aria-label="Send message to channel"
/>
```

---

## Performance Tips

1. **Virtualization for Long Lists:**
   ```tsx
   import { FixedSizeList } from 'react-window';
   
   <FixedSizeList
     height={600}
     itemCount={messages.length}
     itemSize={80}
   >
     {({ index, style }) => (
       <div style={style}>
         {/* Message render */}
       </div>
     )}
   </FixedSizeList>
   ```

2. **Debounce Search:**
   ```tsx
   const debouncedSearch = useMemo(
     () => debounce((query) => performSearch(query), 300),
     []
   );
   ```

3. **Code Splitting:**
   ```tsx
   const ThreadView = lazy(() => import('./ThreadView'));
   ```

4. **Suspense Boundaries:**
   ```tsx
   <Suspense fallback={<LoadingSpinner />}>
     <ThreadView {...props} />
   </Suspense>
   ```

---

## Troubleshooting

### Components not rendering
- Ensure all required props are provided
- Check TypeScript types match interface definitions
- Verify parent component re-renders aren't causing unmount

### Animation stuttering
- Check Framer Motion version compatibility
- Ensure GPU acceleration is enabled
- Profile with Chrome DevTools Performance tab

### Styling conflicts
- Verify CSS custom properties are defined
- Check for conflicting Tailwind classes
- Ensure GlassCard component is available

---

## Migration Guide

### From Previous Version

All components maintain backward compatibility. Update imports:

```tsx
// Old
import ChatHeader from '@/components/ChatHeader';

// New
import { ChatHeader } from '@/components/chat';
```

---

## Contributing

To add new components:

1. Create component file in `src/components/chat/`
2. Export interfaces in JSDoc comments
3. Add to barrel export `index.ts`
4. Document in this file
5. Ensure TypeScript strict mode compatibility

---

**Last Updated:** 2024
**Maintainer:** MILI Chat Team
**License:** MIT
