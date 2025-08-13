import React, { useState } from "react";
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
  User,
  CreditCard,
  Key,
  MessageSquare,
  Phone,
  FileText,
  Scale,
  LogOut,
  Brain
} from "@/lib/icons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  isActive: boolean;
  hidden?: boolean;
  hidden?: boolean;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Profile Modal Component
const ProfileModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Admin User",
    email: "admin@legalai.com",
    role: "System Administrator",
    avatar: "",
    phone: "",
    department: "IT Operations",
    lastLogin: new Date().toISOString().split('T')[0],
    permissions: ["Full Access", "User Management", "System Configuration"],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      theme: "light"
    }
  });

  const { toast } = useToast();

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profileData.avatar} alt={profileData.name} />
            <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Admin Profile</DialogTitle>
          <DialogDescription>
            Manage your admin profile information and preferences
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={profileData.department}
                onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label>Role & Permissions</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Role:</span>
                <Badge variant="outline">{profileData.role}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Last Login:</span>
                <span className="text-sm text-gray-600">{profileData.lastLogin}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Permissions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profileData.permissions.map((permission, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showFeatureToggle, setShowFeatureToggle] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

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
      title: "Page Management",
      url: "/admin/page-management",
      icon: FileText,
      isActive: location === "/admin/page-management"
    },
    {
      title: "Global Prompt Management",
      url: "/admin/global-prompt-management",
      icon: Brain,
      isActive: location === "/admin/global-prompt-management"
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
    },
  ];

  // Fetch feature flags
  const { data: featureFlags } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const response = await fetch('/api/admin/feature-flags');
      if (!response.ok) throw new Error('Failed to fetch feature flags');
      return response.json();
    },
  });

  // Update feature flags mutation
  const updateFeatureFlagsMutation = useMutation({
    mutationFn: async (flags: any) => {
      const response = await fetch('/api/admin/feature-flags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flags),
      });
      if (!response.ok) throw new Error('Failed to update feature flags');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });

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
                {navigationItems.filter(item => !item.hidden).map((item) => (
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


        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-px bg-sidebar-border" />
            </div>
            <ProfileModal />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}