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
import UserOutlet from "./components/user/UserOutlet";
import UserLogin from "./pages/UserLogin";
import WidgetDemo from "./pages/WidgetDemo";

import AdminCompanies from "./components/admin/AdminCompanies";
import AdminOutlet from "./components/admin/AdminOutlet";
import ChatbotsManagement from "./components/admin/ChatbotsManagement";
import { OperationLogs } from "./components/admin/OperationLogs";
import ReportsPage from "./components/admin/ReportsPage";
import SupervisorDashboard from "./components/supervisor/SupervisorDashboard";
import SupervisorOutlet from "./components/supervisor/SupervisorOutlet";
import SupervisorProjects from "./components/supervisor/SupervisorProjects";
import AdminSingleCompany from "./pages/AdminSingleCompany";
import { AdminUsers } from "./pages/AdminUsers";
import UserProjects from "./components/user/UserProjects";
import UserDashboard from "./components/user/UserDashboard";
import SupervisorSingleProject from "./components/supervisor/SupervisorSingleProject";
import SupervisorSingleExcel from "./components/supervisor/SupervisorSingleExcel";
import SupervisorSingleSheet from "./components/supervisor/SupervisorSingleSheet";
import UserExcels from "./components/user/UserExcels";
import UserSheets from "./components/user/UserSheets";
import UserColumns from "./components/user/UserColumns";
import AdminColumns from "./components/admin/AdminColumns";
import ChatbotFlowBuilder from "./components/admin/ChatbotFlowBuilder";

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
              <Route path="columns" element={<AdminColumns />} />
              <Route path="companies/:companyId" element={<AdminSingleCompany />} />
              <Route path="projects/:projectId" element={<SingleProject />} />
              <Route path="chatbots" element={<ChatbotsManagement />} />
              <Route path="chatbots/:chatbotId" element={<ChatbotFlowBuilder />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="logs" element={<OperationLogs />} />
            </Route>

            {/* Supervisor */}
            <Route path="/supervisor" element={<SupervisorOutlet />}>
              <Route path="dashboard" element={<SupervisorDashboard />} />
              <Route path="projects" element={<SupervisorProjects />} />
              <Route path="projects/:projectId/:projectName" element={<SupervisorSingleProject />} />
              <Route path="excels/:projectId/:excelId/:excelName" element={<SupervisorSingleExcel />} />
              <Route path="sheets/:projectId/:excelId/:sheetId/:sheetName" element={<SupervisorSingleSheet />} />
            </Route>

            {/* User */}
            <Route path="/user" element={<UserOutlet />}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="excels" element={<UserExcels />} />
              <Route path="sheets/:excelId/:excelName" element={<UserSheets />} />
              <Route path="columns/:sheetId/:sheetName" element={<UserColumns />} />
            </Route>


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
