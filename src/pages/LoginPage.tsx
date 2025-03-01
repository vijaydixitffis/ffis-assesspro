
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

// Form validation schema for login
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error is already handled in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (type: 'admin' | 'client') => {
    const email = type === 'admin' ? 'admin@ffis.com' : 'client@ffis.com';
    const password = type === 'admin' ? 'admin123' : 'client123';
    
    loginForm.setValue('email', email);
    loginForm.setValue('password', password);
  };

  return (
    <div className="auth-container animate-in">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <img 
            src="/lovable-uploads/74e171ed-dfc9-4ff4-8aae-44113fefa8f9.png" 
            alt="FFIS AssessPro Logo" 
            className="h-auto w-64" 
          />
        </div>
        
        <Card className="auth-card">
          <CardHeader className="auth-card-header">
            <CardTitle className="text-2xl text-center">Welcome to AssessPro</CardTitle>
            <CardDescription className="text-center">Sign in to access your dashboard</CardDescription>
          </CardHeader>
          
          <CardContent className="auth-card-content">
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  {...loginForm.register('email')}
                  className={loginForm.formState.errors.email ? 'border-destructive' : ''}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register('password')}
                  className={loginForm.formState.errors.password ? 'border-destructive' : ''}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-ffis-teal hover:bg-ffis-teal/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Log in
                  </span>
                )}
              </Button>
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => fillDemoAccount('admin')}>
                  Admin Demo
                </Button>
                <Button variant="outline" size="sm" onClick={() => fillDemoAccount('client')}>
                  Client Demo
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="auth-card-footer flex justify-center text-xs text-muted-foreground">
            <p>AssessPro — Secure authentication powered by Supabase</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
