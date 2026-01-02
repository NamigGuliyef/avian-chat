import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { OnlineStatus } from "@/types/types";
import { ChevronDown, LogOut, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const statusColors: Record<OnlineStatus, string> = {
  online: "bg-green-500",
  busy: "bg-red-500",
  break: "bg-yellow-500",
  offline: "bg-gray-400",
};

export default function UserOutlet() {
  const navigate = useNavigate();
  const { session, isLoading, logout } = useAuth();
  const [userStatus, setUserStatus] = useState<OnlineStatus>(OnlineStatus.online);

  useEffect(() => {
    if (!isLoading && (!session.isAuthenticated || session.user?.role !== "agent")) {
      navigate("/user/login");
    }
  }, [isLoading, session, navigate]);

  if (isLoading) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b bg-card px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-semibold">Live Chat</span>
        </div>

        <div className="flex items-center gap-3">
          <Select value={userStatus} onValueChange={(v: OnlineStatus) => setUserStatus(v)}>
            <SelectTrigger className="w-32 h-9">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", statusColors[userStatus])} />
                <span className="text-sm">{userStatus}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(statusColors).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {session.user?.name?.charAt(0)}
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/user/dashboard")}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/user/projects")}>
                Projects
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { logout(); navigate("/user/login"); }} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Çıxış
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="h-full min-h-0 flex bg-background">
        <Outlet />
      </div>
    </div>
  );
}
