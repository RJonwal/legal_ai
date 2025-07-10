
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Shield, 
  UserCheck, 
  Settings, 
  Plus, 
  Search, 
  Crown,
  Edit,
  Trash2,
  Mail,
  UserX,
  AlertTriangle,
  Clock,
  Eye
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'pro_user' | 'free_user';
  status: 'active' | 'inactive' | 'suspended';
  subscription: string;
  joinDate: string;
  lastActive: string;
}

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [impersonationTarget, setImpersonationTarget] = useState<User | null>(null);
  const [impersonationReason, setImpersonationReason] = useState("");
  const [currentImpersonation, setCurrentImpersonation] = useState<{
    user: User;
    startTime: Date;
    reason: string;
  } | null>(null);

  // Mock user data
  const users: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "pro_user",
      status: "active",
      subscription: "Professional",
      joinDate: "2024-01-15",
      lastActive: "2 hours ago"
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@law.com",
      role: "admin",
      status: "active",
      subscription: "Admin",
      joinDate: "2023-11-20",
      lastActive: "30 minutes ago"
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike.wilson@legal.com",
      role: "free_user",
      status: "inactive",
      subscription: "Pro Se",
      joinDate: "2024-02-10",
      lastActive: "3 days ago"
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'pro_user': return <Shield className="h-4 w-4 text-blue-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive': return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended': return <Badge variant="destructive">Suspended</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleImpersonateUser = (user: User) => {
    if (!impersonationReason.trim()) {
      alert("Please provide a reason for impersonation");
      return;
    }
    
    setCurrentImpersonation({
      user,
      startTime: new Date(),
      reason: impersonationReason
    });
    setImpersonationTarget(null);
    setImpersonationReason("");
    
    // In a real implementation, this would make an API call to start impersonation
    console.log(`Starting impersonation of user ${user.name} (${user.email})`);
    console.log(`Reason: ${impersonationReason}`);
  };

  const handleStopImpersonation = () => {
    if (currentImpersonation) {
      const duration = Date.now() - currentImpersonation.startTime.getTime();
      console.log(`Stopping impersonation of ${currentImpersonation.user.name} after ${Math.round(duration / 1000)} seconds`);
      setCurrentImpersonation(null);
    }
  };

  const canImpersonate = (user: User) => {
    return user.role !== 'admin' && user.status === 'active';
  };

  return (
    <div className="space-y-6">
      {/* Impersonation Banner */}
      {currentImpersonation && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-orange-800">
                Currently impersonating <strong>{currentImpersonation.user.name}</strong> ({currentImpersonation.user.email})
              </span>
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                <Clock className="h-3 w-3 mr-1" />
                Started: {currentImpersonation.startTime.toLocaleTimeString()}
              </Badge>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleStopImpersonation}
              className="text-orange-700 border-orange-300 hover:bg-orange-100"
            >
              <UserX className="h-4 w-4 mr-1" />
              Stop Impersonation
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage platform users, roles, and permissions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="impersonation" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Impersonation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            User Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            User Settings
          </TabsTrigger>
        </TabsList>

        {/* Users List Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>Manage all platform users</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="search">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role-filter">Role</Label>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger id="role-filter" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="pro_user">Pro User</SelectItem>
                      <SelectItem value="free_user">Free User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="status-filter" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Users Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.subscription}</TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                          {canImpersonate(user) && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-blue-600 hover:bg-blue-50"
                                  onClick={() => setImpersonationTarget(user)}
                                  disabled={!!currentImpersonation}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Impersonate User</DialogTitle>
                                  <DialogDescription>
                                    You are about to impersonate <strong>{user.name}</strong> ({user.email}). 
                                    This action will be logged and monitored.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="impersonation-reason">Reason for impersonation *</Label>
                                    <Input
                                      id="impersonation-reason"
                                      placeholder="e.g., Customer support request, troubleshooting issue..."
                                      value={impersonationReason}
                                      onChange={(e) => setImpersonationReason(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                      <strong>Important:</strong> During impersonation, you will have full access to this user's account. 
                                      All actions will be logged and attributed to your admin account.
                                    </AlertDescription>
                                  </Alert>
                                </div>
                                <DialogFooter>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setImpersonationTarget(null);
                                      setImpersonationReason("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => handleImpersonateUser(user)}
                                    disabled={!impersonationReason.trim()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Start Impersonation
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Admin
                </CardTitle>
                <CardDescription>Full platform access</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ User management</li>
                  <li>✓ System configuration</li>
                  <li>✓ Financial reports</li>
                  <li>✓ Content management</li>
                  <li>✓ API access</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Professional User
                </CardTitle>
                <CardDescription>Advanced legal features</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Unlimited cases</li>
                  <li>✓ Advanced AI features</li>
                  <li>✓ Document generation</li>
                  <li>✓ Priority support</li>
                  <li>✓ API access (limited)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  Pro Se User
                </CardTitle>
                <CardDescription>Basic legal assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Limited cases (5/month)</li>
                  <li>✓ Basic AI assistance</li>
                  <li>✓ Document templates</li>
                  <li>✓ Email support</li>
                  <li>✗ No API access</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Insights into user behavior and platform usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Analytics Dashboard</h3>
                <p className="text-gray-600 mb-4">Detailed user behavior analytics and engagement metrics</p>
                <Button variant="outline">View Full Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impersonation Tab */}
        <TabsContent value="impersonation">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Impersonation Management</CardTitle>
                <CardDescription>Monitor and manage user impersonation sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {currentImpersonation ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Active Impersonation Session</h3>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">Impersonating: {currentImpersonation.user.name}</span>
                          </div>
                          <p className="text-sm text-gray-600">Email: {currentImpersonation.user.email}</p>
                          <p className="text-sm text-gray-600">Started: {currentImpersonation.startTime.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Reason: {currentImpersonation.reason}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={handleStopImpersonation}
                          className="text-orange-700 border-orange-300 hover:bg-orange-100"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Stop Impersonation
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Impersonation</h3>
                    <p className="text-gray-600 mb-4">Use the eye icon in the Users tab to start impersonating a user</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impersonation History</CardTitle>
                <CardDescription>Recent impersonation sessions and audit log</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock impersonation history */}
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">John Doe (john.doe@example.com)</span>
                      <Badge variant="outline">2 hours ago</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Duration: 15 minutes</p>
                    <p className="text-sm text-gray-600">Reason: Customer support - billing inquiry</p>
                  </div>
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Mike Wilson (mike.wilson@legal.com)</span>
                      <Badge variant="outline">1 day ago</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Duration: 8 minutes</p>
                    <p className="text-sm text-gray-600">Reason: Troubleshooting document generation issue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>Configure user defaults and restrictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Configuration</h3>
                <p className="text-gray-600 mb-4">Manage default user settings and platform restrictions</p>
                <Button variant="outline">Configure Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
