import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/contexts/AuthContext";
import { ChevronDown, LogOut, MessageSquare, Bell } from "lucide-react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

// const statusColors: Record<OnlineStatus, string> = {
//   online: "bg-green-500",
//   busy: "bg-red-500",
//   break: "bg-yellow-500",
//   offline: "bg-gray-400",
// };

export default function UserOutlet() {
  const navigate = useNavigate();
  const { session, logout, isAuthenticated } = useAuthContext();

  if (!isAuthenticated || session.user.role !== 'Agent') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white shadow-sm px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <span className="font-bold text-lg text-slate-900">Avian Web App</span>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {session?.user?.name?.charAt?.(0)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900">
                    {session?.user?.name} {session?.user?.surname}
                  </p>
                  <p className="text-xs text-slate-500">Agent</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-600" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/user/reminders")} className="cursor-pointer">
                <Bell className="h-4 w-4 mr-2 text-slate-600" />
                <span>Bildirişlər</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/user/excels")} className="cursor-pointer">
                <MessageSquare className="h-4 w-4 mr-2 text-slate-600" />
                <span>Excel Faylları</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { logout(); navigate("/"); }} className="text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                <span>Çıxış</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="h-full min-h-0 flex bg-gradient-to-br from-slate-50 to-slate-100">
        <Outlet />
      </div>
    </div>
  );
}
