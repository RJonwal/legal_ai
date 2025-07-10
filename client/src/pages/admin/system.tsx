
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Database, 
  Key, 
  Server, 
  Activity, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Globe,
  Lock,
  Zap,
  HardDrive
} from "lucide-react";

export default function AdminSystem() {
  const [activeTab, setActiveTab] = useState("security");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [apiRateLimit, setApiRateLimit] = useState("1000");

  const systemStatus = {
    database: { status: "healthy", uptime: "99.9%", lastBackup: "2 hours ago" },
    api: { status: "healthy", responseTime: "120ms", requests: "45.2K/hour" },
    storage: { status: "warning", usage: "85%", available: "150GB" },
    security: { status: "healthy", lastScan: "1 hour ago", threats: "0" }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Management</h1>
            <p className="text-gray-600 mt-2">Configure system settings, security, and monitoring</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              View Logs
            </Button>
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              System Health
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Config
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
          </TabsList>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Security Configuration
                  </CardTitle>
                  <CardDescription>Manage platform security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                      <p className="text-xs text-gray-600">Require 2FA for all admin accounts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Session Timeout</Label>
                      <p className="text-xs text-gray-600">Auto-logout inactive sessions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">IP Allowlist</Label>
                      <p className="text-xs text-gray-600">Restrict admin access by IP</p>
                    </div>
                    <Switch />
                  </div>

                  <div>
                    <Label htmlFor="password-policy">Password Policy</Label>
                    <Textarea
                      id="password-policy"
                      placeholder="Define password requirements..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-red-600" />
                    Security Status
                  </CardTitle>
                  <CardDescription>Current security metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.security.status)}
                      <span className="text-sm font-medium">Security Scan</span>
                    </div>
                    {getStatusBadge(systemStatus.security.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Security Scan</span>
                    <span className="text-sm font-medium">{systemStatus.security.lastScan}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Threats Detected</span>
                    <Badge variant="outline" className="text-green-600">
                      {systemStatus.security.threats}
                    </Badge>
                  </div>

                  <Button className="w-full">
                    Run Security Scan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-600" />
                    Database Management
                  </CardTitle>
                  <CardDescription>Database configuration and maintenance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto Backup</Label>
                      <p className="text-xs text-gray-600">Daily automated backups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div>
                    <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                    <Input id="backup-retention" type="number" defaultValue="30" />
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      Create Manual Backup
                    </Button>
                    <Button className="w-full" variant="outline">
                      View Backup History
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-blue-600" />
                    Database Status
                  </CardTitle>
                  <CardDescription>Current database metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.database.status)}
                      <span className="text-sm font-medium">Database Health</span>
                    </div>
                    {getStatusBadge(systemStatus.database.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium">{systemStatus.database.uptime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="text-sm font-medium">{systemStatus.database.lastBackup}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Configuration Tab */}
          <TabsContent value="api">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-purple-600" />
                    API Configuration
                  </CardTitle>
                  <CardDescription>Manage API settings and limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rate-limit">Rate Limit (requests/hour)</Label>
                    <Input 
                      id="rate-limit" 
                      value={apiRateLimit}
                      onChange={(e) => setApiRateLimit(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">API Versioning</Label>
                      <p className="text-xs text-gray-600">Enable API version headers</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">CORS Protection</Label>
                      <p className="text-xs text-gray-600">Enable cross-origin restrictions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div>
                    <Label htmlFor="api-timeout">Request Timeout (seconds)</Label>
                    <Input id="api-timeout" type="number" defaultValue="30" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    API Performance
                  </CardTitle>
                  <CardDescription>Current API metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.api.status)}
                      <span className="text-sm font-medium">API Health</span>
                    </div>
                    {getStatusBadge(systemStatus.api.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="text-sm font-medium">{systemStatus.api.responseTime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Requests/Hour</span>
                    <span className="text-sm font-medium">{systemStatus.api.requests}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  System Monitoring
                </CardTitle>
                <CardDescription>Real-time system performance monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Monitoring Dashboard</h3>
                  <p className="text-gray-600 mb-4">Real-time system metrics, alerts, and performance monitoring</p>
                  <Button variant="outline">View Monitoring Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-orange-600" />
                  System Maintenance
                </CardTitle>
                <CardDescription>Manage system maintenance and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Maintenance Mode</h3>
                    <p className="text-sm text-gray-600">Temporarily disable user access for maintenance</p>
                  </div>
                  <Switch 
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                {maintenanceMode && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Maintenance Mode Active</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      The platform is currently in maintenance mode. Users will see a maintenance page.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="maintenance-message">Maintenance Message</Label>
                    <Textarea
                      id="maintenance-message"
                      placeholder="Message to display during maintenance..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      Schedule Maintenance
                    </Button>
                    <Button variant="outline" className="w-full">
                      System Update Check
                    </Button>
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
