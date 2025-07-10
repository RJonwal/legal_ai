import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit, Save, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  const { data: profile } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: isOpen,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            User Profile
            {!isEditing ? (
              <Button
                onClick={handleEdit}
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Edit your profile information" : "View your profile information"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-legal-blue rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-semibold">
                {getInitials(
                  isEditing ? editForm.firstName : profile?.firstName, 
                  isEditing ? editForm.lastName : profile?.lastName, 
                  user?.username
                )}
              </span>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="firstName" className="text-xs">First Name</Label>
                    <Input
                      id="firstName"
                      value={editForm.firstName || ""}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="First name"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editForm.lastName || ""}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Last name"
                      className="h-8"
                    />
                  </div>
                </div>
              ) : (
                <h3 className="text-xl font-semibold text-gray-900">
                  {profile?.firstName && profile?.lastName 
                    ? `${profile.firstName} ${profile.lastName}`
                    : user?.username || "User"
                  }
                </h3>
              )}

              {isEditing ? (
                <div className="mt-2">
                  <Label htmlFor="title" className="text-xs">Title</Label>
                  <Input
                    id="title"
                    value={editForm.title || ""}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Senior Partner"
                    className="h-8"
                  />
                </div>
              ) : (
                <p className="text-gray-600 mt-1">
                  {profile?.title || "Attorney"}
                </p>
              )}

              {isEditing ? (
                <div className="mt-2">
                  <Label htmlFor="firm" className="text-xs">Law Firm</Label>
                  <Input
                    id="firm"
                    value={editForm.firm || ""}
                    onChange={(e) => handleInputChange("firm", e.target.value)}
                    placeholder="Law firm name"
                    className="h-8"
                  />
                </div>
              ) : (
                <Badge variant="outline" className="mt-2">
                  {profile?.firm || "Legal Department"}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Contact Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">Email:</span>
                  </div>
                  {isEditing ? (
                    <Input
                      value={editForm.email || ""}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Email address"
                      className="h-8 max-w-xs"
                      type="email"
                    />
                  ) : (
                    <span className="text-sm">{profile?.email || "Not specified"}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">Phone:</span>
                  </div>
                  {isEditing ? (
                    <Input
                      value={editForm.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Phone number"
                      className="h-8 max-w-xs"
                      type="tel"
                    />
                  ) : (
                    <span className="text-sm">{profile?.phone || "Not specified"}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Professional Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bar Number:</span>
                  {isEditing ? (
                    <Input
                      value={editForm.barNumber || ""}
                      onChange={(e) => handleInputChange("barNumber", e.target.value)}
                      placeholder="Bar number"
                      className="h-8 max-w-xs"
                    />
                  ) : (
                    <span className="text-sm">{profile?.barNumber || "Not specified"}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Username:</span>
                  <span className="text-sm">{user?.username || "Not specified"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Account Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Member Since:</span>
                  <span className="text-sm">{profile?.memberSince || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Type:</span>
                  <Badge variant="secondary">Premium</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}