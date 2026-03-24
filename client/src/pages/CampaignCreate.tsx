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
import { ShareCampaignDialog } from "@/components/campaigns/ShareCampaignDialog";
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
  compensation?: string;
  deadline?: string;
  skills: string[];
  location?: string;
  referenceLink?: string;
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
    compensation: template?.defaultFields.compensation || "",
    deadline: "",
    skills: [],
    location: "",
    attachments: [],
    referenceLink: "",
    customFields: {},
    status: "active",
  });

  const [skillInput, setSkillInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<any>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Calculate progress
  const progress = useMemo(() => {
    if (!formData.title || !formData.description) {
      const filled = (formData.title ? 1 : 0) + (formData.description ? 1 : 0);
      return (filled / 2) * 50; // Progress 0, 25, or 50%
    }
    return 100; // Ready once title and description are filled
  }, [formData.title, formData.description]);
  
  const isFieldVisible = (fieldName: string) => {
    if (!template) return true;
    return (
      template.requiredFields.includes(fieldName) ||
      template.optionalFields.includes(fieldName)
    );
  };


  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const endpoint = isBusinessCampaign
        ? `/api/business/${businessId}/campaigns`
        : `/api/campaigns`;

      // Clean up optional fields: convert empty strings to undefined
      const cleanedData = { ...data };
      if (cleanedData.compensation === "") delete cleanedData.compensation;
      if (cleanedData.engagementType === "") delete cleanedData.engagementType;
      if (cleanedData.deadline === "") delete cleanedData.deadline;
      if (cleanedData.location === "") delete cleanedData.location;
      if (cleanedData.referenceLink === "") delete cleanedData.referenceLink;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cleanedData),
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
        // Show share dialog
        setShowShareDialog(true);
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

  // Removed local copyShareLink and shareOnPlatform as they are now in ShareCampaignDialog


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
                    <div className="space-y-3">
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
                      {formData.customFields?.[field.name] === "Other (Specify)" && (
                        <Input
                          placeholder="Please specify..."
                          value={formData.customFields?.[`${field.name}_other`] || ""}
                          onChange={(e) => updateCustomField(`${field.name}_other`, e.target.value)}
                          className="bg-white/5 border-white/10"
                        />
                      )}
                    </div>
                  ) : field.type === "multiselect" ? (
                    <div className="flex flex-wrap gap-2">
                      {field.options?.map((option) => {
                        const currentSelections = (formData.customFields?.[field.name] as string[]) || [];
                        const isSelected = currentSelections.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              const newSelections = isSelected
                                ? currentSelections.filter((item) => item !== option)
                                : [...currentSelections, option];
                              updateCustomField(field.name, newSelections);
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              isSelected
                                ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                                : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
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

              {(isFieldVisible("engagementType") || isFieldVisible("compensation")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {isFieldVisible("engagementType") && (
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
                          <SelectItem value="Internship">Internship</SelectItem>
                          <SelectItem value="Project-based">Project-based</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Partnership">Partnership</SelectItem>
                          <SelectItem value="Open / Flexible">Open / Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {isFieldVisible("compensation") && (
                    <div>
                      <Label htmlFor="compensation" className="text-sm">Compensation</Label>
                      <Select
                        value={formData.compensation}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, compensation: value }))
                        }
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Select compensation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Performance-based">Performance-based</SelectItem>
                          <SelectItem value="Equity">Equity</SelectItem>
                          <SelectItem value="Flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

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

              {isFieldVisible("skills") && (
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
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="referenceLink" className="text-sm">Reference Link (Optional)</Label>
                  <Input
                    id="referenceLink"
                    placeholder="https://..."
                    value={formData.referenceLink}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, referenceLink: e.target.value }))
                    }
                    className="bg-white/5 border-white/10 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="attachments" className="text-sm">Upload File (Optional)</Label>
                  <input
                    id="attachments"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData((prev) => ({
                            ...prev,
                            attachments: [reader.result as string]
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                  />
                  {formData.attachments.length > 0 && (
                    <p className="text-xs text-green-400/70 ml-1">File selected and ready to save</p>
                  )}
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
                  {formData.compensation && (
                    <div>
                      <span className="text-sm text-white/60">Compensation:</span>
                      <p className="font-medium">{formData.compensation}</p>
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

        {/* Share Dialog */}
        <ShareCampaignDialog
          campaignId={createdCampaign?._id}
          campaignTitle={createdCampaign?.title}
          open={showShareDialog}
          onOpenChange={(open) => {
            setShowShareDialog(open);
            if (!open) {
              // Redirect once closed
              const redirectPath = isBusinessCampaign ? `/business/${businessId}` : `/dashboard`;
              setLocation(redirectPath);
            }
          }}
        />
      </div>
    </div>
  );
}
