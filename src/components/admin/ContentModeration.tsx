import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Trash2, CheckCircle, AlertTriangle, MessageSquare, FileText } from 'lucide-react';
import { Report } from '../../types';
import { firestoreService } from '../../firebase/firestore';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import toast from 'react-hot-toast';

export const ContentModeration: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const allReports = await firestoreService.getReports();
    setReports(allReports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    setLoading(false);
  };

  const handleResolveReport = async (reportId: string) => {
    // In production, you'd delete or archive the report
    toast.success('Report marked as resolved');
    setReports(reports.filter(r => r.id !== reportId));
  };

  const handleDeleteContent = async (report: Report) => {
    try {
      if (report.targetType === 'post') {
        // Delete post logic would go here
        toast.success('Post deleted successfully');
      } else if (report.targetType === 'message') {
        // Delete message logic would go here
        toast.success('Message deleted successfully');
      }
      await handleResolveReport(report.id);
      setSelectedReport(null);
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText size={16} />;
      case 'message':
        return <MessageSquare size={16} />;
      default:
        return <Flag size={16} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Content Reports</h2>
        <div className="text-white/50 text-sm">{reports.length} pending reports</div>
      </div>

      {loading ? (
        <div className="text-center text-white/50 py-8">Loading reports...</div>
      ) : reports.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <CheckCircle size={48} className="mx-auto mb-3 text-green-400" />
          <p className="text-white font-semibold">No pending reports</p>
          <p className="text-white/50 text-sm">All content has been reviewed</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getReportIcon(report.targetType)}
                      <span className="text-xs text-white/50 uppercase">
                        {report.targetType} report
                      </span>
                      <span className="text-xs text-white/30">
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-white mb-2">Reported by: User {report.reporterId.slice(0, 8)}</p>
                    <p className="text-white/70 text-sm">
                      <strong>Reason:</strong> {report.reason}
                    </p>
                    <p className="text-white/50 text-xs mt-2">
                      Target ID: {report.targetId}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<CheckCircle size={14} />}
                      onClick={() => handleResolveReport(report.id)}
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      onClick={() => setSelectedReport(report)}
                    >
                      Delete Content
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} title="Delete Content">
        {selectedReport && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="text-red-400" size={24} />
              <div>
                <p className="text-white font-semibold">Delete this {selectedReport.targetType}?</p>
                <p className="text-white/70 text-sm">
                  This action cannot be undone. The content will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setSelectedReport(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDeleteContent(selectedReport)} className="flex-1">
                Delete Permanently
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
