import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';

const DeleteConfirmModal = ({ open, onClose, onConfirm, title = 'Delete this link?', description = 'This link will be moved to Trash. You can restore it later if needed.' }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await onConfirm?.();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={v => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 size={18} /> {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={loading} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            {loading ? <><Loader2 size={13} className="animate-spin mr-1" /> Deleting…</> : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmModal;

