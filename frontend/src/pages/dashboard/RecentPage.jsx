import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import LinkCard from '@/components/links/LinkCard';
import EditLinkModal from '@/components/links/EditLinkModal';
import DeleteConfirmModal from '@/components/links/DeleteConfirmModal';
import EmptyState from '@/components/common/EmptyState';
import { LinkCardSkeleton } from '@/components/common/LoadingSkeleton';
import linkService from '@/services/linkService';
import { getErrorMessage, extractList } from '@/utils/helpers';
import toast from 'react-hot-toast';

const RecentPage = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editLink, setEditLink] = useState(null);
  const [deleteLink, setDeleteLink] = useState(null);

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const res = await linkService.getRecent(30);
      const data = extractList(res, 'links');
      setLinks(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleDelete = async (link) => {
    try {
      await linkService.deleteLink(link._id);
      toast.success('Link moved to trash');
      fetchRecent();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Clock size={22} className="text-foreground" /> Recently Added
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your most recently bookmarked online resources in chronological order
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <LinkCardSkeleton key={i} />
            ))}
          </div>
        ) : links.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No recent links"
            description="Bookmarks you save will automatically be listed here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => (
              <LinkCard
                key={link._id}
                link={link}
                onEdit={setEditLink}
                onDelete={setDeleteLink}
                onRefresh={fetchRecent}
              />
            ))}
          </div>
        )}
      </div>

      <EditLinkModal open={!!editLink} link={editLink} onClose={() => setEditLink(null)} onSave={fetchRecent} />
      <DeleteConfirmModal
        open={!!deleteLink}
        onClose={() => setDeleteLink(null)}
        onConfirm={() => handleDelete(deleteLink)}
      />
    </DashboardLayout>
  );
};

export default RecentPage;
