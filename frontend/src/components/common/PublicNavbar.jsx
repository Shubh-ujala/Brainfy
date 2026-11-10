import { Link, useNavigate } from 'react-router-dom';
import { Brain, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/common/ThemeToggle';

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
            <Brain size={14} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Brainfy
          </span>
        </Link>

        {/* Desktop Navigation & Actions */}
        <div className="hidden sm:flex items-center gap-6">
          <nav className="flex items-center gap-5 text-xs font-medium text-muted-foreground">
            <a href="#preview" className="hover:text-foreground transition-colors">
              Product
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-2 pl-4 border-l border-border">
            <ThemeToggle className="w-8 h-8 rounded-md" />

            {isAuthenticated ? (
              <Button
                onClick={() => navigate('/dashboard')}
                size="sm"
                className="h-8 text-xs font-medium px-3 rounded-md"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-medium px-3 text-muted-foreground hover:text-foreground">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="h-8 text-xs font-medium px-3.5 rounded-md shadow-xs">
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex sm:hidden items-center gap-1.5">
          <ThemeToggle className="w-8 h-8" />
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground"
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-border bg-background px-4 py-3 space-y-2 animate-in fade-in-0 duration-150">
          <a
            href="#preview"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Product
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            How it works
          </a>
          <div className="pt-2 border-t border-border flex items-center gap-2">
            {isAuthenticated ? (
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                size="sm"
                className="w-full text-xs"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm" className="w-1/2 text-xs" onClick={() => setMobileMenuOpen(false)}>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="w-1/2 text-xs font-medium" onClick={() => setMobileMenuOpen(false)}>
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
