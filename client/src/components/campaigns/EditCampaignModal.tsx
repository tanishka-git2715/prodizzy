import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";
import { getCampaignTemplateById } from "@/lib/campaignTemplates";

interface EditCampaignModalProps {
  campaign: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId?: string;
}

export function EditCampaignModal({
  campaign,
  open,
  onOpenChange,
  businessId,
}: EditCampaignModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const template = campaign?.templateId
    ? getCampaignTemplateById(campaign.templateId)
    : undefined;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    engagementType: "",
    compensation: "",
    deadline: "",
    skills: [] as string[],
    location: "",
    referenceLink: "",
    customFields: {} as Record<string, any>,
  });

  const [skillInput, setSkillInput] = useState("");

  // Sync form when campaign changes
  useEffect(() => {
    if (campaign && open) {
      setFormData({
        title: campaign.title || "",
        description: campaign.description || "",
        engagementType: campaign.engagementType || "",
        compensation: campaign.compensation || "",
        deadline: campaign.deadline
          ? campaign.deadline.slice(0, 10) // normalize to YYYY-MM-DD
          : "",
        skills: campaign.skills || [],
        location: campaign.location || "",
        referenceLink: campaign.referenceLink || "",
        customFields: campaign.customFields || {},
      });
      setSkillInput("");
    }
  }, [campaign, open]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const cleaned: any = { ...data };
      if (!cleaned.engagementType) delete cleaned.engagementType;
      if (!cleaned.compensation) delete cleaned.compensation;
      if (!cleaned.deadline) delete cleaned.deadline;
      if (!cleaned.location) delete cleaned.location;
      if (!cleaned.referenceLink) delete cleaned.referenceLink;

      const res = await fetch(`/api/campaigns/${campaign._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cleaned),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update campaign");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant caches
      if (businessId) {
        queryClient.invalidateQueries({ queryKey: ["campaigns", businessId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["user-campaigns"] });
      }
      queryClient.invalidateQueries({ queryKey: ["campaigns-discover"] });
      queryClient.invalidateQueries({ queryKey: ["public-campaign", campaign._id] });

      toast({ title: "Campaign updated successfully!" });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!formData.description.trim()) {
      toast({ title: "Description is required", variant: "destructive" });
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleAddSkill = () => {
    const s = skillInput.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, s] }));
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
      customFields: { ...prev.customFields, [name]: value },
    }));
  };

  const isFieldVisible = (fieldName: string) => {
    if (!template) return true;
    return (
      template.requiredFields.includes(fieldName) ||
      template.optionalFields.includes(fieldName)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto bg-zinc-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Campaign</DialogTitle>
          <DialogDescription className="text-white/50">
            Update your campaign details. Changes will go live immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Title */}
          <div>
            <Label htmlFor="edit-title">Campaign Title *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="bg-white/5 border-white/10 mt-1"
              placeholder="e.g., Hiring Sales Intern at Panha"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={6}
              className="bg-white/5 border-white/10 mt-1 resize-none"
              placeholder="Describe the opportunity in detail..."
            />
          </div>

          {/* Template custom fields */}
          {template?.customFields?.map((field) => (
            <div key={field.name}>
              <Label htmlFor={`edit-${field.name}`}>{field.label}</Label>
              {field.type === "select" ? (
                <div className="space-y-2 mt-1">
                  <Select
                    value={formData.customFields?.[field.name] || ""}
                    onValueChange={(value) =>
                      updateCustomField(field.name, value)
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue
                        placeholder={field.placeholder || "Select..."}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.customFields?.[field.name] ===
                    "Other (Specify)" && (
                    <Input
                      placeholder="Please specify..."
                      value={
                        formData.customFields?.[`${field.name}_other`] || ""
                      }
                      onChange={(e) =>
                        updateCustomField(
                          `${field.name}_other`,
                          e.target.value
                        )
                      }
                      className="bg-white/5 border-white/10"
                    />
                  )}
                </div>
              ) : field.type === "multiselect" ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {field.options?.map((option) => {
                    const currentSelections =
                      (formData.customFields?.[field.name] as string[]) || [];
                    const isSelected = currentSelections.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? currentSelections.filter((i) => i !== option)
                            : [...currentSelections, option];
                          updateCustomField(field.name, next);
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          isSelected
                            ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : field.type === "textarea" ? (
                <Textarea
                  id={`edit-${field.name}`}
                  placeholder={field.placeholder}
                  value={formData.customFields?.[field.name] || ""}
                  onChange={(e) =>
                    updateCustomField(field.name, e.target.value)
                  }
                  className="bg-white/5 border-white/10 mt-1"
                  rows={3}
                />
              ) : (
                <Input
                  id={`edit-${field.name}`}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData.customFields?.[field.name] || ""}
                  onChange={(e) =>
                    updateCustomField(field.name, e.target.value)
                  }
                  className="bg-white/5 border-white/10 mt-1"
                />
              )}
            </div>
          ))}

          {/* Engagement Type & Compensation */}
          {(isFieldVisible("engagementType") ||
            isFieldVisible("compensation")) && (
            <div className="grid grid-cols-2 gap-4">
              {isFieldVisible("engagementType") && (
                <div>
                  <Label>Engagement Type</Label>
                  <Select
                    value={formData.engagementType}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, engagementType: v }))
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Project-based">
                        Project-based
                      </SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Open / Flexible">
                        Open / Flexible
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {isFieldVisible("compensation") && (
                <div>
                  <Label>Compensation</Label>
                  <Select
                    value={formData.compensation}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, compensation: v }))
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                      <SelectValue placeholder="Select compensation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Performance-based">
                        Performance-based
                      </SelectItem>
                      <SelectItem value="Equity">Equity</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Deadline & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-deadline">Deadline</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                }
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                placeholder="e.g., Remote, Hybrid"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="bg-white/5 border-white/10 mt-1"
              />
            </div>
          </div>

          {/* Skills */}
          {isFieldVisible("skills") && (
            <div>
              <Label>Skills Required</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="bg-white/5 border-white/10 text-sm"
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-white/5"
                >
                  Add
                </Button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-sm bg-blue-500/20 border border-blue-500/30 text-blue-300 flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reference Link */}
          <div>
            <Label htmlFor="edit-reflink">Reference Link (Optional)</Label>
            <Input
              id="edit-reflink"
              placeholder="https://..."
              value={formData.referenceLink}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  referenceLink: e.target.value,
                }))
              }
              className="bg-white/5 border-white/10 mt-1 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/5 border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
