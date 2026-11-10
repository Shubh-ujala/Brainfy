import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ThemeToggle from '@/components/common/ThemeToggle';
import authService from '@/services/authService';
import { getErrorMessage } from '@/utils/helpers';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email is required');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Enter a valid email address');

    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
      toast.success('Password reset email sent');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Brain size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Brainfy</span>
          </Link>
          <p className="text-sm text-muted-foreground">Reset your account password</p>
        </div>

        <Card className="border border-border shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            {sent ? (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full border border-border bg-secondary flex items-center justify-center mx-auto text-foreground">
                  <MailCheck size={22} />
                </div>
                <CardTitle className="text-xl">Check your inbox</CardTitle>
                <CardDescription>
                  We sent a reset link to <span className="font-semibold text-foreground">{email}</span>. Check your inbox and spam folder.
                </CardDescription>
              </div>
            ) : (
              <>
                <CardTitle className="text-xl font-bold">Forgot password?</CardTitle>
                <CardDescription>
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </CardDescription>
              </>
            )}
          </CardHeader>

          {!sent && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={error ? 'border-destructive' : ''}
                    autoComplete="email"
                  />
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>

                <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
                  {loading ? <><Loader2 size={15} className="animate-spin mr-1.5" /> Sending…</> : 'Send Reset Link'}
                </Button>
              </form>
            </CardContent>
          )}

          <div className="px-6 pb-6 pt-2">
            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <ArrowLeft size={13} /> Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
