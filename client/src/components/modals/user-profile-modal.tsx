
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, Briefcase } from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  const { data: profile } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View and manage your profile information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-legal-blue rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {profile?.fullName || "Sarah Johnson"}
              </h3>
              <p className="text-gray-600">
                {profile?.title || "Senior Attorney"}
              </p>
              <Badge variant="outline" className="mt-1">
                {profile?.department || "Legal Department"}
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
                  <span>{profile?.email || "sarah.johnson@lawfirm.com"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span>{profile?.phone || "(555) 123-4567"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span>{profile?.office || "Office 425, Floor 4"}</span>
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
                  <span>{profile?.barNumber || "NY-123456"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Years of Experience:</span>
                  <span>{profile?.experience || "8 years"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialization:</span>
                  <span>{profile?.specialization || "Corporate Law"}</span>
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
                  <span>{user?.username || "sarah.johnson"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span>{profile?.memberSince || "January 2020"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <Badge variant="secondary">Premium</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1">
              Edit Profile
            </Button>
            <Button variant="outline" className="flex-1">
              Change Password
            </Button>
            <Button variant="outline" className="flex-1">
              Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
