import { Moon, Sun, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const TopBar = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // Initialize dark mode from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="w-9 h-9 p-0"
        >
          {darkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
        
        <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
          <Bell className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center space-x-2 ml-4">
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">Demo User</p>
            <p className="text-xs text-muted-foreground">demo@financerag.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;