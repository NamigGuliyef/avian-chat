import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// pages
import UserOutlet from "./components/user/UserOutlet";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import SingleProject from "./pages/SingleProject";
import UserLogin from "./pages/UserLogin";
import WidgetDemo from "./pages/WidgetDemo";

import AdminColumns from "./components/admin/AdminColumns";
import AdminCompanies from "./components/admin/AdminCompanies";
import AdminOutlet from "./components/admin/AdminOutlet";
import { OperationLogs } from "./components/admin/OperationLogs";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import ReportsPage from "./components/admin/ReportsPage";
import SupervisorDashboard from "./components/supervisor/SupervisorDashboard";
import SupervisorOutlet from "./components/supervisor/SupervisorOutlet";
import SupervisorProjects from "./components/supervisor/SupervisorProjects";
import SupervisorSingleExcel from "./components/supervisor/SupervisorSingleExcel";
import SupervisorSingleProject from "./components/supervisor/SupervisorSingleProject";
import SupervisorSingleSheet from "./components/supervisor/SupervisorSingleSheet";
import PartnerDashboard from "./components/partner/PartnerDashboard";
import PartnerOutlet from "./components/partner/PartnerOutlet";
// import PartnerProjects from "./components/partner/PartnerProjects";
// import PartnerSingleExcel from "./components/partner/PartnerSingleExcel";
// import PartnerSingleProject from "./components/partner/PartnerSingleProject";
// import PartnerSingleSheet from "./components/partner/PartnerSingleSheet";
import UserColumns from "./components/user/UserColumns";
import UserExcels from "./components/user/UserExcels";
import UserSheets from "./components/user/UserSheets";
import { AuthProvider } from "./contexts/AuthContext";
import AdminSingleCompany from "./pages/AdminSingleCompany";
import { AdminUsers } from "./pages/AdminUsers";
import { Roles } from "./types/types";
import SupervisorReportsPage from "./components/admin/SupervisorReportsPage";
import SupervisorProjectColumns from "./components/admin/SupervisorProjectColumns";
import PartnerReportsPage from "./components/partner/PartnerReportsPage";
import RemindersPage from "./components/user/RemindersPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />

          <Routes>
            {/* Public */}
            <Route path="/" element={<UserLogin />} />
            <Route path="/admin/login" element={<Login />} />

            {/* Admin */}
            <Route element={<ProtectedRoute allowedRoles={[Roles.Admin]} />}>
              <Route path="/admin" element={<AdminOutlet />}>
                <Route path="companies" element={<AdminCompanies />} />
                <Route path="columns" element={<AdminColumns />} />
                <Route path="companies/:companyId" element={<AdminSingleCompany />} />
                <Route path="projects/:projectId" element={<SingleProject />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="logs" element={<OperationLogs />} />
              </Route>
            </Route>

            {/* Supervisor */}
            <Route element={<ProtectedRoute allowedRoles={[Roles.Supervisor]} />}>
              <Route path="/supervisor" element={<SupervisorOutlet />}>
                <Route path="dashboard" element={<SupervisorDashboard />} />
                <Route path="projects" element={<SupervisorProjects />} />
                <Route path="reports" element={<SupervisorReportsPage />} />
                <Route path="columns" element={<SupervisorProjectColumns />} />
                <Route path="projects/:projectId/:projectName" element={<SupervisorSingleProject />} />
                <Route path="excels/:projectId/:excelId/:excelName" element={<SupervisorSingleExcel />} />
                <Route path="sheets/:projectId/:excelId/:sheetId/:sheetName" element={<SupervisorSingleSheet />} />
              </Route>
            </Route>

            {/* Partner */}
            <Route element={<ProtectedRoute allowedRoles={[Roles.Partner]} />}>
              <Route path="/partner" element={<PartnerOutlet />}>
                <Route path="dashboard" element={<PartnerDashboard />} />
                {/* <Route path="projects" element={<PartnerProjects />} /> */}
                <Route path="reports" element={<PartnerReportsPage />} />
                {/* <Route path="projects/:projectId/:projectName" element={<PartnerSingleProject />} />
                <Route path="excels/:projectId/:excelId/:excelName" element={<PartnerSingleExcel />} />
                <Route path="sheets/:projectId/:excelId/:sheetId/:sheetName" element={<PartnerSingleSheet />} /> */}
              </Route>
            </Route>

            {/* User */}
            <Route element={<ProtectedRoute allowedRoles={[Roles.Agent]} />}>
              <Route path="/user" element={<UserOutlet />}>
                {/* <Route path="dashboard" element={<UserDashboard />} /> */}
                <Route path="excels" element={<UserExcels />} />
                <Route path="sheets/:excelId/:excelName" element={<UserSheets />} />
                <Route path="columns/:sheetId/:sheetName" element={<UserColumns />} />
                <Route path="reminders" element={<RemindersPage />} />
              </Route>
            </Route>


            {/* Widget */}
            <Route path="/widget" element={<WidgetDemo />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider >
);

export default App;
