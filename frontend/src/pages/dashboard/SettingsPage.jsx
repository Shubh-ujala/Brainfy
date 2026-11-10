import { useState } from 'react';
import { User, Lock, LogOut, Loader2, Eye, EyeOff } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import userService from '@/services/userService';
import { getErrorMessage } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName ?? '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passErrors, setPassErrors] = useState({});
  const [passLoading, setPassLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) return toast.error('Full name cannot be empty');
    setProfileLoading(true);
    try {
      const res = await userService.updateProfile({ fullName: profileForm.fullName });
      const updated = res.data?.user ?? res.data?.data ?? { fullName: profileForm.fullName };
      updateUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  };

  const validatePass = () => {
    const e = {};
    if (!passForm.currentPassword) e.currentPassword = 'Current password is required';
    if (!passForm.newPassword) e.newPassword = 'New password is required';
    else if (passForm.newPassword.length < 8) e.newPassword = 'Must be at least 8 characters';
    if (passForm.newPassword !== passForm.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = validatePass();
    if (Object.keys(errs).length) return setPassErrors(errs);
    setPassLoading(true);
    try {
      await userService.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Password changed');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPassErrors({});
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your account profile and security credentials</p>
        </div>

        {/* Profile Card */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User size={18} /> Profile Information
            </CardTitle>
            <CardDescription>Update your display name and view account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-14 h-14 border border-border">
                <AvatarFallback className="text-base bg-secondary text-foreground font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground text-base">{user?.fullName || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="s-fullname">Full Name</Label>
                <Input
                  id="s-fullname"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ fullName: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="s-email">Email Address</Label>
                <Input id="s-email" value={user?.email ?? ''} disabled className="opacity-70 cursor-not-allowed bg-muted/50" />
                <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
              </div>

              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? <><Loader2 size={14} className="animate-spin mr-1.5" /> Saving…</> : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Lock size={18} /> Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cur-pass">Current Password</Label>
                <div className="relative">
                  <Input
                    id="cur-pass"
                    type={showPass ? 'text' : 'password'}
                    value={passForm.currentPassword}
                    onChange={(e) => {
                      setPassForm((p) => ({ ...p, currentPassword: e.target.value }));
                      setPassErrors((p) => ({ ...p, currentPassword: '' }));
                    }}
                    className={`pr-10 ${passErrors.currentPassword ? 'border-destructive' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {passErrors.currentPassword && <p className="text-xs text-destructive">{passErrors.currentPassword}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-pass">New Password</Label>
                <Input
                  id="new-pass"
                  type={showPass ? 'text' : 'password'}
                  value={passForm.newPassword}
                  onChange={(e) => {
                    setPassForm((p) => ({ ...p, newPassword: e.target.value }));
                    setPassErrors((p) => ({ ...p, newPassword: '' }));
                  }}
                  className={passErrors.newPassword ? 'border-destructive' : ''}
                  placeholder="••••••••"
                />
                {passErrors.newPassword && <p className="text-xs text-destructive">{passErrors.newPassword}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="conf-pass">Confirm New Password</Label>
                <Input
                  id="conf-pass"
                  type={showPass ? 'text' : 'password'}
                  value={passForm.confirmPassword}
                  onChange={(e) => {
                    setPassForm((p) => ({ ...p, confirmPassword: e.target.value }));
                    setPassErrors((p) => ({ ...p, confirmPassword: '' }));
                  }}
                  className={passErrors.confirmPassword ? 'border-destructive' : ''}
                  placeholder="••••••••"
                />
                {passErrors.confirmPassword && <p className="text-xs text-destructive">{passErrors.confirmPassword}</p>}
              </div>

              <Button type="submit" disabled={passLoading}>
                {passLoading ? <><Loader2 size={14} className="animate-spin mr-1.5" /> Updating…</> : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Session */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Account Session</CardTitle>
            <CardDescription>Sign out of your account on this device</CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <Button variant="destructive" onClick={handleLogout} className="gap-2">
              <LogOut size={16} /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
