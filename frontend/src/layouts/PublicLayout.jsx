import PublicNavbar from '@/components/common/PublicNavbar';

const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-background text-foreground">
    <PublicNavbar />
    <main>{children}</main>
  </div>
);

export default PublicLayout;

