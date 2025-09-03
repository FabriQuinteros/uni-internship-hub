import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layouts/AppSidebar";
import { DashboardHeader } from "@/components/layouts/DashboardHeader";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'student' | 'organization' | 'admin';
}

export const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar userRole={userRole} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader userRole={userRole} />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};