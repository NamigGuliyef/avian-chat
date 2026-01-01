import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatProvider } from "@/contexts/ChatContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import SingleProject from "./pages/SingleProject";
import SupervisorPanel from "./pages/SupervisorPanel";
import UserDashboard from "./pages/UserDashboard";
import UserLogin from "./pages/UserLogin";
import WidgetDemo from "./pages/WidgetDemo";

import AdminOutlet from "./components/admin/AdminOutlet";
import ChatbotsManagement from "./components/admin/ChatbotsManagement";
import { OperationLogs } from "./components/admin/OperationLogs";
import ReportsPage from "./components/admin/ReportsPage";
import AdminSingleCompany from "./pages/AdminSingleCompany";
import { AdminUsers } from "./pages/AdminUsers";
import AdminCompanies from "./components/admin/AdminCompanies";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ChatProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Login />} />
            <Route path="/user/login" element={<UserLogin />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminOutlet />}>
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="companies/:companyId" element={<AdminSingleCompany />} />
              <Route path="projects/:projectId" element={<SingleProject />} />
              <Route path="chatbots" element={<ChatbotsManagement />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="logs" element={<OperationLogs />} />
            </Route>

            {/* User */}
            <Route path="/user/dashboard" element={<UserDashboard />} />

            {/* Supervisor */}
            <Route path="/supervisor" element={<SupervisorPanel />} />

            {/* Widget */}
            <Route path="/widget" element={<WidgetDemo />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ChatProvider>
  </QueryClientProvider>
);

export default App;
