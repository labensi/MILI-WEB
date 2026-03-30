import React from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  ExternalLink,
  FileIcon,
  ImageIcon,
  Music,
  Video,
  Code,
  File,
  Lock,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'file';
  url: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: Date;
}

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
}

interface AttachmentGridProps {
  attachments: Attachment[];
  onDownload?: (attachment: Attachment) => void;
  disabled?: boolean;
}

/**
 * AttachmentGrid Component
 * Display and manage file attachments in messages
 * Supports images, videos, audio, and document files
 */
export const AttachmentGrid: React.FC<AttachmentGridProps> = ({
  attachments,
  onDownload,
  disabled = false,
}) => {
  const getFileIcon = (type: Attachment['type']) => {
    const iconProps = { size: 20 };
    switch (type) {
      case 'image':
        return <ImageIcon {...iconProps} />;
      case 'video':
        return <Video {...iconProps} />;
      case 'audio':
        return <Music {...iconProps} />;
      case 'document':
        return <FileIcon {...iconProps} />;
      default:
        return <File {...iconProps} />;
    }
  };

  const formatFileSize = (bytes: number = 0) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (attachments.length === 0) return null;

  // Group attachments by type
  const images = attachments.filter((a) => a.type === 'image');
  const others = attachments.filter((a) => a.type !== 'image');

  return (
    <div className="space-y-3 mt-3">
      {/* Image Grid */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`grid gap-2 ${
            images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          } md:grid-cols-3`}
        >
          {images.map((img, idx) => (
            <motion.a
              key={img.id}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="relative group rounded-lg overflow-hidden cursor-pointer"
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-32 object-cover rounded-lg"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg"
              >
                <ExternalLink size={24} className="text-white" />
              </motion.div>
            </motion.a>
          ))}
        </motion.div>
      )}

      {/* File List */}
      {others.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {others.map((file, idx) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard className="p-3 flex items-center justify-between group hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-white/10 text-[var(--theme-accent)]">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    {file.size && (
                      <p className="text-xs text-white/50">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>
                </div>

                {onDownload && !disabled && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDownload(file)}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title="Download file"
                  >
                    <Download size={18} />
                  </motion.button>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

interface LinkPreviewProps {
  links: LinkPreview[];
  onLinkClick?: (url: string) => void;
}

/**
 * LinkPreviewCard Component
 * Display rich preview of links in messages
 * Shows title, description, and thumbnail
 */
export const LinkPreviewCard: React.FC<LinkPreviewProps> = ({ links, onLinkClick }) => {
  if (links.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      {links.map((link, idx) => (
        <motion.a
          key={idx}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onLinkClick?.(link.url)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ scale: 1.02 }}
          className="block"
        >
          <GlassCard className="p-3 hover:bg-white/15 transition-colors cursor-pointer">
            <div className="flex gap-3">
              {/* Thumbnail */}
              {link.image && (
                <img
                  src={link.image}
                  alt={link.title || 'Link preview'}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                {link.title && (
                  <p className="text-sm font-semibold text-white truncate">
                    {link.title}
                  </p>
                )}
                {link.description && (
                  <p className="text-xs text-white/60 line-clamp-2 mt-1">
                    {link.description}
                  </p>
                )}
                {link.domain && (
                  <p className="text-xs text-[var(--theme-accent)] mt-2 flex items-center gap-1">
                    <ExternalLink size={12} />
                    {link.domain}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.a>
      ))}
    </div>
  );
};

interface CodeBlockProps {
  code: string;
  language: string;
  onCopy?: () => void;
}

/**
 * CodeBlock Component
 * Display formatted code blocks with syntax highlighting
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, onCopy }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mt-3 rounded-lg overflow-hidden bg-black/30 border border-white/10"
    >
      {/* Language Label */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs font-mono text-white/60">{language}</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </motion.button>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto">
        <code className="font-mono text-sm text-white/80 break-words">
          {code}
        </code>
      </pre>
    </motion.div>
  );
};

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

/**
 * EmbedMetadata Component
 * Display rich embed metadata similar to Discord embeds
 */
export const EmbedMetadata: React.FC<EmbedMetadataProps> = ({
  title,
  description,
  thumbnail,
  color = 'var(--theme-accent)',
  fields,
  footer,
  timestamp,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        borderLeft: `4px solid ${color}`,
      }}
      className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 space-y-2"
    >
      {/*Title */}
      {title && <p className="font-semibold text-white text-sm">{title}</p>}

      {/* Thumbnail */}
      {thumbnail && (
        <img
          src={thumbnail}
          alt={title || 'Embed'}
          className="w-full max-h-48 rounded-lg object-cover"
        />
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-white/70">{description}</p>
      )}

      {/* Fields */}
      {fields && fields.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          {fields.map((field, idx) => (
            <div
              key={idx}
              className={field.inline ? 'col-span-1' : 'col-span-2'}
            >
              <p className="text-xs font-semibold text-white/60 uppercase">
                {field.name}
              </p>
              <p className="text-sm text-white/80">{field.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {(footer || timestamp) && (
        <div className="text-xs text-white/50 pt-2 border-t border-white/10">
          {footer && <span>{footer}</span>}
          {footer && timestamp && <span> • </span>}
          {timestamp && (
            <span>
              {new Date(timestamp).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
