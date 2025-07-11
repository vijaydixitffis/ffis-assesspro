
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Database, Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';

// Form validation schema for login
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    console.log("Login attempt", { email: data.email });
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      // The navigation to dashboard is now handled in the AuthContext
      console.log("Login successful, AuthContext will handle navigation");
    } catch (error) {
      // Error is already handled in the auth context
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero content */}
        <div className="space-y-8 lg:pr-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AssessPro
              </h1>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Powerful Assessment 
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Management
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg">
              Streamline your assessment process with our comprehensive platform. Create, manage, and evaluate assessments with ease.
            </p>
          </div>
          
          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Secure & Reliable Assessment Platform</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Comprehensive Database Architecture Testing</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Real-time Progress Tracking</span>
            </div>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-2xl border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center font-bold text-gray-900 dark:text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    {...loginForm.register('email')}
                    className={`h-11 ${loginForm.formState.errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...loginForm.register('password')}
                      className={`h-11 pr-10 ${loginForm.formState.errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign in to Dashboard
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
