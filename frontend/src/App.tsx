import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Web3Provider } from "@/contexts/Web3Context";
import { JobsProvider } from "@/contexts/JobsContext";
import { Navbar } from "@/components/Navbar";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import PostJob from "@/pages/PostJob";
import BrowseJobs from "@/pages/BrowseJobs";
import JobDetails from "@/pages/JobDetails";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Web3Provider>
          <JobsProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/post-job" element={<PostJob />} />
                  <Route path="/jobs" element={<BrowseJobs />} />
                  <Route path="/jobs/:id" element={<JobDetails />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </JobsProvider>
        </Web3Provider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
