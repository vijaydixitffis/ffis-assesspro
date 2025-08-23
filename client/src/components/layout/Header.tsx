
import React from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const navLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Assessments', to: '/assessments' },
  { label: 'Topics', to: '/topics' },
  { label: 'Users', to: '/users' },
  { label: 'Reports', to: '/reports' },
  { label: 'Settings', to: '/settings' },
];

function TechSightLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke="#6366F1" strokeWidth="3" fill="#EEF2FF"/>
      <path d="M12 28C12 22 20 22 20 16" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="13" r="2" fill="#6366F1"/>
      <text x="20" y="36" textAnchor="middle" fontSize="7" fill="#6366F1" fontFamily="Arial" fontWeight="bold">360</text>
    </svg>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  if (location.pathname === '/login') return null;

  // Define role-based menus
  let links: { label: string; to: string }[] = [];
  if (user?.role === 'admin') {
    links = [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Assessments', to: '/assessments' },
      { label: 'Topics', to: '/topics' },
      { label: 'Users', to: '/users' },
      { label: 'Reports', to: '/reports' },
      { label: 'Settings', to: '/settings' },
    ];
  } else if (user?.role === 'client') {
    links = [
      { label: 'My Assessments', to: '/my-assessments' },
      { label: 'Reports', to: '/reports' },
    ];
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-2 min-w-max">
          <TechSightLogo />
          <span className="text-xl font-bold text-primary">TechSight360.ai</span>
        </div>
        {/* Center: Navigation */}
        <nav className="flex-1 flex justify-center gap-2">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        {/* Right: FFIS logo, user info, sign out */}
        <div className="flex items-center gap-4 min-w-max">
          <a
            href="https://www.futurefocusit.solutions"
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => {
              e.preventDefault();
              window.open('https://www.futurefocusit.solutions', '_blank', 'noopener,noreferrer');
            }}
          >
            <img
              src="/lovable-uploads/74e171ed-dfc9-4ff4-8aae-44113fefa8f9.png"
              alt="FFIS Logo"
              className="h-10 w-auto"
              draggable={false}
            />
          </a>
          {user && (
            <>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Welcome, {user.name || user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
