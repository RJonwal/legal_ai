import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  CreditCard,
  Activity,
  TrendingUp,
  UserCheck,
  Eye,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, navigate] = useLocation();

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your LegalAI Pro platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        {/* Recent Activity */}
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

        {/* System Health */}
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage Users</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/admin/system')}
            >
              <Activity className="h-6 w-6" />
              <span className="text-sm">System Settings</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/admin/landing-config')}
            >
              <Eye className="h-6 w-6" />
              <span className="text-sm">Landing Config</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/admin/analytics')}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">View Analytics</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}