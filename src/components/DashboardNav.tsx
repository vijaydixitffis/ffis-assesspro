
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  ClipboardList,
  BarChart2,
  CircleUser,
  HelpCircle,
  Home,
  LogOut,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardNav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: location.pathname === "/dashboard",
    },
    {
      label: "Assessments",
      icon: ClipboardList,
      href: "/admin/assessments",
      active: location.pathname === "/admin/assessments",
      adminOnly: true,
    },
    {
      label: "Topics",
      icon: BookOpen,
      href: "/admin/topics",
      active: location.pathname === "/admin/topics",
      adminOnly: true,
    },
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
      active: location.pathname === "/admin/users",
      adminOnly: true,
    },
    {
      label: "Reports",
      icon: BarChart2,
      href: "/reports",
      active: location.pathname === "/reports",
    },
    {
      label: "Help",
      icon: HelpCircle,
      href: "/help",
      active: location.pathname === "/help",
    },
  ];

  return (
    <div className="h-full flex-col bg-muted/40 md:flex md:w-64 md:border-r">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <Link
            to="/dashboard"
            className="mb-6 flex h-16 items-center rounded-md px-4 text-primary"
          >
            <div className="flex items-center">
              <img
                src="/lovable-uploads/74e171ed-dfc9-4ff4-8aae-44113fefa8f9.png"
                alt="Future Focus IT Solutions Logo"
                className="h-16 w-auto" // Increased from h-12 to h-16
              />
            </div>
          </Link>
          
          <div className="space-y-1">
            {routes.map((route) =>
              route.adminOnly && user?.role !== "admin" ? null : (
                <Link
                  to={route.href}
                  key={route.label}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    route.active
                      ? "bg-accent text-accent-foreground"
                      : "transparent"
                  )}
                >
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              )
            )}
          </div>
        </div>
        <Separator />
        {user && (
          <div className="px-3 py-2">
            <div className="mb-2 flex items-center rounded-md px-3 py-2">
              <CircleUser className="mr-2 h-4 w-4" />
              <span className="text-sm">{user.firstName} {user.lastName}</span>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
