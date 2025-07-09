
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit } from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const [, setLocation] = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  const { data: profile } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: isOpen,
  });

  const handleEditProfile = () => {
    onClose();
    setLocation('/profile');
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View your profile information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-legal-blue rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-semibold">
                {getInitials(profile?.firstName, profile?.lastName, user?.username)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {profile?.firstName && profile?.lastName 
                  ? `${profile.firstName} ${profile.lastName}`
                  : user?.username || "User"
                }
              </h3>
              <p className="text-gray-600">
                {profile?.title || "Attorney"}
              </p>
              <Badge variant="outline" className="mt-1">
                {profile?.firm || "Legal Department"}
              </Badge>
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
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span>{profile?.email || "Not specified"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span>{profile?.phone || "Not specified"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span>{profile?.office || "Not specified"}</span>
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bar Number:</span>
                  <span>{profile?.barNumber || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span>{profile?.experience || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialization:</span>
                  <span>{profile?.specialization || "Not specified"}</span>
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Username:</span>
                  <span>{user?.username || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span>{profile?.memberSince || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <Badge variant="secondary">Premium</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button onClick={handleEditProfile} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
