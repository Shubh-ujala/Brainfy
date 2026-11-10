import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, ArrowRight, Search, Heart,
  Youtube, Github, FileText, Globe, ExternalLink,
  Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PublicLayout from '@/layouts/PublicLayout';

const INITIAL_ITEMS = [
  {
    id: '1',
    title: 'React 19 Server Actions and Concurrent Rendering',
    url: 'https://react.dev/reference/rsc/server-actions',
    domain: 'react.dev',
    platform: 'Documentation',
    collection: 'Frontend',
    icon: Globe,
    isFav: true,
  },
  {
    id: '2',
    title: 'shadcn/ui — Re-usable components built using Radix UI and Tailwind',
    url: 'https://github.com/shadcn-ui/ui',
    domain: 'github.com',
    platform: 'GitHub',
    collection: 'Design Systems',
    icon: Github,
    isFav: true,
  },
  {
    id: '3',
    title: 'Full-Stack Architecture Patterns in Node.js and MongoDB',
    url: 'https://youtube.com/watch?v=fullstack-arch',
    domain: 'youtube.com',
    platform: 'YouTube',
    collection: 'Tutorials',
    icon: Youtube,
    isFav: false,
  },
  {
    id: '4',
    title: 'Designing Accessible Micro-Interactions in Web Applications',
    url: 'https://medium.com/design-systems/micro-interactions',
    domain: 'medium.com',
    platform: 'Article',
    collection: 'Design Systems',
    icon: FileText,
    isFav: false,
  },
];

const FILTERS = ['All', 'Frontend', 'Design Systems', 'Favorites'];

const LandingPage = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const searchInputRef = useRef(null);

  // Focus search input when pressing "/"
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter preview items live
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.collection.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'Favorites') return item.isFav;
      if (activeFilter !== 'All') return item.collection === activeFilter;
      return true;
    });
  }, [items, searchQuery, activeFilter]);

  // Toggle favorite with micro-interaction
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isFav: !it.isFav } : it))
    );
  };

  // Copy link with tactile confirmation
  const handleCopy = (id, url, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <PublicLayout>
      {/* ── 1. Hero ────────────────────────────────────────────── */}
      <section className="pt-24 sm:pt-32 pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-foreground leading-[1.12]">
            All your links, <br />
            organized in one place.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A quiet, distraction-free bookmark manager for resources you save across the web.
            Categorize by topic, search instantly, and never lose what matters.
          </p>

          <div className="flex items-center justify-center gap-3 pt-3">
            <Button
              asChild
              size="default"
              className="h-10 px-5 text-xs font-medium rounded-md shadow-xs active:scale-[0.98] transition-transform"
            >
              <Link to="/register" className="gap-1.5">
                Start using Brainfy <ArrowRight size={13} />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="default"
              className="h-10 px-4 text-xs font-medium rounded-md active:scale-[0.98] transition-transform"
            >
              <Link to="/login">Sign in</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-1">
            Free forever · No credit card required
          </p>
        </div>

        {/* ── 2. Interactive Product Preview ────────────────────── */}
        <div id="preview" className="mt-14 max-w-3xl mx-auto text-left">
          <Card className="border border-border shadow-xs overflow-hidden bg-card transition-all">
            {/* Search command bar */}
            <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Search size={14} className="text-muted-foreground shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Type to filter preview (press '/' to focus)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-1"
                >
                  Clear
                </button>
              ) : (
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-secondary border border-border/60">
                  /
                </span>
              )}
            </div>

            {/* Quick interactive category filters */}
            <div className="px-4 py-2 border-b border-border bg-muted/10 flex items-center gap-1.5 overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all active:scale-95 duration-150 ${
                    activeFilter === f
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Interactive link rows */}
            <div className="divide-y divide-border min-h-[220px]">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">No matching links found.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilter('All');
                    }}
                    className="text-xs text-primary underline underline-offset-4 font-medium"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isCopied = copiedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="group p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded border border-border bg-secondary flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-foreground truncate group-hover:underline underline-offset-2">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {item.domain}
                          </p>
                        </div>
                      </div>

                      {/* Right micro-actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-muted-foreground">
                          {item.collection}
                        </span>

                        {/* Interactive Favorite Pin */}
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(item.id, e)}
                          title={item.isFav ? 'Pinned to favorites' : 'Pin to favorites'}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90"
                        >
                          <Heart
                            size={14}
                            className={`transition-all duration-150 ${
                              item.isFav
                                ? 'text-accent fill-accent scale-105'
                                : 'text-muted-foreground/60 hover:text-muted-foreground'
                            }`}
                          />
                        </button>

                        {/* Interactive Copy Button with checkmark feedback */}
                        <button
                          type="button"
                          onClick={(e) => handleCopy(item.id, item.url, e)}
                          title="Copy link"
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90"
                        >
                          {isCopied ? (
                            <Check size={14} className="text-accent" />
                          ) : (
                            <Copy size={13} className="text-muted-foreground/60 hover:text-muted-foreground" />
                          )}
                        </button>

                        {/* External link */}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-colors"
                          title="Open link"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom info strip */}
            <div className="px-4 py-2 bg-muted/20 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{filteredItems.length} resources shown</span>
              <span className="font-mono text-[10px]">Click heart to test favorite</span>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 3. How It Works ────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 border-t border-border px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-lg border border-border bg-card/60 hover:bg-card hover:border-foreground/25 hover:-translate-y-1 hover:shadow-sm transition-all duration-200 group space-y-2.5">
              <span className="text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">01</span>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Save simply</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Paste any link from YouTube, GitHub, docs, or articles. Brainfy detects the platform and keeps titles clean.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card/60 hover:bg-card hover:border-foreground/25 hover:-translate-y-1 hover:shadow-sm transition-all duration-200 group space-y-2.5">
              <span className="text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">02</span>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Organize freely</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Group bookmarks into collections, pin essential references, and attach tags for multi-dimensional filtering.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card/60 hover:bg-card hover:border-foreground/25 hover:-translate-y-1 hover:shadow-sm transition-all duration-200 group space-y-2.5">
              <span className="text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">03</span>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Find instantly</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Full-text search queries titles, domains, and tags in milliseconds with global keyboard shortcuts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Call to Action ──────────────────────────────────── */}
      <section className="py-20 border-t border-border px-4 sm:px-6 text-center">
        <div className="max-w-xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
            A quieter home for your bookmarks.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Join developers, designers, and writers who keep their digital library organized with Brainfy.
          </p>
          <div className="pt-2">
            <Button asChild size="default" className="h-9 px-5 text-xs font-medium rounded-md active:scale-[0.98] transition-transform">
              <Link to="/register">Create your library</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 5. Minimal Footer ──────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Brain size={12} />
            </div>
            <span className="font-medium text-foreground">Brainfy</span>
          </div>

          <div className="flex items-center gap-5 text-[11px]">
            <Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Get started</Link>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </PublicLayout>
  );
};

export default LandingPage;
