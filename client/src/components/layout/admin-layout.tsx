import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { 
  Users, 
  Settings, 
  BarChart3, 
  Globe, 
  Shield,
  Database,
  Mail,
  Activity,
  Home,
  ChevronUp,
  User2,
  CreditCard,
  Key,
  MessageSquare,
  Phone,
  FileText
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
      isActive: location === "/admin"
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
      isActive: location === "/admin/users"
    },
    {
      title: "Billing",
      url: "/admin/billing", 
      icon: CreditCard,
      isActive: location === "/admin/billing"
    },
    {
      title: "API Management",
      url: "/admin/api-management",
      icon: Key,
      isActive: location === "/admin/api-management"
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
      isActive: location === "/admin/analytics"
    },
    {
      title: "Email Management",
      url: "/admin/email-management",
      icon: Mail,
      isActive: location === "/admin/email-management"
    },
    {
      title: "Live Chat",
      url: "/admin/livechat-management",
      icon: MessageSquare,
      isActive: location === "/admin/livechat-management"
    },
    {
      title: "VoIP Management",
      url: "/admin/voip-management",
      icon: Phone,
      isActive: location === "/admin/voip-management"
    },
    {
      title: "Page Management",
      url: "/admin/page-management",
      icon: FileText,
      isActive: location === "/admin/page-management"
    },
    {
      title: "Email Settings",
      url: "/admin/email-settings",
      icon: Settings,
      isActive: location === "/admin/email-settings"
    },
    {
      title: "System",
      url: "/admin/system",
      icon: Database,
      isActive: location === "/admin/system"
    },
    {
      title: "Landing Config",
      url: "/admin/landing-config",
      icon: Globe,
      isActive: location === "/admin/landing-config"
    }
  ];

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Shield className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">LegalAI Pro</span>
                    <span className="truncate text-xs">Admin Panel</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={item.isActive}
                    >
                      <div 
                        className="cursor-pointer" 
                        onClick={() => navigate(item.url)}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Activity />
                    <span>View Logs</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Database />
                    <span>Database Status</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <User2 />
                <span>Admin User</span>
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}