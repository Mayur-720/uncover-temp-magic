
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  Menu,
  Plus,
  Settings,
  LogOut,
  User,
  Book,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import CreatePostModal from "@/components/feed/CreatePostModal";

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navigationItems = [
    { icon: Home, label: "Feed", path: "/" },
    { icon: Hash, label: "Tags", path: "/tags" },
    { icon: Book, label: "Confessions", path: "/confessions" },
    { icon: User, label: "Profile", path: `/profile/${user?._id}` },
  ];

  return (
    <div className="flex h-screen bg-background antialiased">
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-20 shrink-0 bg-secondary">
              <p className="font-bold text-lg">Underground</p>
            </div>
            <div className="flex-1 py-4">
              <ul className="space-y-1">
                {navigationItems.map((item) => (
                  <li key={item.label}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "justify-start px-4 w-full hover:bg-secondary",
                        location.pathname === item.path
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground"
                      )}
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="py-4 px-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 hover:bg-secondary"
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 mt-2 hover:bg-secondary"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sidebar navigation (desktop) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-border">
        <div className="flex items-center justify-center h-20 shrink-0 bg-secondary">
          <p className="font-bold text-lg">Underground</p>
        </div>
        <div className="flex-1 py-4">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <Button
                  variant="ghost"
                  className={cn(
                    "justify-start px-4 w-full hover:bg-secondary",
                    location.pathname === item.path
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="py-4 px-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 hover:bg-secondary"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 mt-2 hover:bg-secondary"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      <CreatePostModal
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        onSuccess={() => {}}
        currentFeedType="global"
      />
    </div>
  );
};

export default AppShell;
