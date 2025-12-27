import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Tag,
  MessageSquare,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  CreditCard,
  Settings,
  Trophy,
  TrendingUp,
  LogOut,
  MousePointerClick,
  ClipboardList
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: TrendingUp, label: 'Analytics', path: '/admin/analytics' },
  { icon: MousePointerClick, label: 'Click Analytics', path: '/admin/click-analytics' },
  { icon: ClipboardList, label: 'Onboarding', path: '/admin/onboarding' },
  { icon: BookOpen, label: 'Community', path: '/admin/community' },

  { icon: Users, label: 'Members', path: '/admin/members' },
  { icon: CreditCard, label: 'Subscriptions', path: '/admin/subscriptions' },
  { icon: Tag, label: 'Promotions', path: '/admin/promotions' },
  { icon: MessageSquare, label: 'Notifications', path: '/admin/notification' },
  { icon: MessageSquare, label: 'Feedback', path: '/admin/feedback' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string; // Added className prop
}

export default function AdminSidebar({ collapsed, onToggle, className }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("ออกจากระบบสำเร็จ");
    navigate('/auth');
  };

  const getInitials = (email?: string) => {
    if (!email) return 'AD';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <aside className={cn(
      "bg-[#0d1117] border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-300 h-screen sticky top-0",
      collapsed ? "w-20" : "w-64",
      className
    )}>
      {/* Admin Profile */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between h-16">
        <div className={cn("flex items-center gap-3 overflow-hidden transition-all", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
          <div className="font-bold text-white text-lg tracking-tight">PromJum Admin</div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-800 text-white shadow-sm border-l-4 border-primary"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User & Logout Section */}
      <div className="p-4 border-t border-slate-800 bg-[#0d1117]">
        {!collapsed && (
          <div className="mb-4 flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 border border-slate-700">
              <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">
                {getInitials(user?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className={cn(
            "w-full gap-3 text-slate-400 hover:text-red-400 hover:bg-red-950/30 justify-start",
            collapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
