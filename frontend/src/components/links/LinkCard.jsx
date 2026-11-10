import { useState } from 'react';
import { Heart, Edit2, Trash2, ExternalLink, Tag, FolderOpen, Calendar, Globe, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { detectPlatform, getFaviconUrl, timeAgo } from '@/utils/helpers';
import { PLATFORM_CONFIG } from '@/utils/constants';
import linkService from '@/services/linkService';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const LinkCard = ({ link, onEdit, onDelete, onRefresh }) => {
  const [favoriting, setFavoriting] = useState(false);
  const [isFav, setIsFav] = useState(link.isFavorite ?? link.favorite ?? false);
  const [imgErr, setImgErr] = useState(false);
  const [copied, setCopied] = useState(false);

  const platform = detectPlatform(link.url);
  const cfg = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.Website;
  const PlatIcon = cfg?.icon || Globe;
  const favicon = getFaviconUrl(link.url);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoriting(true);
    const prev = isFav;
    setIsFav(!prev);
    try {
      await linkService.toggleFavorite(link._id);
      toast.success(prev ? 'Removed from favorites' : 'Added to favorites');
      onRefresh?.();
    } catch {
      setIsFav(prev);
      toast.error('Failed to update favorite');
    } finally {
      setFavoriting(false);
    }
  };

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(link.url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <TooltipProvider>
      <Card className="hover:border-foreground/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between group bg-card">
        <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
          <div>
            {/* Header: Icon, Title, Link, Favorite button */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg border border-border bg-secondary flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-200 group-hover:scale-105">
                {!imgErr && favicon ? (
                  <img
                    src={favicon}
                    alt=""
                    className="w-5 h-5 object-contain"
                    onError={() => setImgErr(true)}
                  />
                ) : (
                  <PlatIcon size={18} className="text-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                  {link.title || 'Untitled Link'}
                </h3>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground truncate block transition-colors mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {link.url}
                </a>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'w-8 h-8 shrink-0 transition-all duration-150 active:scale-75',
                      isFav
                        ? 'text-rose-500 hover:text-rose-600'
                        : 'text-muted-foreground opacity-60 sm:opacity-0 group-hover:opacity-100 hover:text-foreground'
                    )}
                    onClick={handleFavorite}
                    disabled={favoriting}
                  >
                    <Heart size={16} className={cn('transition-all duration-150', isFav ? 'fill-current scale-110' : '')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFav ? 'Remove from favorites' : 'Add to favorites'}</TooltipContent>
              </Tooltip>
            </div>

            {/* Description */}
            {link.description && (
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">
                {link.description}
              </p>
            )}

            {/* Tags & Platform Badge */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <Badge variant="outline" className="text-[11px] font-medium py-0 h-5 transition-colors group-hover:border-foreground/30">
                {platform}
              </Badge>
              {link.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[11px] font-normal py-0 h-5 gap-1 hover:bg-secondary/80 transition-colors">
                  <Tag size={9} className="opacity-70" />
                  {tag}
                </Badge>
              ))}
              {link.tags?.length > 3 && (
                <Badge variant="secondary" className="text-[11px] font-normal py-0 h-5">
                  +{link.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Footer: Metadata & Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {link.collection?.name && (
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <FolderOpen size={12} className="text-muted-foreground" />
                  {link.collection.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {timeAgo(link.createdAt)}
              </span>
            </div>

            {/* Action buttons with tactile micro-interactions */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check size={14} className="text-emerald-500 scale-110 transition-transform" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? 'Copied!' : 'Copy link URL'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground active:scale-90 transition-transform">
                      <ExternalLink size={14} />
                    </Button>
                  </a>
                </TooltipTrigger>
                <TooltipContent>Open link</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
                    onClick={(e) => { e.stopPropagation(); onEdit?.(link); }}
                  >
                    <Edit2 size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-destructive active:scale-90 transition-transform"
                    onClick={(e) => { e.stopPropagation(); onDelete?.(link); }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default LinkCard;
