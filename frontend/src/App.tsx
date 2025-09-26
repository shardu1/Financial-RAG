import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import HomePage from "./pages/HomePage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import CompanyManagement from "./pages/dashboard/CompanyManagement";
import PDFUpload from "./pages/dashboard/PDFUpload";
import URLSubmission from "./pages/dashboard/URLSubmission";
import ChatInterface from "./pages/dashboard/ChatInterface";
import History from "./pages/dashboard/History";
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="companies" element={<CompanyManagement />} />
            <Route path="upload" element={<PDFUpload />} />
            <Route path="urls" element={<URLSubmission />} />
            <Route path="chat" element={<ChatInterface />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
