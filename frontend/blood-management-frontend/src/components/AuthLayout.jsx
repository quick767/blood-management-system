import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Heart, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../contexts/ThemeContext';

const AuthLayout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 to-red-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            <Heart className="h-20 w-20 mx-auto mb-8 text-white" />
            <h1 className="text-4xl font-bold mb-4">Blood Management System</h1>
            <p className="text-xl mb-8 text-red-100">
              Connecting donors with those in need
            </p>
            <div className="space-y-4 text-lg text-red-100">
              <div className="flex items-center justify-center space-x-3">
                <Heart className="h-6 w-6" />
                <span>Save lives through blood donation</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Heart className="h-6 w-6" />
                <span>Efficient blood stock management</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Heart className="h-6 w-6" />
                <span>Quick emergency blood requests</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white bg-opacity-10 rounded-full" />
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-white bg-opacity-10 rounded-full" />
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold text-foreground lg:hidden">BloodBank</span>
          </Link>
          
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
        </div>

        {/* Auth content */}
        <div className="mx-auto w-full max-w-sm">
          {children || <Outlet />}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Blood Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

