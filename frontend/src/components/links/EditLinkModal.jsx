import { useState, useEffect } from 'react';
import { Loader2, X, Tag, Edit2, Globe } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import linkService from '@/services/linkService';
import collectionService from '@/services/collectionService';
import { getErrorMessage, extractList, detectPlatform } from '@/utils/helpers';
import { PLATFORM_CONFIG } from '@/utils/constants';
import toast from 'react-hot-toast';

const EditLinkModal = ({ open, onClose, link, onSave }) => {
  const [form, setForm] = useState({ title: '', url: '', description: '', collectionId: 'none', tags: [] });
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    if (open && link) {
      setForm({
        title: link.title ?? '',
        url: link.url ?? '',
        description: link.description ?? '',
        collectionId: link.collection?._id ?? link.collectionId ?? 'none',
        tags: Array.isArray(link.tags) ? link.tags : [],
      });
      setErrors({});
      setTagInput('');
      collectionService.getCollections()
        .then(r => setCollections(extractList(r, 'collections')))
        .catch(() => {});
    }
  }, [open, link]);

  const validate = () => {
    const e = {};
    if (!form.url.trim()) {
      e.url = 'URL is required';
    } else {
      try {
        new URL(form.url);
      } catch {
        e.url = 'Enter a valid URL starting with https://';
      }
    }
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      setForm(p => ({ ...p, tags: [...p.tags, t] }));
    }
    setTagInput('');
  };

  const removeTag = (tag) => setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      const col = form.collectionId === 'none' ? null : form.collectionId;
      await linkService.updateLink(link._id, {
        url: form.url.trim(),
        title: form.title.trim() || undefined,
        description: form.description.trim(),
        collection: col,
        collectionId: col,
        tags: form.tags,
      });
      toast.success('Link updated successfully!');
      onSave?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const detectedPlatform = form.url && form.url.includes('.') ? detectPlatform(form.url) : null;
  const platformConfig = detectedPlatform ? (PLATFORM_CONFIG[detectedPlatform] || { icon: Globe }) : null;
  const PlatformIcon = platformConfig?.icon || Globe;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 size={18} className="text-primary" /> Edit Link
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-url">URL <span className="text-destructive">*</span></Label>
              {detectedPlatform && detectedPlatform !== 'Website' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-foreground border border-border animate-in fade-in zoom-in-95 duration-150">
                  <PlatformIcon size={12} className="text-primary" />
                  {detectedPlatform}
                </span>
              )}
            </div>
            <Input
              id="edit-url"
              placeholder="https://..."
              value={form.url}
              onChange={handleChange('url')}
              className={errors.url ? 'border-destructive' : ''}
            />
            {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              placeholder="Enter link title"
              value={form.title}
              onChange={handleChange('title')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              placeholder="Add notes, key takeaways, or context…"
              value={form.description}
              onChange={handleChange('description')}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Collection</Label>
            <Select
              value={form.collectionId}
              onValueChange={v => setForm(p => ({ ...p, collectionId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Unassigned)</SelectItem>
                {collections.map(c => (
                  <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag and press Enter…"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="secondary" size="sm" onClick={addTag} className="shrink-0">
                <Tag size={14} className="mr-1" /> Add
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer pr-1" onClick={() => removeTag(tag)}>
                    {tag} <X size={12} className="hover:text-destructive" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 size={14} className="animate-spin mr-1.5" /> Saving…</> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLinkModal;

