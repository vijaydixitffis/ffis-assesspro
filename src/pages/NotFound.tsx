
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <img 
        src="/lovable-uploads/74e171ed-dfc9-4ff4-8aae-44113fefa8f9.png" 
        alt="FFIS AssessPro Logo" 
        className="mb-6 h-16 w-auto" 
      />
      <h1 className="mb-2 text-4xl font-bold">404</h1>
      <h2 className="mb-6 text-xl">Page Not Found</h2>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate('/')} className="bg-ffis-teal hover:bg-ffis-teal/90">
        Return to Login
      </Button>
    </div>
  );
}
