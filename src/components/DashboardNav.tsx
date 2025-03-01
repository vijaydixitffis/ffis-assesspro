
import { useAuth } from "@/contexts/AuthContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DashboardNav() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`h-screen bg-sidebar-background border-r flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b flex justify-between items-center">
        {!collapsed && <h2 className="font-semibold">AssessPro</h2>}
        <button 
          onClick={toggleSidebar} 
          className="p-1 rounded-md hover:bg-accent"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <div className="py-4 flex-1">
        <NavigationMenu className="w-full" orientation="vertical">
          <NavigationMenuList className="flex flex-col space-y-1 w-full p-2">
            <NavigationMenuItem className="w-full">
              <Link to="/dashboard" className="w-full">
                <NavigationMenuLink className={`flex items-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground ${collapsed ? 'justify-center' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {!collapsed && <span className="ml-2">Dashboard</span>}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {user?.role === "admin" && (
              <>
                <NavigationMenuItem className="w-full">
                  <Link to="/admin/topics" className="w-full">
                    <NavigationMenuLink className={`flex items-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground ${collapsed ? 'justify-center' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {!collapsed && <span className="ml-2">Topic Mgmt.</span>}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem className="w-full">
                  <Link to="/admin/assessments" className="w-full">
                    <NavigationMenuLink className={`flex items-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground ${collapsed ? 'justify-center' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {!collapsed && <span className="ml-2">Assessment Mgmt.</span>}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
