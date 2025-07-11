import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Edit2, Save, X } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  phone?: string;
  barNumber?: string;
  firm?: string;
  practiceAreas?: string[];
  bio?: string;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const response = await fetch("/api/user/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      return await apiRequest("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setEditForm(profile || {});
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCancel = () => {
    setEditForm({});
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile?.firstName, profile?.lastName, profile?.username)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {profile?.firstName && profile?.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : profile?.username || "User"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {profile?.title || "Attorney"}
                  </p>
                  <Badge variant="outline" className="mb-4">
                    {profile?.firm || "Independent Practice"}
                  </Badge>
                  <Button
                    onClick={handleEdit}
                    className="flex items-center gap-2"
                    disabled={isEditing}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                  {isEditing && (
                    <div className="ml-auto flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={editForm.firstName || ""}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="Enter first name"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {profile?.firstName || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={editForm.lastName || ""}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Enter last name"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {profile?.lastName || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email || ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter email address"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {profile?.email || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={editForm.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {profile?.phone || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    {isEditing ? (
                      <Input
                        id="title"
                        value={editForm.title || ""}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="e.g., Senior Partner, Associate"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {profile?.title || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barNumber">Bar Number</Label>
                    {isEditing ? (
                      <Input
                        id="barNumber"
                        value={editForm.barNumber || ""}
                        onChange={(e) => handleInputChange("barNumber", e.target.value)}
                        placeholder="Enter bar number"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {profile?.barNumber || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="firm">Law Firm</Label>
                  {isEditing ? (
                    <Input
                      id="firm"
                      value={editForm.firm || ""}
                      onChange={(e) => handleInputChange("firm", e.target.value)}
                      placeholder="Enter law firm name"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {profile?.firm || "Not specified"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <p className="text-gray-900 dark:text-white">
                    {profile?.username}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Username cannot be changed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}