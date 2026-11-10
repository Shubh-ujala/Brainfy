import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Brain, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ThemeToggle from '@/components/common/ThemeToggle';
import { getErrorMessage } from '@/utils/helpers';
import toast from 'react-hot-toast';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      await register({
        name: form.fullName.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setErrors({ api: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Brain size={16} />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">Brainfy</span>
          </Link>
          <p className="text-sm text-muted-foreground">Create an account to get started</p>
        </div>

        <Card className="border border-border shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Create an Account</CardTitle>
            <CardDescription>Enter your details below to register</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.api && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">
                  {errors.api}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                  className={errors.fullName ? 'border-destructive' : ''}
                  autoComplete="name"
                />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@domain.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  className={errors.email ? 'border-destructive' : ''}
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Create a password (min 6 characters)"
                    value={form.password}
                    onChange={handleChange('password')}
                    className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}

                {form.password && (
                  <div className="space-y-1 pt-1">
                    {PASSWORD_RULES.map(({ label, test }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <CheckCircle2
                          size={12}
                          className={test(form.password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}
                        />
                        <span className={`text-xs ${test(form.password) ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
                {loading ? <><Loader2 size={15} className="animate-spin mr-1.5" /> Creating account…</> : 'Register'}
              </Button>
            </form>

            <div className="mt-5 text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
