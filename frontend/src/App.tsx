import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatProvider } from "@/contexts/ChatContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import SupervisorPanel from "./pages/SupervisorPanel";
import UserDashboard from "./pages/UserDashboard";
import UserLogin from "./pages/UserLogin";
import WidgetDemo from "./pages/WidgetDemo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ChatProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/" element={<Login />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
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
