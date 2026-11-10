import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Link2, FolderOpen, Heart, Clock, Plus, TrendingUp, ExternalLink, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import linkService from '@/services/linkService';
import collectionService from '@/services/collectionService';
import { timeAgo, getFaviconUrl, detectPlatform, extractList } from '@/utils/helpers';
import { PLATFORM_CONFIG } from '@/utils/constants';
import AddLinkModal from '@/components/links/AddLinkModal';
import DashboardLayout from '@/layouts/DashboardLayout';
import EmptyState from '@/components/common/EmptyState';

const StatCard = ({ icon: Icon, label, value, loading }) => (
  <Card className="border border-border hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group bg-card">
    <CardContent className="p-5 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-bold tracking-tight text-foreground">{value ?? 0}</p>
        )}
      </div>
      <div className="w-10 h-10 rounded-lg border border-border bg-secondary flex items-center justify-center text-foreground group-hover:scale-105 transition-transform duration-200">
        <Icon size={20} />
      </div>
    </CardContent>
  </Card>
);

const DashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLinks, setRecentLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [linksRes, collRes, favRes, recentRes] = await Promise.allSettled([
        linkService.getLinks({ limit: 1 }),
        collectionService.getCollections(),
        linkService.getFavorites(),
        linkService.getRecent(5),
      ]);

      const allLinks = extractList(linksRes.value, 'links');
      const allCols = extractList(collRes.value, 'collections');
      const allFavs = extractList(favRes.value, 'links');
      const recent = extractList(recentRes.value, 'links');

      setStats({
        total: linksRes.value?.data?.pagination?.total ?? linksRes.value?.data?.total ?? allLinks.length,
        collections: allCols.length,
        favorites: allFavs.length,
      });

      setRecentLinks(recent.slice(0, 5));
    } catch {
      // ignore partial error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards = [
    { icon: Link2, label: 'Total Saved Links', value: stats?.total },
    { icon: FolderOpen, label: 'Collections', value: stats?.collections },
    { icon: Heart, label: 'Favorite Links', value: stats?.favorites },
    { icon: Clock, label: 'Recent Activity', value: recentLinks.length },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header greeting */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {user?.fullName?.split(' ')[0] ?? 'there'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Here is an overview of your saved digital bookmarks and collections.
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus size={16} /> Quick Add Link
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} loading={loading} />
          ))}
        </div>

        {/* Recently Added Links Card */}
        <Card className="border border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/50">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp size={16} className="text-foreground" /> Recently Added
              </CardTitle>
              <CardDescription className="text-xs">
                Your latest bookmarked online resources
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/dashboard/recent">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-md shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentLinks.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Link2}
                  title="No links saved yet"
                  description="Use the Quick Add button above to save your first bookmark."
                  action={
                    <Button onClick={() => setAddOpen(true)} size="sm" className="gap-1.5 mt-2">
                      <Plus size={14} /> Add Link
                    </Button>
                  }
                />
              </div>
            ) : (
              recentLinks.map((link) => {
                const platform = detectPlatform(link.url);
                const cfg = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.Website;
                const PlatIcon = cfg?.icon || Globe;
                const favicon = getFaviconUrl(link.url);

                return (
                  <div
                    key={link._id}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-md border border-border bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                        {favicon ? (
                          <img
                            src={favicon}
                            alt=""
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <PlatIcon size={16} className="text-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {link.title || 'Untitled Link'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline" className="hidden sm:inline-flex text-xs font-normal">
                        {platform}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{timeAgo(link.createdAt)}</span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <AddLinkModal open={addOpen} onClose={() => setAddOpen(false)} onSave={fetchData} />
    </DashboardLayout>
  );
};

export default DashboardOverview;
