import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Loader2, AlertTriangle, Globe } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import EmptyState from '@/components/common/EmptyState';
import { LinkCardSkeleton } from '@/components/common/LoadingSkeleton';
import linkService from '@/services/linkService';
import { detectPlatform, timeAgo, getErrorMessage, extractList } from '@/utils/helpers';
import { PLATFORM_CONFIG } from '@/utils/constants';
import toast from 'react-hot-toast';

const TrashPage = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permDelete, setPermDelete] = useState(null);
  const [restoring, setRestoring] = useState({});

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await linkService.getTrashed();
      const data = extractList(res, 'links');
      setLinks(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (link) => {
    setRestoring((p) => ({ ...p, [link._id]: true }));
    try {
      await linkService.restoreLink(link._id);
      toast.success('Link restored to library');
      fetchTrash();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRestoring((p) => ({ ...p, [link._id]: false }));
    }
  };

  const handlePermanentDelete = async () => {
    try {
      await linkService.permanentDelete(permDelete._id);
      toast.success('Link permanently deleted');
      setPermDelete(null);
      fetchTrash();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Trash2 size={22} className="text-muted-foreground" /> Trash
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Recover soft-deleted links or permanently delete them
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <LinkCardSkeleton key={i} />
            ))}
          </div>
        ) : links.length === 0 ? (
          <EmptyState
            icon={Trash2}
            title="Trash is empty"
            description="Links you delete will be kept here until permanently removed."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => {
              const platform = detectPlatform(link.url);
              const cfg = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.Website;
              const PlatIcon = cfg?.icon || Globe;

              return (
                <Card
                  key={link._id}
                  className="border border-border bg-card flex flex-col justify-between"
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg border border-border bg-secondary flex items-center justify-center shrink-0">
                          <PlatIcon size={18} className="text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {link.title ?? 'Untitled Link'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        Deleted {timeAgo(link.deletedAt ?? link.updatedAt)}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1"
                          disabled={restoring[link._id]}
                          onClick={() => handleRestore(link)}
                        >
                          {restoring[link._id] ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <RotateCcw size={12} />
                          )}
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs gap-1"
                          onClick={() => setPermDelete(link)}
                        >
                          <Trash2 size={12} /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!permDelete} onOpenChange={(v) => !v && setPermDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={18} /> Permanently delete link?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{' '}
              <strong className="text-foreground">{permDelete?.title || permDelete?.url}</strong>? This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default TrashPage;
