import { FolderOpen, Edit2, Trash2, Link2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const CollectionCard = ({ collection, onEdit, onDelete, onClick }) => {
  return (
    <TooltipProvider>
      <Card
        className="hover:border-foreground/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200 group cursor-pointer bg-card flex flex-col justify-between"
        onClick={() => onClick?.(collection)}
      >
        <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
          <div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg border border-border bg-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                <FolderOpen size={18} className="text-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{collection.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Link2 size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {collection.linkCount ?? collection.links?.length ?? 0} links
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
                      onClick={(e) => { e.stopPropagation(); onEdit?.(collection); }}
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
                      onClick={(e) => { e.stopPropagation(); onDelete?.(collection); }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {collection.description && (
              <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <Badge variant="outline" className="text-xs font-normal">
              Collection
            </Badge>
            <ChevronRight size={15} className="text-muted-foreground group-hover:translate-x-1.5 group-hover:text-foreground transition-all duration-200" />
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default CollectionCard;
