
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "@/lib/icons";

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

  const queryClient = useQueryClient();

  // Fetch users data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  // Fetch user analytics
  const { data: analytics = null } = useQuery({
    queryKey: ['admin-user-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/user-analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const response = await fetch('/api/admin/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    },
  });

  // Fetch permission groups
  const { data: permissionGroups = [] } = useQuery({
    queryKey: ['admin-permission-groups'],
    queryFn: async () => {
      const response = await fetch('/api/admin/permission-groups');
      if (!response.ok) throw new Error('Failed to fetch permission groups');
      return response.json();
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      console.log('Role updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      alert('Failed to update user role. Please try again.');
    },
  });

  // Update user permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions, limits }: { userId: string; permissions: any; limits: any }) => {
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions, limits }),
      });
      if (!response.ok) throw new Error('Failed to update permissions');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      console.log('Permissions updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating permissions:', error);
      alert('Failed to update user permissions. Please try again.');
    },
  });

  // Update role permissions mutation
  const updateRolePermissionsMutation = useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: string[] }) => {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });
      if (!response.ok) throw new Error('Failed to update role permissions');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      console.log('Role permissions updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating role permissions:', error);
      alert('Failed to update role permissions. Please try again.');
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      console.log('User created successfully:', data);
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      console.log('User deleted successfully:', data);
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    },
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update user status');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      console.log('User status updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async ({ userId, subject, message, template }: { userId: string; subject: string; message: string; template?: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, template }),
      });
      if (!response.ok) throw new Error('Failed to send email');
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Email sent successfully:', data);
      alert('Email sent successfully!');
    },
    onError: (error) => {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    },
  });

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
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-user-name">Full Name</Label>
                <Input id="new-user-name" placeholder="Enter full name" />
              </div>
              <div>
                <Label htmlFor="new-user-email">Email</Label>
                <Input id="new-user-email" type="email" placeholder="Enter email address" />
              </div>
              <div>
                <Label htmlFor="new-user-role">Role</Label>
                <Select defaultValue="free_user">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="pro_user">Professional User</SelectItem>
                    <SelectItem value="free_user">Pro Se User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-user-subscription">Subscription</Label>
                <Select defaultValue="Pro Se">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Pro Se">Pro Se</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button 
                onClick={() => {
                  const name = (document.getElementById('new-user-name') as HTMLInputElement)?.value;
                  const email = (document.getElementById('new-user-email') as HTMLInputElement)?.value;
                  
                  if (name && email) {
                    createUserMutation.mutate({
                      name,
                      email,
                      role: 'free_user',
                      subscription: 'Pro Se'
                    });
                  } else {
                    alert('Please fill in all required fields');
                  }
                }}
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                  {users
                    .filter(user => {
                      const matchesSearch = searchTerm === '' || 
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesRole = filterRole === 'all' || user.role === filterRole;
                      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
                      return matchesSearch && matchesRole && matchesStatus;
                    })
                    .map((user) => (
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User: {user.name}</DialogTitle>
                                <DialogDescription>Update user information and settings</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="user-role">User Role</Label>
                                  <Select 
                                    defaultValue={user.role}
                                    onValueChange={(newRole) => {
                                      updateRoleMutation.mutate({ userId: user.id, role: newRole });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="pro_user">Professional User</SelectItem>
                                      <SelectItem value="free_user">Pro Se User</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="user-status">User Status</Label>
                                  <Select 
                                    defaultValue={user.status}
                                    onValueChange={(newStatus) => {
                                      updateUserStatusMutation.mutate({ userId: user.id, status: newStatus });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="inactive">Inactive</SelectItem>
                                      <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Email to {user.name}</DialogTitle>
                                <DialogDescription>Send a direct email to this user</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="email-subject">Subject</Label>
                                  <Input id="email-subject" placeholder="Email subject..." />
                                </div>
                                <div>
                                  <Label htmlFor="email-message">Message</Label>
                                  <textarea 
                                    id="email-message"
                                    className="w-full h-32 p-3 border rounded-md"
                                    placeholder="Enter your message..."
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button 
                                  onClick={() => {
                                    const subject = (document.getElementById('email-subject') as HTMLInputElement)?.value;
                                    const message = (document.getElementById('email-message') as HTMLTextAreaElement)?.value;
                                    if (subject && message) {
                                      sendEmailMutation.mutate({ userId: user.id, subject, message });
                                    }
                                  }}
                                >
                                  Send Email
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

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
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete User</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete {user.name}? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => deleteUserMutation.mutate(user.id)}
                                >
                                  Delete User
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
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
          <div className="space-y-6">
            {/* Role Definitions */}
            <Card>
              <CardHeader>
                <CardTitle>Role Definitions</CardTitle>
                <CardDescription>Configure platform roles and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-600" />
                        Admin
                      </CardTitle>
                      <CardDescription>Full platform access</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Input defaultValue="User Management" className="text-sm bg-white border-gray-200" disabled />
                          <input type="checkbox" defaultChecked disabled className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="System Configuration" className="text-sm bg-white border-gray-200" disabled />
                          <input type="checkbox" defaultChecked disabled className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Financial Reports" className="text-sm bg-white border-gray-200" disabled />
                          <input type="checkbox" defaultChecked disabled className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Content Management" className="text-sm bg-white border-gray-200" disabled />
                          <input type="checkbox" defaultChecked disabled className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="API Access" className="text-sm bg-white border-gray-200" disabled />
                          <input type="checkbox" defaultChecked disabled className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Impersonation" className="text-sm bg-white border-gray-200" disabled />
                          <input type="checkbox" defaultChecked disabled className="rounded ml-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Professional User
                          </CardTitle>
                          <CardDescription>Advanced legal features</CardDescription>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const permissions = [
                              "unlimited_cases",
                              "advanced_ai_features", 
                              "document_generation",
                              "priority_support",
                              "api_access_limited"
                            ];
                            updateRolePermissionsMutation.mutate({ 
                              roleId: "pro_user", 
                              permissions 
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Unlimited Cases" className="text-sm bg-white border-gray-200" />
                          <input type="checkbox" defaultChecked className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Advanced AI Features" className="text-sm bg-white border-gray-200" />
                          <input type="checkbox" defaultChecked className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Document Generation" className="text-sm bg-white border-gray-200" />
                          <input type="checkbox" defaultChecked className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Priority Support" className="text-sm bg-white border-gray-200" />
                          <input type="checkbox" defaultChecked className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="API Access (Limited)" className="text-sm bg-white border-gray-200" />
                          <input type="checkbox" defaultChecked className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Billing Access" className="text-sm bg-white border-gray-200" />
                          <input type="checkbox" className="rounded ml-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 bg-gray-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-gray-600" />
                            Pro Se User
                          </CardTitle>
                          <CardDescription>Basic legal assistance</CardDescription>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const permissions = [
                              "limited_cases",
                              "basic_ai_assistance",
                              "document_templates", 
                              "email_support"
                            ];
                            updateRolePermissionsMutation.mutate({ 
                              roleId: "free_user", 
                              permissions 
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Limited Cases (5/month)" className="text-sm bg-white border-gray-200" />
                          <input type="checkbox" defaultChecked className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Basic AI Assistance" className="text-sm bg-white border-gray-200" />
                          <input type="checkbox" defaultChecked className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Document Templates" className="text-sm bg-white border-gray-200" />
                          <input type="checkbox" defaultChecked className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Email Support" className="text-sm bg-white border-gray-200" />
                          <input type="checkbox" defaultChecked className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="API Access" className="text-sm bg-white border-gray-200" />
                          <input type="checkbox" className="rounded ml-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Input defaultValue="Export Data" className="text-sm bg-white border-gray-200" />
                          <input type="checkbox" className="rounded ml-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* User Role Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>User Role Assignments</CardTitle>
                <CardDescription>Manage individual user role assignments and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Custom Permissions</TableHead>
                      <TableHead>Last Modified</TableHead>
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
                          <Select 
                            defaultValue={user.role}
                            onValueChange={(value) => {
                              updateRoleMutation.mutate({ userId: user.id, role: value });
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Crown className="h-4 w-4 text-yellow-600" />
                                  Admin
                                </div>
                              </SelectItem>
                              <SelectItem value="pro_user">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-blue-600" />
                                  Professional User
                                </div>
                              </SelectItem>
                              <SelectItem value="free_user">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-gray-600" />
                                  Pro Se User
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Settings className="h-4 w-4 mr-1" />
                                Custom
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Custom Permissions for {user.name}</DialogTitle>
                                <DialogDescription>
                                  Override role-based permissions with custom settings
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm">Case Management</Label>
                                    <input type="checkbox" defaultChecked className="rounded" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm">Document Access</Label>
                                    <input type="checkbox" defaultChecked className="rounded" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm">AI Features</Label>
                                    <input type="checkbox" className="rounded" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm">Billing Access</Label>
                                    <input type="checkbox" className="rounded" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm">Export Data</Label>
                                    <input type="checkbox" className="rounded" />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="case-limit">Case Limit (per month)</Label>
                                  <Input id="case-limit" type="number" defaultValue="10" />
                                </div>
                                <div>
                                  <Label htmlFor="token-limit">Token Limit (per month)</Label>
                                  <Input id="token-limit" type="number" defaultValue="5000" />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button 
                                  onClick={() => {
                                    const permissions = {
                                      caseManagement: true,
                                      documentAccess: true,
                                      aiFeatures: false,
                                      billingAccess: false,
                                      exportData: true
                                    };
                                    const limits = {
                                      caseLimit: parseInt((document.getElementById('case-limit') as HTMLInputElement)?.value || '10'),
                                      tokenLimit: parseInt((document.getElementById('token-limit') as HTMLInputElement)?.value || '5000')
                                    };
                                    updatePermissionsMutation.mutate({ userId: user.id, permissions, limits });
                                  }}
                                  disabled={updatePermissionsMutation.isPending}
                                >
                                  {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Permissions'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">2 days ago</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Permission Groups */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Permission Groups</CardTitle>
                    <CardDescription>Create and manage custom permission groups</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Group
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Legal Assistants</CardTitle>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Legal Assistants Group</DialogTitle>
                              <DialogDescription>Customize permission names and settings</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" defaultChecked className="rounded" />
                                  <Input defaultValue="Case viewing" className="text-sm" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" defaultChecked className="rounded" />
                                  <Input defaultValue="Document editing" className="text-sm" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" className="rounded" />
                                  <Input defaultValue="Client communication" className="text-sm" />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-3">3 members</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded text-xs" disabled />
                          <span>Case viewing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded text-xs" disabled />
                          <span>Document editing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded text-xs" disabled />
                          <span>Client communication</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Paralegals</CardTitle>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Paralegals Group</DialogTitle>
                              <DialogDescription>Customize permission names and settings</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" defaultChecked className="rounded" />
                                  <Input defaultValue="Full case access" className="text-sm" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" defaultChecked className="rounded" />
                                  <Input defaultValue="Document management" className="text-sm" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" defaultChecked className="rounded" />
                                  <Input defaultValue="Timeline management" className="text-sm" />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-3">2 members</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded text-xs" disabled />
                          <span>Full case access</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded text-xs" disabled />
                          <span>Document management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded text-xs" disabled />
                          <span>Timeline management</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Trial Users Group</DialogTitle>
                              <DialogDescription>Customize permission names and settings</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" defaultChecked className="rounded" />
                                  <Input defaultValue="Limited case access" className="text-sm" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" className="rounded" />
                                  <Input defaultValue="Basic AI features" className="text-sm" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" className="rounded" />
                                  <Input defaultValue="Export functionality" className="text-sm" />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-3">8 members</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded text-xs" disabled />
                          <span>Limited case access</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded text-xs" disabled />
                          <span>Basic AI features</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded text-xs" disabled />
                          <span>Export functionality</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* User Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">1,247</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold">856</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-xs text-green-600 mt-1">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New This Month</p>
                      <p className="text-2xl font-bold">143</p>
                    </div>
                    <UserX className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-green-600 mt-1">+23% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                      <p className="text-2xl font-bold">3.2%</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-xs text-red-600 mt-1">+0.3% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* User Activity Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Registration Trends</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Chart visualization placeholder</p>
                      <p className="text-xs text-gray-500">Registration trends: +15% growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Activity Distribution</CardTitle>
                  <CardDescription>User engagement levels and activity patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Activity (Daily)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medium Activity (Weekly)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                        </div>
                        <span className="text-sm font-medium">18%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low Activity (Monthly)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '7%' }}></div>
                        </div>
                        <span className="text-sm font-medium">7%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Inactive</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: '3%' }}></div>
                        </div>
                        <span className="text-sm font-medium">3%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
                <CardDescription>Breakdown of users by role and subscription type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Crown className="h-8 w-8 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-gray-600">Admin Users</p>
                    <p className="text-xs text-gray-500">1% of total</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold">456</p>
                    <p className="text-sm text-gray-600">Professional Users</p>
                    <p className="text-xs text-gray-500">37% of total</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-8 w-8 text-gray-600" />
                    </div>
                    <p className="text-2xl font-bold">779</p>
                    <p className="text-sm text-gray-600">Pro Se Users</p>
                    <p className="text-xs text-gray-500">62% of total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
                <CardDescription>Users with highest platform engagement this month</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Cases Created</TableHead>
                      <TableHead>AI Interactions</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">SJ</span>
                          </div>
                          <div>
                            <p className="font-medium">Sarah Johnson</p>
                            <p className="text-sm text-gray-600">sarah.johnson@law.com</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span>Professional</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">24</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">156</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">2 hours ago</span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">MW</span>
                          </div>
                          <div>
                            <p className="font-medium">Michael Wilson</p>
                            <p className="text-sm text-gray-600">michael.wilson@legal.org</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-600" />
                          <span>Pro Se</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">18</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">89</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">1 day ago</span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">ED</span>
                          </div>
                          <div>
                            <p className="font-medium">Emily Davis</p>
                            <p className="text-sm text-gray-600">emily.davis@attorney.com</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span>Professional</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">15</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">67</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">3 hours ago</span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
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
          <div className="space-y-6">
            {/* Default User Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Default User Settings</CardTitle>
                <CardDescription>Configure default settings for new user accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="default-role">Default Role for New Users</Label>
                      <Select defaultValue="free_user">
                        <SelectTrigger id="default-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free_user">Pro Se User</SelectItem>
                          <SelectItem value="pro_user">Professional User</SelectItem>
                          <SelectItem value="admin">Admin (Restricted)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="trial-period">Trial Period (days)</Label>
                      <Input id="trial-period" type="number" defaultValue="14" />
                    </div>

                    <div>
                      <Label htmlFor="default-case-limit">Default Case Limit</Label>
                      <Input id="default-case-limit" type="number" defaultValue="5" />
                    </div>

                    <div>
                      <Label htmlFor="default-token-limit">Default Token Limit</Label>
                      <Input id="default-token-limit" type="number" defaultValue="1000" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Email Verification Required</Label>
                        <p className="text-xs text-gray-600">Require email verification for new accounts</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Auto-activate Accounts</Label>
                        <p className="text-xs text-gray-600">Automatically activate verified accounts</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Send Welcome Email</Label>
                        <p className="text-xs text-gray-600">Send welcome email to new users</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Enable Two-Factor Auth</Label>
                        <p className="text-xs text-gray-600">Require 2FA for all users</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <Button>Save Default Settings</Button>
                  <Button variant="outline">Reset to Defaults</Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security & Access Control</CardTitle>
                <CardDescription>Configure security policies and access restrictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="password-policy">Password Policy</Label>
                      <Select defaultValue="strong">
                        <SelectTrigger id="password-policy">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                          <SelectItem value="strong">Strong (12+ chars, mixed case, numbers)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (16+ chars, symbols required)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input id="session-timeout" type="number" defaultValue="60" />
                    </div>

                    <div>
                      <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                      <Input id="max-login-attempts" type="number" defaultValue="5" />
                    </div>

                    <div>
                      <Label htmlFor="lockout-duration">Account Lockout Duration (minutes)</Label>
                      <Input id="lockout-duration" type="number" defaultValue="30" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">IP Restriction</Label>
                        <p className="text-xs text-gray-600">Restrict access by IP address</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Device Registration</Label>
                        <p className="text-xs text-gray-600">Require device registration</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Login Notifications</Label>
                        <p className="text-xs text-gray-600">Email notifications for new logins</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Audit Logging</Label>
                        <p className="text-xs text-gray-600">Log all user actions</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <Button>Apply Security Settings</Button>
                  <Button variant="outline">Test Configuration</Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Limits & Quotas</CardTitle>
                <CardDescription>Set platform-wide usage limits and quotas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Pro Se Users</h4>
                    <div>
                      <Label htmlFor="free-cases">Cases per month</Label>
                      <Input id="free-cases" type="number" defaultValue="5" />
                    </div>
                    <div>
                      <Label htmlFor="free-tokens">Tokens per month</Label>
                      <Input id="free-tokens" type="number" defaultValue="1000" />
                    </div>
                    <div>
                      <Label htmlFor="free-storage">Storage limit (GB)</Label>
                      <Input id="free-storage" type="number" defaultValue="1" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Professional Users</h4>
                    <div>
                      <Label htmlFor="pro-cases">Cases per month</Label>
                      <Input id="pro-cases" type="number" defaultValue="50" />
                    </div>
                    <div>
                      <Label htmlFor="pro-tokens">Tokens per month</Label>
                      <Input id="pro-tokens" type="number" defaultValue="10000" />
                    </div>
                    <div>
                      <Label htmlFor="pro-storage">Storage limit (GB)</Label>
                      <Input id="pro-storage" type="number" defaultValue="10" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">System Limits</h4>
                    <div>
                      <Label htmlFor="max-file-size">Max file size (MB)</Label>
                      <Input id="max-file-size" type="number" defaultValue="100" />
                    </div>
                    <div>
                      <Label htmlFor="api-rate-limit">API rate limit (req/min)</Label>
                      <Input id="api-rate-limit" type="number" defaultValue="100" />
                    </div>
                    <div>
                      <Label htmlFor="concurrent-sessions">Max concurrent sessions</Label>
                      <Input id="concurrent-sessions" type="number" defaultValue="3" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <Button>Update Limits</Button>
                  <Button variant="outline">View Usage Reports</Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
                <CardDescription>Configure automatic notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Usage Limit Warnings</Label>
                        <p className="text-xs text-gray-600">Notify users at 80% of limit</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Account Expiry Alerts</Label>
                        <p className="text-xs text-gray-600">Notify before account expiration</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">System Maintenance</Label>
                        <p className="text-xs text-gray-600">Notify about scheduled maintenance</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Security Alerts</Label>
                        <p className="text-xs text-gray-600">Notify about security events</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Feature Updates</Label>
                        <p className="text-xs text-gray-600">Notify about new features</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Weekly Reports</Label>
                        <p className="text-xs text-gray-600">Send weekly usage reports</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <Button>Save Notification Settings</Button>
                  <Button variant="outline">Send Test Notification</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
