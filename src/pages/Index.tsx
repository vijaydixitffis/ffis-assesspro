
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">AssessPro Dashboard</CardTitle>
            <CardDescription className="text-lg mt-2">
              A comprehensive assessment management system
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 p-6">
            <div className="text-center max-w-xl">
              <p className="text-muted-foreground mb-4">
                Streamline your assessment process with our powerful platform designed for efficient topic and assessment management.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="bg-accent p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">For Administrators</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and manage topics and assessments with an intuitive interface.
                  </p>
                </div>
                <div className="bg-accent p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">For Clients</h3>
                  <p className="text-sm text-muted-foreground">
                    Access assessments and view your progress in a centralized dashboard.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4 p-6">
            {user ? (
              <Button asChild size="lg">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="lg">
                  <Link to="/dashboard">Get Started</Link>
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
