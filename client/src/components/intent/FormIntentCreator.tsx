import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";

interface FormIntentCreatorProps {
  open: boolean;
  onClose: () => void;
  profileType: string;
  onSubmit: (intentData: any) => void;
  initialData?: any;
}

const INTENT_TYPES_BY_PROFILE: Record<string, { value: string; label: string }[]> = {
  startup: [
    { value: "validation", label: "Idea Validation" },
    { value: "hiring", label: "Hiring" },
    { value: "partnerships", label: "Partnerships" },
    { value: "promotions", label: "Promotions" },
    { value: "fundraising", label: "Fundraising" }
  ],
  partner: [
    { value: "clients", label: "Get Clients" },
    { value: "dealflow", label: "Deal Flow" },
    { value: "partnerships", label: "Partnerships" }
  ],
  individual: [
    { value: "jobs", label: "Find Jobs" },
    { value: "freelance", label: "Freelance Work" },
    { value: "internship", label: "Internships" },
    { value: "collaboration", label: "Collaborations" }
  ]
};

export function FormIntentCreator({ open, onClose, profileType, onSubmit, initialData }: FormIntentCreatorProps) {
  const [intentType, setIntentType] = useState(initialData?.intent_type || "");
  const [metadata, setMetadata] = useState(initialData?.metadata || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!intentType) return;

    onSubmit({
      profile_type: profileType,
      intent_type: intentType,
      metadata
    });

    handleReset();
  };

  const handleReset = () => {
    setIntentType("");
    setMetadata({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const updateMetadata = (key: string, value: any) => {
    setMetadata((prev: any) => ({ ...prev, [key]: value }));
  };

  const renderFormFields = () => {
    switch (intentType) {
      case "hiring":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="role">Role/Position *</Label>
              <Input
                id="role"
                placeholder="e.g., Frontend Developer"
                value={metadata.role || ""}
                onChange={(e) => updateMetadata("role", e.target.value)}
                className="bg-white/5 border-white/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hiring_type">Hiring Type</Label>
              <Select value={metadata.hiring_type || ""} onValueChange={(v) => updateMetadata("hiring_type", v)}>
                <SelectTrigger className="bg-white/5 border-white/20">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_range">Budget Range</Label>
              <Input
                id="budget_range"
                placeholder="e.g., ₹40-50k/month"
                value={metadata.budget_range || ""}
                onChange={(e) => updateMetadata("budget_range", e.target.value)}
                className="bg-white/5 border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select value={metadata.experience_level || ""} onValueChange={(v) => updateMetadata("experience_level", v)}>
                <SelectTrigger className="bg-white/5 border-white/20">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="key_skills">Key Skills (comma separated)</Label>
              <Input
                id="key_skills"
                placeholder="e.g., React, TypeScript, Node.js"
                value={metadata.key_skills?.join(", ") || ""}
                onChange={(e) => updateMetadata("key_skills", e.target.value.split(",").map((s: string) => s.trim()))}
                className="bg-white/5 border-white/20"
              />
            </div>
          </>
        );

      case "fundraising":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="capital_amount">Amount Raising *</Label>
              <Input
                id="capital_amount"
                placeholder="e.g., ₹50 lakhs"
                value={metadata.capital_amount || ""}
                onChange={(e) => updateMetadata("capital_amount", e.target.value)}
                className="bg-white/5 border-white/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Funding Stage</Label>
              <Select value={metadata.stage || ""} onValueChange={(v) => updateMetadata("stage", v)}>
                <SelectTrigger className="bg-white/5 border-white/20">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Series A">Series A</SelectItem>
                  <SelectItem value="Series B">Series B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="use_of_funds">Use of Funds</Label>
              <Textarea
                id="use_of_funds"
                placeholder="What will you use the funds for?"
                value={metadata.use_of_funds || ""}
                onChange={(e) => updateMetadata("use_of_funds", e.target.value)}
                className="bg-white/5 border-white/20 resize-none"
                rows={3}
              />
            </div>
          </>
        );

      case "partnerships":
      case "promotions":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="partner_type">What type of partner?</Label>
              <Input
                id="partner_type"
                placeholder="e.g., Marketing Agency, Tech Partner"
                value={metadata.partner_type || ""}
                onChange={(e) => updateMetadata("partner_type", e.target.value)}
                className="bg-white/5 border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you're looking for..."
                value={metadata.description || ""}
                onChange={(e) => updateMetadata("description", e.target.value)}
                className="bg-white/5 border-white/20 resize-none"
                rows={4}
              />
            </div>
          </>
        );

      case "jobs":
      case "freelance":
      case "internship":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="preferred_roles">Preferred Roles *</Label>
              <Input
                id="preferred_roles"
                placeholder="e.g., Frontend Developer, Full Stack"
                value={metadata.preferred_roles || ""}
                onChange={(e) => updateMetadata("preferred_roles", e.target.value)}
                className="bg-white/5 border-white/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_pay">Expected Compensation</Label>
              <Input
                id="expected_pay"
                placeholder="e.g., ₹50-60k/month"
                value={metadata.expected_pay || ""}
                onChange={(e) => updateMetadata("expected_pay", e.target.value)}
                className="bg-white/5 border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select value={metadata.availability || ""} onValueChange={(v) => updateMetadata("availability", v)}>
                <SelectTrigger className="bg-white/5 border-white/20">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="2_weeks">2 Weeks</SelectItem>
                  <SelectItem value="1_month">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case "clients":
      case "dealflow":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="target_profile">Target Profile</Label>
              <Input
                id="target_profile"
                placeholder="e.g., SaaS startups, Seed stage"
                value={metadata.target_profile || ""}
                onChange={(e) => updateMetadata("target_profile", e.target.value)}
                className="bg-white/5 border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_type">Service/Investment Type</Label>
              <Input
                id="service_type"
                placeholder="e.g., Marketing, AI Automation"
                value={metadata.service_type || ""}
                onChange={(e) => updateMetadata("service_type", e.target.value)}
                className="bg-white/5 border-white/20"
              />
            </div>
          </>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you're looking for..."
              value={metadata.description || ""}
              onChange={(e) => updateMetadata("description", e.target.value)}
              className="bg-white/5 border-white/20 resize-none"
              rows={4}
            />
          </div>
        );
    }
  };

  const availableIntents = INTENT_TYPES_BY_PROFILE[profileType] || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-black border-white/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Intent
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Fill in the details below to create your intent
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intent_type">What do you need? *</Label>
            <Select value={intentType} onValueChange={setIntentType} required>
              <SelectTrigger className="bg-white/5 border-white/20">
                <SelectValue placeholder="Select intent type" />
              </SelectTrigger>
              <SelectContent>
                {availableIntents.map((intent) => (
                  <SelectItem key={intent.value} value={intent.value}>
                    {intent.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {intentType && renderFormFields()}

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600" disabled={!intentType}>
              Create Intent
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
