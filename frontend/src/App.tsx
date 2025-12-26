import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider } from "@/contexts/ChatContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminPanel from "./pages/AdminPanel";
import CSMPanel from "./pages/CSMPanel";
import UserDashboard from "./pages/UserDashboard";
import UserLogin from "./pages/UserLogin";
import WidgetDemo from "./pages/WidgetDemo";
import SupervisorPanel from "./pages/SupervisorPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ChatProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* <Route path="/" element={<CSMPanel />} /> */}
            <Route path="/csm" element={<CSMPanel />} />
            <Route path="/" element={<Login />} />
            <Route path="/user" element={<Admin />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/supervisor" element={<SupervisorPanel />} />
            <Route path="/widget" element={<WidgetDemo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ChatProvider>
  </QueryClientProvider>
);

export default App;
