
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-4 px-6 border-t bg-background/95 backdrop-blur-sm mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          &copy; {currentYear} Future Focus IT Solutions. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Help Center
          </a>
        </div>
      </div>
    </footer>
  );
}
