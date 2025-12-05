import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Tag,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: BookOpen, label: 'Deck/Subdeck', path: '/admin/decks' },
  { icon: Users, label: 'Members', path: '/admin/members' },
  { icon: Tag, label: 'Promotion', path: '/admin/promotions' },
  { icon: MessageSquare, label: 'Notification', path: '/admin/notification' },
  { icon: MessageSquare, label: 'Feedback', path: '/admin/feedback' },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleLogout = async () => {
    await signOut();
    // Always show success and redirect regardless of error
    // "Session not found" error means user is already logged out, which is the desired state
    toast({
      title: "ออกจากระบบสำเร็จ",
    });
    navigate('/auth');
  };

  const getInitials = (email?: string) => {
    if (!email) return 'AD';
    return email.substring(0, 2).toUpperCase();
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <aside className={cn(
      "bg-card border-r border-border min-h-screen flex flex-col transition-all duration-300 relative",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Admin Profile */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 bg-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(user?.email)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 hover:bg-accent shrink-0"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground group",
                    collapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed ? "justify-center px-3" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="font-medium">ออกจากระบบ</span>}
        </Button>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Admin Dashboard v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
