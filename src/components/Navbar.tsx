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
import { Menu, X, User, LogOut, CreditCard, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import promjumLogo from "@/assets/promjum-logo.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

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
    { href: "/dashboard", label: t('nav.dashboard') },
    { href: "/decks", label: "Deck" },
    { href: "/ai-practice", label: "AI Practice" },
    { href: "/flashcards", label: t('nav.flashcards') },
    { href: "/feedback", label: t('nav.feedback') },
  ];

  const adminNavItems = [
    { href: "/admin", label: "แอดมิน" },
    { href: "/admin/uploads", label: "จัดการไฟล์" },
    { href: "/admin/pricing", label: "จัดการราคา" },
    { href: "/admin/stats", label: "สถิติ" },
  ];

  const navItems = userProfile?.role === "admin" ? adminNavItems : userProfile ? userNavItems : publicNavItems;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={promjumLogo} 
              alt="Promjum Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Promjum
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-2">
            {userProfile ? (
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
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{userProfile.full_name || userProfile.email}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{userProfile.email}</span>
                        {userProfile.role === "admin" && (
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/checkout" className="cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      ชำระเงิน
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
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
              
              {/* Mobile Theme and Language toggles */}
              <div className="flex items-center justify-center space-x-2 pt-4 border-t border-border/40">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;