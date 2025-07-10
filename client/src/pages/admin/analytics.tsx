
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Activity,
  Download,
  Calendar,
  Eye
} from "lucide-react";

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Analytics
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45,231</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,350</div>
                <p className="text-xs text-muted-foreground">+180.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.5%</div>
                <p className="text-xs text-muted-foreground">+2.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8m 32s</div>
                <p className="text-xs text-muted-foreground">+1m 12s from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Comprehensive platform analytics dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics Dashboard</h3>
                <p className="text-gray-600 mb-4">Interactive charts and detailed insights</p>
                <Button variant="outline">View Full Dashboard</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user behavior and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Behavior Analytics</h3>
                <p className="text-gray-600 mb-4">User engagement, retention, and activity patterns</p>
                <Button variant="outline">View User Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
              <CardDescription>Content performance and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Content Performance</h3>
                <p className="text-gray-600 mb-4">Document usage, case analytics, and content effectiveness</p>
                <Button variant="outline">View Content Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Platform performance and technical metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Response Time</span>
                  <Badge variant="outline" className="text-green-600">
                    120ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Performance</span>
                  <Badge variant="outline" className="text-green-600">
                    Excellent
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Error Rate</span>
                  <Badge variant="outline" className="text-green-600">
                    0.01%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <Badge variant="outline" className="text-green-600">
                    99.9%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
