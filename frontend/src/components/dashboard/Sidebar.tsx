import { 
  Home, 
  FileText, 
  Globe, 
  MessageSquare, 
  History, 
  Settings, 
  Building2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  LogOut
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  
  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Building2, label: 'Companies', path: '/dashboard/companies' },
    { icon: FileText, label: 'Upload PDF', path: '/dashboard/upload' },
    { icon: Globe, label: 'Add URL', path: '/dashboard/urls' },
    { icon: MessageSquare, label: 'Ask Questions', path: '/dashboard/chat' },
    { icon: History, label: 'History', path: '/dashboard/history' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={cn(
      "h-screen bg-accent border-r border-border transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-accent-foreground">FinanceRAG</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-accent-foreground hover:bg-accent-light p-2"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              isActiveRoute(item.path)
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-accent-foreground hover:bg-accent-light hover:text-accent-foreground"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 flex-shrink-0",
              isActiveRoute(item.path) ? "text-primary-foreground" : "text-accent-foreground"
            )} />
            {!collapsed && (
              <span className="font-medium truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border/50">
        <div className={cn(
          "flex items-center space-x-3",
          collapsed ? "justify-center" : ""
        )}>
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">U</span>
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-accent-foreground">Demo User</p>
              <p className="text-xs text-muted-foreground">demo@financerag.com</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-accent-foreground hover:bg-accent-light justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;