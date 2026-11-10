import { useState, useEffect } from 'react';
import { Loader2, Plus, X, Tag, Globe } from 'lucide-react';
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

const EMPTY = { title: '', url: '', description: '', collectionId: 'none', tags: [] };

const AddLinkModal = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
      setTagInput('');
      collectionService.getCollections()
        .then(r => setCollections(extractList(r, 'collections')))
        .catch(() => {});
    }
  }, [open]);

  const validate = () => {
    const e = {};
    if (!form.url.trim()) {
      e.url = 'URL is required';
    } else {
      try {
        new URL(form.url);
      } catch {
        e.url = 'Enter a valid URL (e.g. https://example.com)';
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
      await linkService.createLink({
        url: form.url.trim(),
        title: form.title.trim() || undefined,
        description: form.description.trim(),
        collection: col,
        collectionId: col,
        tags: form.tags,
      });
      toast.success('Link saved successfully!');
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
            <Plus size={18} className="text-primary" /> Add New Link
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* URL with Live Platform Detection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="url">URL <span className="text-destructive">*</span></Label>
              {detectedPlatform && detectedPlatform !== 'Website' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-foreground border border-border animate-in fade-in zoom-in-95 duration-150">
                  <PlatformIcon size={12} className="text-primary" />
                  {detectedPlatform}
                </span>
              )}
            </div>
            <Input
              id="url"
              placeholder="https://example.com"
              value={form.url}
              onChange={handleChange('url')}
              className={errors.url ? 'border-destructive' : ''}
            />
            {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. React 19 Documentation"
              value={form.title}
              onChange={handleChange('title')}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief summary or notes about this link…"
              value={form.description}
              onChange={handleChange('description')}
              rows={2}
            />
          </div>

          {/* Collection */}
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

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag and press Enter…"
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
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 size={14} className="animate-spin mr-1.5" /> Saving…</> : 'Save Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLinkModal;

