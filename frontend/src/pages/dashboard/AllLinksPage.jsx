import { useState, useEffect, useCallback } from 'react';
import { Plus, Link2 } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LinkCard from '@/components/links/LinkCard';
import AddLinkModal from '@/components/links/AddLinkModal';
import EditLinkModal from '@/components/links/EditLinkModal';
import DeleteConfirmModal from '@/components/links/DeleteConfirmModal';
import SearchBar from '@/components/common/SearchBar';
import EmptyState from '@/components/common/EmptyState';
import { LinkCardSkeleton } from '@/components/common/LoadingSkeleton';
import linkService from '@/services/linkService';
import collectionService from '@/services/collectionService';
import { getErrorMessage, extractList } from '@/utils/helpers';
import { PLATFORM_OPTIONS, SORT_OPTIONS } from '@/utils/constants';
import toast from 'react-hot-toast';

const AllLinksPage = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [sort, setSort] = useState('newest');
  const [collection, setCollection] = useState('all');
  const [collections, setCollections] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editLink, setEditLink] = useState(null);
  const [deleteLink, setDeleteLink] = useState(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (platform && platform !== 'all') params.platform = platform;
      if (sort) params.sort = sort;
      if (collection && collection !== 'all') params.collection = collection;

      const res = await linkService.getLinks(params);
      const data = extractList(res, 'links');
      setLinks(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, platform, sort, collection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLinks();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLinks]);

  useEffect(() => {
    collectionService
      .getCollections()
      .then((r) => setCollections(extractList(r, 'collections')))
      .catch(() => {});
  }, []);

  const handleDelete = async (link) => {
    try {
      await linkService.deleteLink(link._id);
      toast.success('Link moved to trash');
      fetchLinks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">All Saved Links</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {!loading && `${links.length} link${links.length !== 1 ? 's' : ''} in library`}
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus size={16} /> Add Link
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search links by title, URL, tags…"
            className="flex-1 min-w-[220px]"
          />

          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {PLATFORM_OPTIONS.filter((o) => o.value).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={collection} onValueChange={setCollection}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              {collections.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Link Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <LinkCardSkeleton key={i} />
            ))}
          </div>
        ) : links.length === 0 ? (
          <EmptyState
            icon={Link2}
            title={search ? 'No links found matching your criteria' : 'No links saved yet'}
            description={
              search
                ? 'Try refining your search terms or clearing selected filters.'
                : 'Save bookmarks, articles, repositories, and videos to start building your library.'
            }
            action={
              !search ? (
                <Button onClick={() => setAddOpen(true)} className="gap-2">
                  <Plus size={15} /> Save your first link
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setPlatform('all');
                    setCollection('all');
                  }}
                >
                  Reset filters
                </Button>
              )
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
                onRefresh={fetchLinks}
              />
            ))}
          </div>
        )}
      </div>

      <AddLinkModal open={addOpen} onClose={() => setAddOpen(false)} onSave={fetchLinks} />
      <EditLinkModal open={!!editLink} link={editLink} onClose={() => setEditLink(null)} onSave={fetchLinks} />
      <DeleteConfirmModal
        open={!!deleteLink}
        onClose={() => setDeleteLink(null)}
        onConfirm={() => handleDelete(deleteLink)}
      />
    </DashboardLayout>
  );
};

export default AllLinksPage;
