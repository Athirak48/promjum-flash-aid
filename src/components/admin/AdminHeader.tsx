import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, Search, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Input } from "@/components/ui/input";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, useNavigate } from "react-router-dom";

interface AdminHeaderProps {
    onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { user, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate("/auth");
    };

    const getBreadcrumbs = () => {
        const path = location.pathname.split("/").filter((x) => x);
        // path[0] is 'admin'
        return path.map((segment, index) => {
            const url = `/${path.slice(0, index + 1).join("/")}`;
            const isLast = index === path.length - 1;
            const title = segment.charAt(0).toUpperCase() + segment.slice(1);

            return (
                <BreadcrumbItem key={url}>
                    {index > 0 && <BreadcrumbSeparator />}
                    {isLast ? (
                        <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink href={url}>{title}</BreadcrumbLink>
                    )}
                </BreadcrumbItem>
            );
        });
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-6 shadow-sm">
            <Button
                variant="ghost"
                size="icon"
                className="mr-4 md:hidden"
                onClick={onMenuClick}
            >
                <Menu className="h-5 w-5" />
            </Button>

            <div className="flex flex-1 items-center gap-4">
                <div className="hidden md:block">
                    <Breadcrumb>
                        <BreadcrumbList>
                            {getBreadcrumbs()}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Mobile Search/Breadcrumb placeholder if needed, or just spacer */}
                <div className="flex-1 md:hidden">
                    <span className="font-semibold">Admin</span>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="w-64 rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
                        />
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>

                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/admin/settings")}>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
