
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserCheck,
  Scale,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  DollarSign,
  Search,
  Filter,
  Connect,
  Award,
  Building,
  Calendar,
  TrendingUp,
  UserPlus,
  Link,
  Activity
} from "lucide-react";

interface AttorneyProfile {
  id: string;
  userId: number;
  fullName: string;
  email: string;
  barNumber: string;
  firmName: string;
  practiceAreas: string[];
  yearsOfExperience: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  bio: string;
  hourlyRate: number;
  availableForProSe: boolean;
  maxProSeClients: number;
  currentProSeClients: number;
  isVerified: boolean;
  subscription: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  joinedAt: string;
  connections: string[];
}

interface ProSeUser {
  id: string;
  userId: number;
  fullName: string;
  email: string;
  caseType: string;
  city: string;
  state: string;
  zipCode: string;
  connectedAttorneyId: string | null;
  connectionStatus: string;
  connectedAt?: string;
  needsAttorney: boolean;
  preferredPracticeAreas: string[];
}

interface AttorneyStats {
  total: number;
  verified: number;
  available: number;
  premium: number;
  averageRating: number;
  totalConnections: number;
  totalProSeUsers: number;
  activeConnections: number;
  seekingConnections: number;
}

export default function AttorneyConnect() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [practiceAreaFilter, setPracticeAreaFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [selectedAttorney, setSelectedAttorney] = useState<AttorneyProfile | null>(null);
  const [selectedProSeUser, setSelectedProSeUser] = useState<ProSeUser | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  // Fetch attorneys
  const { data: attorneys = [], isLoading: attorneysLoading } = useQuery({
    queryKey: ['attorneys', searchTerm, stateFilter, practiceAreaFilter, availabilityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (stateFilter) params.append('state', stateFilter);
      if (practiceAreaFilter) params.append('practiceArea', practiceAreaFilter);
      if (availabilityFilter) params.append('availability', availabilityFilter);
      
      const response = await fetch(`/api/admin/attorneys?${params}`);
      if (!response.ok) throw new Error('Failed to fetch attorneys');
      return response.json();
    },
  });

  // Fetch attorney statistics
  const { data: stats } = useQuery({
    queryKey: ['attorney-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/attorneys/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  // Fetch pro se users
  const { data: proSeUsers = [], isLoading: proSeUsersLoading } = useQuery({
    queryKey: ['pro-se-users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pro-se-users');
      if (!response.ok) throw new Error('Failed to fetch pro se users');
      return response.json();
    },
  });

  // Create connection mutation
  const createConnectionMutation = useMutation({
    mutationFn: async ({ attorneyId, proSeUserId, connectionType }: { 
      attorneyId: string; 
      proSeUserId: string; 
      connectionType: string; 
    }) => {
      const response = await fetch('/api/admin/attorney-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attorneyId, proSeUserId, connectionType }),
      });
      if (!response.ok) throw new Error('Failed to create connection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attorneys'] });
      queryClient.invalidateQueries({ queryKey: ['pro-se-users'] });
      queryClient.invalidateQueries({ queryKey: ['attorney-stats'] });
      toast({
        title: "Connection Created",
        description: "Attorney and pro se user have been successfully connected.",
      });
      setShowConnectionModal(false);
      setSelectedAttorney(null);
      setSelectedProSeUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to create connection",
        variant: "destructive",
      });
    },
  });

  // Update attorney status mutation
  const updateAttorneyStatusMutation = useMutation({
    mutationFn: async ({ id, isActive, availableForProSe }: { 
      id: string; 
      isActive?: boolean; 
      availableForProSe?: boolean; 
    }) => {
      const response = await fetch(`/api/admin/attorneys/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive, availableForProSe }),
      });
      if (!response.ok) throw new Error('Failed to update attorney status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attorneys'] });
      queryClient.invalidateQueries({ queryKey: ['attorney-stats'] });
      toast({
        title: "Status Updated",
        description: "Attorney status has been updated successfully.",
      });
    },
  });

  const handleCreateConnection = () => {
    if (!selectedAttorney || !selectedProSeUser) return;
    
    createConnectionMutation.mutate({
      attorneyId: selectedAttorney.id,
      proSeUserId: selectedProSeUser.id,
      connectionType: "consultation"
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatRating = (rating: number) => {
    return (rating / 100).toFixed(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Attorney Connect
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage attorney directory and pro se user connections
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats?.total || 0}</div>
                <div className="text-sm text-gray-600">Total Attorneys</div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats?.activeConnections || 0}</div>
                <div className="text-sm text-gray-600">Active Connections</div>
              </div>
              <Link className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats?.seekingConnections || 0}</div>
                <div className="text-sm text-gray-600">Seeking Attorney</div>
              </div>
              <UserPlus className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats?.averageRating ? formatRating(stats.averageRating * 100) : '0.0'}</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attorneys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attorneys">Attorneys ({attorneys.length})</TabsTrigger>
          <TabsTrigger value="pro-se">Pro Se Users ({proSeUsers.length})</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="attorneys" className="space-y-4">
          {/* Attorney Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Attorneys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search attorneys..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All states" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All states</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Practice Area</Label>
                  <Select value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All areas</SelectItem>
                      <SelectItem value="Family Law">Family Law</SelectItem>
                      <SelectItem value="Immigration">Immigration</SelectItem>
                      <SelectItem value="Business Law">Business Law</SelectItem>
                      <SelectItem value="Criminal Law">Criminal Law</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All attorneys" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All attorneys</SelectItem>
                      <SelectItem value="available">Available for Pro Se</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attorneys List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {attorneys.map((attorney: AttorneyProfile) => (
              <Card key={attorney.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{getInitials(attorney.fullName)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{attorney.fullName}</h3>
                        <div className="flex items-center space-x-2">
                          {attorney.isVerified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Award className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Switch
                            checked={attorney.isActive}
                            onCheckedChange={(checked) => 
                              updateAttorneyStatusMutation.mutate({ 
                                id: attorney.id, 
                                isActive: checked 
                              })
                            }
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          {attorney.firmName}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {attorney.city}, {attorney.state} {attorney.zipCode}
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {attorney.email}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {formatCurrency(attorney.hourlyRate)}/hour
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {attorney.practiceAreas.map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          {formatRating(attorney.rating)} ({attorney.reviewCount} reviews)
                        </div>
                        <div className="text-gray-600">
                          {attorney.currentProSeClients}/{attorney.maxProSeClients} clients
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <Badge 
                          variant={attorney.availableForProSe ? "default" : "secondary"}
                          className={attorney.availableForProSe ? "bg-green-600" : ""}
                        >
                          {attorney.availableForProSe ? "Available" : "Unavailable"}
                        </Badge>
                        
                        <Button
                          size="sm"
                          onClick={() => setSelectedAttorney(attorney)}
                          disabled={!attorney.availableForProSe || attorney.currentProSeClients >= attorney.maxProSeClients}
                        >
                          <Connect className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pro-se" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {proSeUsers.map((user: ProSeUser) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{user.fullName}</h3>
                        <Badge 
                          variant={user.needsAttorney ? "destructive" : "default"}
                          className={user.needsAttorney ? "" : "bg-green-600"}
                        >
                          {user.needsAttorney ? "Seeking Attorney" : "Connected"}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Scale className="h-4 w-4 mr-2" />
                          {user.caseType}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {user.city}, {user.state} {user.zipCode}
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.email}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {user.preferredPracticeAreas.map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                      
                      {user.connectedAt && (
                        <div className="text-sm text-gray-600">
                          Connected: {user.connectedAt}
                        </div>
                      )}
                      
                      <div className="pt-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedProSeUser(user)}
                          disabled={!user.needsAttorney}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {user.needsAttorney ? "Connect to Attorney" : "View Connection"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Connections</CardTitle>
              <CardDescription>Current attorney-client relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attorneys.filter(a => a.connections.length > 0).map((attorney) => (
                  <div key={attorney.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(attorney.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{attorney.fullName}</div>
                          <div className="text-sm text-gray-600">{attorney.firmName}</div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {attorney.connections.length} connection{attorney.connections.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="pl-11 space-y-2">
                      {attorney.connections.map((connectionId) => {
                        const connectedUser = proSeUsers.find(u => u.id === connectionId);
                        return connectedUser ? (
                          <div key={connectionId} className="flex items-center justify-between py-2 border-l-2 border-blue-200 pl-4">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {getInitials(connectedUser.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{connectedUser.fullName}</div>
                                <div className="text-xs text-gray-600">{connectedUser.caseType}</div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connection Modal */}
      {selectedAttorney && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Connect Attorney</CardTitle>
              <CardDescription>
                Select a pro se user to connect with {selectedAttorney.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <strong>Attorney:</strong> {selectedAttorney.fullName}<br />
                <strong>Firm:</strong> {selectedAttorney.firmName}<br />
                <strong>Available Slots:</strong> {selectedAttorney.maxProSeClients - selectedAttorney.currentProSeClients}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Select Pro Se User</Label>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {proSeUsers.filter(user => user.needsAttorney).map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                          selectedProSeUser?.id === user.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedProSeUser(user)}
                      >
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-600">{user.caseType}</div>
                        <div className="text-xs text-gray-500">{user.city}, {user.state}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAttorney(null);
                    setSelectedProSeUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateConnection}
                  disabled={!selectedProSeUser || createConnectionMutation.isPending}
                >
                  {createConnectionMutation.isPending ? "Connecting..." : "Create Connection"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
