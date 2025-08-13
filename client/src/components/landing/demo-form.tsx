import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, User, Mail, Building, Phone, Scale, MessageSquare } from "lucide-react";

interface DemoFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  practiceArea: string;
  firmSize: string;
  currentSoftware: string;
  specificNeeds: string;
  preferredTime: string;
}

interface DemoFormProps {
  onSubmit?: (data: DemoFormData) => void;
  onCancel?: () => void;
}

export default function DemoForm({ onSubmit, onCancel }: DemoFormProps) {
  const [formData, setFormData] = useState<DemoFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    practiceArea: '',
    firmSize: '',
    currentSoftware: '',
    specificNeeds: '',
    preferredTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in your name and email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit demo request');
      }

      const result = await response.json();
      
      toast({
        title: "Demo Scheduled!",
        description: "Thank you for your interest. Our team will contact you within 24 hours to schedule your personalized demo.",
      });

      if (onSubmit) {
        onSubmit(formData);
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        practiceArea: '',
        firmSize: '',
        currentSoftware: '',
        specificNeeds: '',
        preferredTime: ''
      });

    } catch (error) {
      console.error('Error submitting demo request:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your demo request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof DemoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Schedule Your Personalized Demo
        </CardTitle>
        <p className="text-gray-600 mt-2">
          See how Wizzered can transform your legal practice with AI-powered tools
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@lawfirm.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Law Firm / Company
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="ABC Law Firm"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Practice Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="practiceArea" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Primary Practice Area
              </Label>
              <Select
                value={formData.practiceArea}
                onValueChange={(value) => handleInputChange('practiceArea', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select practice area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil-litigation">Civil Litigation</SelectItem>
                  <SelectItem value="criminal-defense">Criminal Defense</SelectItem>
                  <SelectItem value="family-law">Family Law</SelectItem>
                  <SelectItem value="corporate-law">Corporate Law</SelectItem>
                  <SelectItem value="personal-injury">Personal Injury</SelectItem>
                  <SelectItem value="real-estate">Real Estate</SelectItem>
                  <SelectItem value="immigration">Immigration</SelectItem>
                  <SelectItem value="bankruptcy">Bankruptcy</SelectItem>
                  <SelectItem value="employment">Employment Law</SelectItem>
                  <SelectItem value="intellectual-property">Intellectual Property</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="firmSize" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Firm Size
              </Label>
              <Select
                value={formData.firmSize}
                onValueChange={(value) => handleInputChange('firmSize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select firm size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Solo Practitioner</SelectItem>
                  <SelectItem value="2-5">2-5 Attorneys</SelectItem>
                  <SelectItem value="6-15">6-15 Attorneys</SelectItem>
                  <SelectItem value="16-50">16-50 Attorneys</SelectItem>
                  <SelectItem value="51-100">51-100 Attorneys</SelectItem>
                  <SelectItem value="100+">100+ Attorneys</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentSoftware">Current Legal Software</Label>
              <Input
                id="currentSoftware"
                value={formData.currentSoftware}
                onChange={(e) => handleInputChange('currentSoftware', e.target.value)}
                placeholder="Clio, MyCase, PracticePanther, etc."
              />
            </div>
            <div>
              <Label htmlFor="preferredTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Preferred Demo Time
              </Label>
              <Select
                value={formData.preferredTime}
                onValueChange={(value) => handleInputChange('preferredTime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                  <SelectItem value="evening">Evening (5 PM - 7 PM)</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="specificNeeds" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Specific Needs or Questions
            </Label>
            <Textarea
              id="specificNeeds"
              value={formData.specificNeeds}
              onChange={(e) => handleInputChange('specificNeeds', e.target.value)}
              placeholder="What specific challenges are you facing? What features are most important to you?"
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Demo'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}