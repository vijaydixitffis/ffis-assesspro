
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [showCredentials, setShowCredentials] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error is already handled in the auth context
    }
  };

  const showDemoCredentials = () => {
    setShowCredentials(!showCredentials);
    if (!showCredentials) {
      toast('Use one of the following demo accounts:', {
        description: 'Admin: admin@ffis.com / admin123\nClient: client@ffis.com / client123',
        duration: 8000
      });
    }
  };

  const fillAdminCredentials = () => {
    const adminForm = document.getElementById('loginForm') as HTMLFormElement;
    if (adminForm) {
      const emailInput = adminForm.elements.namedItem('email') as HTMLInputElement;
      const passwordInput = adminForm.elements.namedItem('password') as HTMLInputElement;
      
      if (emailInput && passwordInput) {
        emailInput.value = 'admin@ffis.com';
        passwordInput.value = 'admin123';
      }
    }
  };

  const fillClientCredentials = () => {
    const clientForm = document.getElementById('loginForm') as HTMLFormElement;
    if (clientForm) {
      const emailInput = clientForm.elements.namedItem('email') as HTMLInputElement;
      const passwordInput = clientForm.elements.namedItem('password') as HTMLInputElement;
      
      if (emailInput && passwordInput) {
        emailInput.value = 'client@ffis.com';
        passwordInput.value = 'client123';
      }
    }
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
            <CardDescription className="text-center">Login to access your dashboard</CardDescription>
          </CardHeader>
          
          <CardContent className="auth-card-content">
            <form id="loginForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-ffis-teal hover:bg-ffis-teal/90" disabled={isLoading}>
                {isLoading ? (
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
            </form>

            {showCredentials && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={fillAdminCredentials}>
                  Admin Demo
                </Button>
                <Button variant="outline" size="sm" onClick={fillClientCredentials}>
                  Client Demo
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="auth-card-footer">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={showDemoCredentials}
            >
              {showCredentials ? 'Hide' : 'Show'} demo credentials
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
