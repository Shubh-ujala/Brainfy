import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Brain, LayoutDashboard, Link2, FolderOpen, Heart,
  Clock, Trash2, Settings, LogOut, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import ThemeToggle from '@/components/common/ThemeToggle';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'All Links', icon: Link2, path: '/dashboard/links' },
  { label: 'Collections', icon: FolderOpen, path: '/dashboard/collections' },
  { label: 'Favorites', icon: Heart, path: '/dashboard/favorites' },
  { label: 'Recently Added', icon: Clock, path: '/dashboard/recent' },
  { label: 'Trash', icon: Trash2, path: '/dashboard/trash' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed');
    }
  };

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(path);

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto'
        )}
      >
        {/* Logo header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Brain size={14} />
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">Brainfy</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle className="w-8 h-8" />
            <Button variant="ghost" size="icon" className="lg:hidden w-8 h-8 text-muted-foreground" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Navigation list */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={cn('nav-link', isActive(path) && 'active')}
              >
                <Icon size={16} />
                <span className="flex-1 font-medium">{label}</span>
                {isActive(path) && <ChevronRight size={14} className="opacity-60 text-foreground" />}
              </Link>
            ))}

            <Separator className="my-3 bg-border" />

            <Link
              to="/dashboard/settings"
              onClick={onClose}
              className={cn('nav-link', isActive('/dashboard/settings') && 'active')}
            >
              <Settings size={16} />
              <span className="flex-1 font-medium">Settings</span>
              {isActive('/dashboard/settings') && <ChevronRight size={14} className="opacity-60 text-foreground" />}
            </Link>

            <button
              onClick={handleLogout}
              className="nav-link w-full text-left text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut size={16} />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </ScrollArea>

        {/* User profile footer */}
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 border border-border">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {user?.fullName ?? 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? ''}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
