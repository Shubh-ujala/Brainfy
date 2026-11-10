import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import LinkCard from '@/components/links/LinkCard';
import EditLinkModal from '@/components/links/EditLinkModal';
import DeleteConfirmModal from '@/components/links/DeleteConfirmModal';
import EmptyState from '@/components/common/EmptyState';
import { LinkCardSkeleton } from '@/components/common/LoadingSkeleton';
import linkService from '@/services/linkService';
import { getErrorMessage, extractList } from '@/utils/helpers';
import toast from 'react-hot-toast';

const FavoritesPage = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editLink, setEditLink] = useState(null);
  const [deleteLink, setDeleteLink] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await linkService.getFavorites();
      const data = extractList(res, 'links');
      setLinks(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleDelete = async (link) => {
    try {
      await linkService.deleteLink(link._id);
      toast.success('Link moved to trash');
      fetchFavorites();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Heart size={22} className="text-red-500 fill-current" /> Favorite Links
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {!loading && `${links.length} favorite link${links.length !== 1 ? 's' : ''} pinned`}
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
            icon={Heart}
            title="No favorite links yet"
            description="Click the heart icon on any saved link to pin it to this curated list."
            action={
              <Button asChild variant="outline">
                <Link to="/dashboard/links">Browse your links</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => (
              <LinkCard
                key={link._id}
                link={link}
                onEdit={setEditLink}
                onDelete={setDeleteLink}
                onRefresh={fetchFavorites}
              />
            ))}
          </div>
        )}
      </div>

      <EditLinkModal open={!!editLink} link={editLink} onClose={() => setEditLink(null)} onSave={fetchFavorites} />
      <DeleteConfirmModal
        open={!!deleteLink}
        onClose={() => setDeleteLink(null)}
        onConfirm={() => handleDelete(deleteLink)}
      />
    </DashboardLayout>
  );
};

export default FavoritesPage;
