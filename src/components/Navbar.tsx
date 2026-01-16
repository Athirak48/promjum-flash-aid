import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, CreditCard, Star, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import promjumLogo from "@/assets/promjum-logo.png";
import { NotificationHub } from "./notifications/NotificationHub";
import { useAnalytics } from "@/hooks/useAnalytics";
import { FriendRequestsPopover } from "./friends/FriendRequestsPopover";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { trackButtonClick } = useAnalytics();

  const isActive = (path: string) => location.pathname === path;

  // Get user profile data from user metadata or default values
  const userProfile = user ? {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || null,
    role: user.app_metadata?.role || 'user'
  } : null;

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "ออกจากระบบไม่สำเร็จ",
        description: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } else {
      toast({
        title: "ออกจากระบบสำเร็จ",
        description: "แล้วพบกันใหม่",
      });
    }
  };

  const publicNavItems = [
    { href: "/", label: t('nav.home') },
    { href: "/#features", label: t('nav.features') },
    { href: "/#pricing", label: t('nav.pricing') },
    { href: "/#about", label: t('nav.about') },
  ];

  const userNavItems = [
    { href: "/dashboard", label: "หน้าหลัก" },
    { href: "/flashcards", label: "คลังศัพท์" }, // Moved here
    { href: "/classroom", label: "ลอบบี้" },
    { href: "/decks", label: "ชุมชน" },
    { href: "/feedback", label: "ข้อเสนอแนะ" },
  ];

  const adminNavItems = [
    { href: "/admin", label: "แอดมิน" },
    { href: "/admin/uploads", label: "จัดการไฟล์" },
    { href: "/admin/pricing", label: "จัดการราคา" },
    { href: "/admin/stats", label: "สถิติ" },
  ];

  const navItems = userProfile?.role === "admin" ? adminNavItems : userProfile ? userNavItems : publicNavItems;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-md supports-[backdrop-filter]:bg-black/20">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0 group">
            <div className="p-1.5 bg-white/95 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-md border border-white/50 group-hover:bg-white transition-all">
              <img
                src={promjumLogo}
                alt="Promjum Logo"
                className="h-8 w-8 lg:h-10 lg:w-10 object-contain"
              />
            </div>
            {/* BETA Badge - Right beside logo */}
            <span className="px-2 py-0.5 text-[9px] lg:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-md shadow-[0_0_12px_rgba(245,158,11,0.6)] border border-amber-300/50 animate-pulse">
              BETA
            </span>
            <span className="text-lg lg:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent drop-shadow-sm group-hover:drop-shadow-md transition-all">
              Promjum
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => trackButtonClick(item.label, 'navbar')}
                className={`text-xs xl:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap px-2 py-1 rounded-md hover:bg-muted ${isActive(item.href) ? "text-primary bg-primary/10" : "text-muted-foreground"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center space-x-1">
            {userProfile ? (
              <>
                <FriendRequestsPopover />
                <NotificationHub />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={userProfile.full_name || userProfile.email} />
                        <AvatarFallback>
                          {userProfile.full_name?.charAt(0) || userProfile.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white border-slate-200 shadow-lg" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-slate-900">{userProfile.full_name || userProfile.email}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">{userProfile.email}</span>
                          {userProfile.role === "admin" && (
                            <Star className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-slate-200" />
                    <DropdownMenuItem asChild className="text-slate-700 hover:bg-slate-100 focus:bg-slate-100">
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4 text-slate-500" />
                        {t('nav.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-slate-700 hover:bg-slate-100 focus:bg-slate-100">
                      <Link to="/checkout" className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4 text-slate-500" />
                        ชำระเงิน
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-slate-700 hover:bg-slate-100 focus:bg-slate-100">
                      <LogOut className="mr-2 h-4 w-4 text-slate-500" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">{t('nav.login')}</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/auth">{t('nav.signup')}</Link>
                </Button>
              </div>
            )}

            {/* Theme and Language toggles */}
            <div className="flex items-center space-x-1 ml-2">
              <ThemeToggle className="text-white/90 hover:text-white hover:bg-white/10" />
              <LanguageToggle className="text-white/90 hover:text-white hover:bg-white/10" />
            </div>
          </div>

          {/* Mobile menu button + all icons in one row */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Profile - only when logged in */}
            {userProfile && (
              <Link to="/profile" className="h-8 w-8 flex items-center justify-center">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" alt={userProfile.full_name || userProfile.email} />
                  <AvatarFallback className="text-[10px]">
                    {userProfile.full_name?.charAt(0) || userProfile.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
            <ThemeToggle className="text-white/90 hover:text-white hover:bg-white/10" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/90 hover:text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-primary"
                  }`}
                onClick={() => {
                  trackButtonClick(item.label, 'navbar-mobile');
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.label}
              </Link>
            ))}

            {!userProfile && (
              <div className="space-y-2 pt-4">
                <Button variant="ghost" asChild className="w-full">
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    {t('nav.login')}
                  </Link>
                </Button>
                <Button variant="hero" asChild className="w-full">
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    {t('nav.signup')}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </nav >
  );
};

export default Navbar;