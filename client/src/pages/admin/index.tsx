
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Globe, 
  Shield,
  Database,
  Mail,
  CreditCard,
  Activity,
  TrendingUp,
  UserCheck,
  AlertTriangle
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for dashboard
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalCases: 3456,
    activeCases: 1234,
    monthlyRevenue: 45678,
    systemHealth: 99.9
  };

  const recentActivity = [
    { id: 1, type: "user_signup", user: "john.doe@example.com", time: "2 minutes ago" },
    { id: 2, type: "case_created", user: "sarah.smith@law.com", time: "5 minutes ago" },
    { id: 3, type: "subscription", user: "mike.johnson@legal.com", time: "12 minutes ago" },
    { id: 4, type: "document_generated", user: "anna.wilson@firm.com", time: "18 minutes ago" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your LegalAI Pro platform</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
            <Button>
              <Activity className="mr-2 h-4 w-4" />
              View Logs
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="cases" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Cases
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Content
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCases.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+23% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">{activity.user}</p>
                            <p className="text-xs text-gray-600 capitalize">{activity.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current system status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Uptime</span>
                      <Badge variant="outline" className="text-green-600">
                        {stats.systemHealth}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Response Time</span>
                      <Badge variant="outline" className="text-green-600">
                        120ms
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Database</span>
                      <Badge variant="outline" className="text-green-600">
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Storage</span>
                      <Badge variant="outline" className="text-yellow-600">
                        85% Used
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User Management Panel</h3>
                  <p className="text-gray-600 mb-4">Advanced user management features coming soon</p>
                  <Button variant="outline">View User Analytics</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <CardTitle>Case Management</CardTitle>
                <CardDescription>Monitor and manage legal cases across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Case Analytics Dashboard</h3>
                  <p className="text-gray-600 mb-4">Comprehensive case management and analytics</p>
                  <Button variant="outline">View Case Reports</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscriptions</CardTitle>
                <CardDescription>Manage subscriptions, payments, and financial reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Financial Dashboard</h3>
                  <p className="text-gray-600 mb-4">Revenue tracking and subscription management</p>
                  <Button variant="outline">View Financial Reports</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Configure system settings, security, and integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">System Administration</h3>
                  <p className="text-gray-600 mb-4">Security settings, API configuration, and system monitoring</p>
                  <Button variant="outline">Access System Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage landing page, documentation, and platform content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Globe className="h-6 w-6 text-blue-600" />
                        <h3 className="font-semibold">Landing Page</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Configure landing page content and appearance</p>
                      <Button size="sm" onClick={() => window.open('/admin/landing-config', '_blank')}>
                        Edit Landing Page
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-6 w-6 text-green-600" />
                        <h3 className="font-semibold">Documentation</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Manage help docs and user guides</p>
                      <Button size="sm" variant="outline">
                        Edit Documentation
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="h-6 w-6 text-purple-600" />
                        <h3 className="font-semibold">Email Templates</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Configure automated email templates</p>
                      <Button size="sm" variant="outline">
                        Edit Templates
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Database className="h-6 w-6 text-orange-600" />
                        <h3 className="font-semibold">Legal Database</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Manage legal precedents and templates</p>
                      <Button size="sm" variant="outline">
                        Manage Database
                      </Button>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
