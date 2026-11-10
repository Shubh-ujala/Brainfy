import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Loader2, Edit2 } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import CollectionCard from '@/components/collections/CollectionCard';
import EmptyState from '@/components/common/EmptyState';
import { CollectionCardSkeleton } from '@/components/common/LoadingSkeleton';
import collectionService from '@/services/collectionService';
import { getErrorMessage, extractList } from '@/utils/helpers';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '' };

const CollectionModal = ({ open, onClose, collection, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEdit = !!collection;

  useEffect(() => {
    if (open) {
      setForm(
        collection
          ? {
              name: collection.name ?? '',
              description: collection.description ?? '',
            }
          : EMPTY_FORM
      );
      setErrors({});
    }
  }, [open, collection]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) return setErrors({ name: 'Collection name is required' });
    setLoading(true);
    try {
      if (isEdit) {
        await collectionService.updateCollection(collection._id, form);
        toast.success('Collection updated');
      } else {
        await collectionService.createCollection(form);
        toast.success('Collection created');
      }
      onSave?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <Edit2 size={18} /> : <Plus size={18} />}
            {isEdit ? 'Edit Collection' : 'New Collection'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="c-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="c-name"
              placeholder="e.g. Design Inspiration, Dev Tools, Articles"
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                setErrors({});
              }}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-desc">Description (Optional)</Label>
            <Textarea
              id="c-desc"
              placeholder="What kind of links are kept in this collection?"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 size={14} className="animate-spin mr-1.5" /> Saving…</> : isEdit ? 'Save Changes' : 'Create Collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CollectionsPage = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editColl, setEditColl] = useState(null);
  const [deleteColl, setDeleteColl] = useState(null);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await collectionService.getCollections();
      const data = extractList(res, 'collections');
      setCollections(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleDelete = async () => {
    try {
      await collectionService.deleteCollection(deleteColl._id);
      toast.success('Collection deleted');
      fetchCollections();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteColl(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Collections</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {!loading && `${collections.length} collection${collections.length !== 1 ? 's' : ''} created`}
            </p>
          </div>
          <Button onClick={() => { setEditColl(null); setModalOpen(true); }} className="gap-2">
            <Plus size={16} /> New Collection
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CollectionCardSkeleton key={i} />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No collections yet"
            description="Collections help you organize and group your saved links by project or topic."
            action={
              <Button onClick={() => setModalOpen(true)} className="gap-2">
                <Plus size={15} /> Create your first collection
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((c) => (
              <CollectionCard
                key={c._id}
                collection={c}
                onClick={(coll) => navigate(`/dashboard/links?collection=${coll._id}`)}
                onEdit={(coll) => {
                  setEditColl(coll);
                  setModalOpen(true);
                }}
                onDelete={setDeleteColl}
              />
            ))}
          </div>
        )}
      </div>

      <CollectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        collection={editColl}
        onSave={fetchCollections}
      />

      <AlertDialog open={!!deleteColl} onOpenChange={(v) => !v && setDeleteColl(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong className="text-foreground">{deleteColl?.name}</strong>? Links stored inside this collection will remain safe in your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete Collection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default CollectionsPage;
