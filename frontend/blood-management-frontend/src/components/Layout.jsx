import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Menu, 
  X, 
  Home, 
  User, 
  Droplets, 
  FileText, 
  BarChart3, 
  Users, 
  Settings,
  Sun,
  Moon,
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin, isDonor } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'About', href: '/about', icon: FileText },
        { name: 'Contact', href: '/contact', icon: User },
        { name: 'FAQ', href: '/faq', icon: FileText },
        { name: 'Eligibility', href: '/eligibility', icon: Heart },
      ];
    }

    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Profile', href: '/dashboard/profile', icon: User },
    ];

    if (isDonor()) {
      baseItems.push(
        { name: 'My Donations', href: '/dashboard/donations', icon: Droplets },
        { name: 'Donate Blood', href: '/dashboard/donate', icon: Heart }
      );
    }

    baseItems.push(
      { name: 'My Requests', href: '/dashboard/requests', icon: FileText },
      { name: 'Request Blood', href: '/dashboard/request', icon: Search }
    );

    if (isAdmin()) {
      baseItems.push(
        { name: 'Admin Panel', href: '/admin', icon: Settings },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Donations', href: '/admin/donations', icon: Droplets },
        { name: 'Requests', href: '/admin/requests', icon: FileText },
        { name: 'Stock', href: '/admin/stock', icon: BarChart3 },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold text-foreground">BloodBank</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info and logout */}
        {isAuthenticated && (
          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="bg-card border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Breadcrumb or page title could go here */}
              <h1 className="ml-4 text-lg font-semibold text-foreground lg:ml-0">
                {location.pathname === '/' ? 'Home' : 
                 location.pathname.split('/').pop()?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Notifications */}
              {isAuthenticated && (
                <Button variant="ghost" size="sm" className="p-2">
                  <Bell className="h-5 w-5" />
                </Button>
              )}

              {/* Auth buttons for non-authenticated users */}
              {!isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link to="/auth/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-card border-t border-border">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Heart className="h-6 w-6 text-red-600" />
                <span className="text-lg font-bold text-foreground">Blood Management System</span>
              </div>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                <p className="text-sm text-muted-foreground">
                  © 2024 Blood Management System. All rights reserved.
                </p>
                <div className="flex space-x-4">
                  <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                  <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                  <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                    FAQ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;

