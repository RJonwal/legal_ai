
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
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  Network,
  Award,
  Building,
  Calendar,
  TrendingUp,
  UserPlus,
  Link,
  Activity,
  Plus,
  Eye,
  Check,
  ChevronsUpDown
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

interface NewAttorneyForm {
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
  maxProSeClients: number;
}

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" }
];

const PRACTICE_AREAS = [
  "Family Law",
  "Immigration",
  "Business Law",
  "Criminal Law",
  "Personal Injury",
  "Real Estate",
  "Employment Law",
  "Intellectual Property",
  "Tax Law",
  "Estate Planning"
];

export default function AttorneyConnect() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [practiceAreaFilter, setPracticeAreaFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [selectedAttorney, setSelectedAttorney] = useState<AttorneyProfile | null>(null);
  const [selectedProSeUser, setSelectedProSeUser] = useState<ProSeUser | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showProSePreview, setShowProSePreview] = useState(false);
  const [showAttorneyPreview, setShowAttorneyPreview] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [stateSearchValue, setStateSearchValue] = useState("");

  // New attorney form state
  const [newAttorneyForm, setNewAttorneyForm] = useState<NewAttorneyForm>({
    fullName: "",
    email: "",
    barNumber: "",
    firmName: "",
    practiceAreas: [],
    yearsOfExperience: 0,
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    website: "",
    bio: "",
    hourlyRate: 0,
    maxProSeClients: 5
  });

  // Fetch attorneys
  const { data: attorneys = [], isLoading: attorneysLoading } = useQuery({
    queryKey: ['attorneys', searchTerm, stateFilter, practiceAreaFilter, availabilityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (stateFilter && stateFilter !== 'all') params.append('state', stateFilter);
      if (practiceAreaFilter && practiceAreaFilter !== 'all') params.append('practiceArea', practiceAreaFilter);
      if (availabilityFilter && availabilityFilter !== 'all') params.append('availability', availabilityFilter);
      
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

  // Add attorney mutation
  const addAttorneyMutation = useMutation({
    mutationFn: async (attorney: NewAttorneyForm) => {
      const response = await fetch('/api/admin/attorneys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attorney),
      });
      if (!response.ok) throw new Error('Failed to add attorney');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attorneys'] });
      queryClient.invalidateQueries({ queryKey: ['attorney-stats'] });
      toast({
        title: "Attorney Added",
        description: "New attorney has been successfully added to the directory.",
      });
      setNewAttorneyForm({
        fullName: "",
        email: "",
        barNumber: "",
        firmName: "",
        practiceAreas: [],
        yearsOfExperience: 0,
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        website: "",
        bio: "",
        hourlyRate: 0,
        maxProSeClients: 5
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Attorney",
        description: error.message || "Failed to add attorney",
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

  const handleAddAttorney = () => {
    addAttorneyMutation.mutate(newAttorneyForm);
  };

  const handlePracticeAreaToggle = (area: string) => {
    setNewAttorneyForm(prev => ({
      ...prev,
      practiceAreas: prev.practiceAreas.includes(area)
        ? prev.practiceAreas.filter(a => a !== area)
        : [...prev.practiceAreas, area]
    }));
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

  const filteredStates = US_STATES.filter(state =>
    state.label.toLowerCase().includes(stateSearchValue.toLowerCase()) ||
    state.value.toLowerCase().includes(stateSearchValue.toLowerCase())
  );

  const getStateLabel = (value: string) => {
    if (value === "all") return "All states";
    const state = US_STATES.find(s => s.value === value);
    return state ? state.label : value;
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
        <div className="flex items-center space-x-4">
          <Button onClick={() => setShowProSePreview(true)} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Pro Se Preview
          </Button>
          <Button onClick={() => setShowAttorneyPreview(true)} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Attorney Preview
          </Button>
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
          <TabsTrigger value="add-attorney">
            <Plus className="h-4 w-4 mr-2" />
            Add Attorney
          </TabsTrigger>
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
                  <Popover open={stateOpen} onOpenChange={setStateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={stateOpen}
                        className="w-full justify-between"
                      >
                        {getStateLabel(stateFilter)}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search states..." 
                          value={stateSearchValue}
                          onValueChange={setStateSearchValue}
                        />
                        <CommandEmpty>No state found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              setStateFilter("all");
                              setStateOpen(false);
                              setStateSearchValue("");
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                stateFilter === "all" ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            All states
                          </CommandItem>
                          {filteredStates.map((state) => (
                            <CommandItem
                              key={state.value}
                              value={state.value}
                              onSelect={(currentValue) => {
                                setStateFilter(currentValue);
                                setStateOpen(false);
                                setStateSearchValue("");
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  stateFilter === state.value ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {state.label} ({state.value})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Practice Area</Label>
                  <Select value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All areas</SelectItem>
                      {PRACTICE_AREAS.map((area) => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
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
                      <SelectItem value="all">All attorneys</SelectItem>
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
                          <Network className="h-4 w-4 mr-2" />
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

        <TabsContent value="add-attorney" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Attorney</CardTitle>
              <CardDescription>Manually add a new attorney to the directory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={newAttorneyForm.fullName}
                      onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAttorneyForm.email}
                      onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="barNumber">Bar Number *</Label>
                    <Input
                      id="barNumber"
                      value={newAttorneyForm.barNumber}
                      onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, barNumber: e.target.value }))}
                      placeholder="Enter bar number"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="firmName">Firm Name *</Label>
                    <Input
                      id="firmName"
                      value={newAttorneyForm.firmName}
                      onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, firmName: e.target.value }))}
                      placeholder="Enter firm name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newAttorneyForm.address}
                      onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={newAttorneyForm.city}
                        onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        value={newAttorneyForm.zipCode}
                        onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="Enter zip code"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={newAttorneyForm.state}
                      onValueChange={(value) => setNewAttorneyForm(prev => ({ ...prev, state: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newAttorneyForm.phone}
                      onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={newAttorneyForm.website}
                      onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="Enter website URL"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        value={newAttorneyForm.yearsOfExperience}
                        onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newAttorneyForm.hourlyRate / 100}
                        onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, hourlyRate: Math.round(parseFloat(e.target.value) * 100) || 0 }))}
                        placeholder="350.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="maxClients">Max Pro Se Clients</Label>
                    <Input
                      id="maxClients"
                      type="number"
                      min="1"
                      value={newAttorneyForm.maxProSeClients}
                      onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, maxProSeClients: parseInt(e.target.value) || 5 }))}
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label>Practice Areas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {PRACTICE_AREAS.map((area) => (
                      <label key={area} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAttorneyForm.practiceAreas.includes(area)}
                          onChange={() => handlePracticeAreaToggle(area)}
                          className="rounded"
                        />
                        <span className="text-sm">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={newAttorneyForm.bio}
                    onChange={(e) => setNewAttorneyForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Enter attorney bio..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleAddAttorney}
                    disabled={!newAttorneyForm.fullName || !newAttorneyForm.email || !newAttorneyForm.barNumber || !newAttorneyForm.firmName || addAttorneyMutation.isPending}
                  >
                    {addAttorneyMutation.isPending ? "Adding..." : "Add Attorney"}
                  </Button>
                </div>
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

      {/* Pro Se Preview Modal */}
      {showProSePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Pro Se User View - Attorney Directory</CardTitle>
              <CardDescription>
                This is what pro se users see when browsing attorneys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Find Your Attorney</h3>
                  <p className="text-blue-800 text-sm">Browse our directory of verified attorneys and find the right legal representation for your case.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attorneys.filter(a => a.availableForProSe && a.isActive).slice(0, 4).map((attorney) => (
                    <Card key={attorney.id} className="border-2 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{getInitials(attorney.fullName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{attorney.fullName}</h4>
                            <p className="text-sm text-gray-600">{attorney.firmName}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {attorney.city}, {attorney.state}
                            </div>
                            <div className="flex items-center text-sm text-yellow-600 mt-1">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              {formatRating(attorney.rating)} ({attorney.reviewCount} reviews)
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {attorney.practiceAreas.slice(0, 2).map((area, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                            <div className="mt-3">
                              <Button size="sm" className="w-full">
                                Request Consultation
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setShowProSePreview(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attorney Preview Modal */}
      {showAttorneyPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Attorney View - Pro Se Requests</CardTitle>
              <CardDescription>
                This is what attorneys see when managing pro se client requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Pro Se Client Requests</h3>
                  <p className="text-green-800 text-sm">Manage consultation requests from pro se users seeking legal representation.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {proSeUsers.filter(u => u.needsAttorney).slice(0, 3).map((user) => (
                    <Card key={user.id} className="border-l-4 border-l-orange-400">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{user.fullName}</h4>
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                New Request
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <div className="flex items-center">
                                <Scale className="h-3 w-3 mr-1" />
                                Case Type: {user.caseType}
                              </div>
                              <div className="flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                Location: {user.city}, {user.state}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.preferredPracticeAreas.map((area, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm">
                              Accept Request
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Your Current Pro Se Clients</h4>
                  <div className="text-sm text-gray-600">
                    You currently have 2 out of 5 available pro se client slots filled.
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setShowAttorneyPreview(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
