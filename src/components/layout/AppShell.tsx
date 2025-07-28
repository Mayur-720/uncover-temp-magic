
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Home,
  Menu,
  MessageCircle,
  Users,
  Heart,
  Trophy,
  Gift,
  Hash
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import CollegeSelector from "@/components/CollegeSelector";
import AreaSelector from "@/components/AreaSelector";
import { useToast } from "@/hooks/use-toast";

const AppShell = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Ghost Circles", href: "/ghost-circles", icon: Users },
    { name: "Tags", href: "/tags", icon: Hash },
    { name: "Whispers", href: "/whispers", icon: MessageCircle },
    { name: "Matches", href: "/matches", icon: Heart },
    { name: "Recognitions", href: "/recognitions", icon: Trophy },
    { name: "Referrals", href: "/referrals", icon: Gift },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border hidden sm:flex flex-col py-4">
        <div className="px-6 py-2 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-foreground">
            Underkover
          </Link>
        </div>

        <nav className="flex-1 px-6 py-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.name} className="mb-2">
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md hover:bg-secondary transition-colors",
                    location.pathname === item.href
                      ? "bg-secondary font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{user?.avatarEmoji || "🎭"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm text-foreground">
                {user?.anonymousAlias || "Anonymous"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email || "No Email"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border sm:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="font-bold text-lg text-foreground">
            Underkover
          </Link>
          <div></div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 w-full bg-background border-t border-border z-50">
        <nav className="flex items-center justify-around p-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-64">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Explore Underkover
            </SheetDescription>
          </SheetHeader>
          <nav className="flex-1 px-6 py-4">
            <ul>
              {navItems.map((item) => (
                <li key={item.name} className="mb-2">
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center px-4 py-2 rounded-md hover:bg-secondary transition-colors",
                      location.pathname === item.href
                        ? "bg-secondary font-medium"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>{user?.avatarEmoji || "🎭"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {user?.anonymousAlias || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || "No Email"}
                </p>
              </div>
            </div>
            <CollegeSelector />
            <AreaSelector />
            <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AppShell;
