import { useState, useEffect, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, Eye, Save, Send, Share2, Copy, CheckCircle } from "lucide-react";
import { getCampaignTemplateById } from "@/lib/campaignTemplates";
import type { CampaignTemplate } from "@/lib/campaignTemplates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CampaignFormData {
  title: string;
  description: string;
  category: string;
  templateId?: string;
  targetProfiles: string[];
  engagementType?: string;
  budget?: string;
  deadline?: string;
  skills: string[];
  location?: string;
  attachments: string[];
  customFields?: Record<string, any>;
  status: "draft" | "active";
}

export default function CampaignCreate() {
  const [location, setLocation] = useLocation();
  const [, businessParams] = useRoute("/business/:businessId/campaigns/create");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Determine if this is a business or individual campaign
  const { isBusinessCampaign, businessId } = useMemo(() => {
    const isBusiness = location.includes('/business/');
    const bId = businessParams?.businessId;
    return {
      isBusinessCampaign: isBusiness && bId,
      businessId: bId
    };
  }, [location, businessParams]);

  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get("template");

  const template: CampaignTemplate | undefined = templateId
    ? getCampaignTemplateById(templateId)
    : undefined;

  // Initialize form with template defaults
  const [formData, setFormData] = useState<CampaignFormData>({
    title: template?.title || "",
    description: "",
    category: template?.category || "Other",
    templateId: templateId || undefined,
    targetProfiles: [],
    engagementType: template?.defaultFields.engagementType,
    budget: "",
    deadline: "",
    skills: [],
    location: "",
    attachments: [],
    customFields: {},
    status: "draft",
  });

  const [skillInput, setSkillInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<any>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Calculate progress
  const progress = useMemo(() => {
    const requiredFields = template?.requiredFields || ["title", "description"];
    const filled = requiredFields.filter((field) => {
      if (field === "skills") return formData.skills.length > 0;
      if (field === "targetProfiles") return formData.targetProfiles.length > 0;
      return !!formData[field as keyof CampaignFormData];
    }).length;

    return (filled / requiredFields.length) * 100;
  }, [formData, template]);


  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const endpoint = isBusinessCampaign
        ? `/api/business/${businessId}/campaigns`
        : `/api/campaigns`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create campaign");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (isBusinessCampaign) {
        queryClient.invalidateQueries({ queryKey: ["campaigns", businessId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["user-campaigns"] });
      }
      setCreatedCampaign(data);

      if (formData.status === "active") {
        // Show success dialog with shareable link
        setShowSuccessDialog(true);
      } else {
        toast({
          title: "Draft Saved!",
          description: "Your campaign has been saved as a draft.",
        });
        const redirectPath = isBusinessCampaign ? `/business/${businessId}` : `/dashboard`;
        setLocation(redirectPath);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (status: "draft" | "active") => {
    setFormData((prev) => ({ ...prev, status }));
    createCampaignMutation.mutate({ ...formData, status });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const updateCustomField = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [name]: value,
      },
    }));
  };

  const copyShareLink = () => {
    if (createdCampaign) {
      const shareUrl = `${window.location.origin}/c/${createdCampaign._id}`;
      navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const shareOnPlatform = (platform: string) => {
    if (!createdCampaign) return;

    const shareUrl = `${window.location.origin}/c/${createdCampaign._id}`;
    const text = `Check out this opportunity: ${createdCampaign.title}`;

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + "\n" + shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };


  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation(isBusinessCampaign ? `/business/${businessId}` : `/dashboard`)}
            className="mb-4 text-white/60 hover:text-white -ml-2 sm:ml-0"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>

          {template && (
            <div className="flex items-start gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                {template.icon && <template.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{template.title}</h1>
                <p className="text-white/60 text-xs sm:text-sm">{template.description}</p>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-white/60">
                {progress < 100 ? "Complete your campaign" : "Ready to launch!"}
              </span>
              <span className="text-xs sm:text-sm font-medium text-blue-400">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <p className="text-xs text-white/40">Launch in 30 seconds ⚡</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-base sm:text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              <div>
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Hiring Senior React Developer"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the opportunity in detail..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="bg-white/5 border-white/10"
                  rows={5}
                  required
                />
              </div>

              {/* Custom Template Fields */}
              {template?.customFields?.map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.type === "select" ? (
                    <Select
                      value={formData.customFields?.[field.name] || ""}
                      onValueChange={(value) => updateCustomField(field.name, value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder={field.placeholder || "Select..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      value={formData.customFields?.[field.name] || ""}
                      onChange={(e) => updateCustomField(field.name, e.target.value)}
                      className="bg-white/5 border-white/10"
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData.customFields?.[field.name] || ""}
                      onChange={(e) => updateCustomField(field.name, e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  )}
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="engagementType" className="text-sm">Engagement Type</Label>
                  <Select
                    value={formData.engagementType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, engagementType: value }))
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Project-based">Project-based</SelectItem>
                      <SelectItem value="Equity">Equity</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="budget" className="text-sm">Budget</Label>
                  <Input
                    id="budget"
                    placeholder="e.g., $5,000 - $8,000"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, budget: e.target.value }))
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="deadline" className="text-sm">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Remote, San Francisco, Hybrid"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="skills" className="text-sm">Skills Required</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="skills"
                    placeholder="Type a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="bg-white/5 border-white/10 text-sm"
                  />
                  <Button type="button" onClick={handleAddSkill} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-sm bg-blue-500/20 border border-blue-500/30 text-blue-300 flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="bg-white/5 border-white/10 w-full sm:w-auto"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>

            <div className="flex gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit("draft")}
                disabled={createCampaignMutation.isPending}
                className="bg-white/5 border-white/10 flex-1 sm:flex-initial"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Save Draft</span>
                <span className="sm:hidden">Draft</span>
              </Button>

              <Button
                type="button"
                onClick={() => handleSubmit("active")}
                disabled={progress < 100 || createCampaignMutation.isPending}
                className="bg-[#E63946] hover:bg-[#E63946]/90 flex-1 sm:flex-initial"
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{createCampaignMutation.isPending ? "Publishing..." : "Publish Campaign"}</span>
                <span className="sm:hidden">{createCampaignMutation.isPending ? "..." : "Publish"}</span>
              </Button>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Campaign Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold text-xl mb-2">{formData.title || "Untitled Campaign"}</h3>
                  <p className="text-white/60 whitespace-pre-wrap">
                    {formData.description || "No description provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  {formData.engagementType && (
                    <div>
                      <span className="text-sm text-white/60">Type:</span>
                      <p className="font-medium">{formData.engagementType}</p>
                    </div>
                  )}
                  {formData.budget && (
                    <div>
                      <span className="text-sm text-white/60">Budget:</span>
                      <p className="font-medium">{formData.budget}</p>
                    </div>
                  )}
                  {formData.location && (
                    <div>
                      <span className="text-sm text-white/60">Location:</span>
                      <p className="font-medium">{formData.location}</p>
                    </div>
                  )}
                  {formData.deadline && (
                    <div>
                      <span className="text-sm text-white/60">Deadline:</span>
                      <p className="font-medium">{new Date(formData.deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {formData.skills.length > 0 && (
                  <div>
                    <span className="text-sm text-white/60 mb-2 block">Skills:</span>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-full text-sm bg-blue-500/20 border border-blue-500/30 text-blue-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </form>

        {/* Success Dialog with Shareable Link */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="bg-black border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Campaign Published Successfully!
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Your opportunity is now live. Share it to reach more people.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Shareable Link */}
              <div>
                <Label className="text-sm text-white/60 mb-2 block">Shareable Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={createdCampaign ? `${window.location.origin}/c/${createdCampaign._id}` : ""}
                    readOnly
                    className="bg-white/5 border-white/10 font-mono text-sm"
                  />
                  <Button
                    onClick={copyShareLink}
                    variant="outline"
                    className="bg-white/5 border-white/10"
                  >
                    {linkCopied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div>
                <Label className="text-sm text-white/60 mb-3 block">Share on Social Media</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    onClick={() => shareOnPlatform("whatsapp")}
                    variant="outline"
                    className="bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </Button>

                  <Button
                    onClick={() => shareOnPlatform("twitter")}
                    variant="outline"
                    className="bg-blue-400/10 border-blue-400/30 hover:bg-blue-400/20"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </Button>

                  <Button
                    onClick={() => shareOnPlatform("linkedin")}
                    variant="outline"
                    className="bg-blue-600/10 border-blue-600/30 hover:bg-blue-600/20"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </Button>

                  <Button
                    onClick={() => shareOnPlatform("facebook")}
                    variant="outline"
                    className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    setLocation(isBusinessCampaign ? `/business/${businessId}` : `/dashboard`);
                  }}
                  className="bg-white/5 border-white/10"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => {
                    if (createdCampaign) {
                      window.open(`/c/${createdCampaign._id}`, "_blank");
                    }
                  }}
                  className="bg-[#E63946] hover:bg-[#E63946]/90"
                >
                  View Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
