import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Settings, ArrowLeft, Mail, Shield, UserCheck, UserX, Crown, Rocket, Plus, TrendingUp, Eye, Calendar, Share2, Copy, BadgeCheck, Edit2, Building2, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BUSINESS_TYPES = ["Startup", "Agency", "Enterprise", "Institution"];
const INDUSTRIES = [
  "Software & AI",
  "E-commerce & Retail",
  "Finance & Payments",
  "Healthcare & Wellness",
  "Education & Training",
  "Food & Beverage",
  "Transportation & Delivery",
  "Real Estate & Construction",
  "Marketing & Advertising",
  "Energy & Sustainability",
  "Other (Specify)"
];
import type { Business, TeamMember } from "@shared/schema";
import { ApplicationsList } from "@/components/applications/ApplicationsList";
import { CampaignsSection } from "@/components/campaigns/CampaignsSection";

export default function BusinessDashboard() {
  const [, params] = useRoute("/business/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const businessId = params?.id;

  const { data: business, isLoading: loadingBusiness, refetch: refetchBusiness } = useQuery<Business>({
    queryKey: ["business", businessId],
    queryFn: async () => {
      const response = await fetch(`/api/business/${businessId}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to load business");
      }
      return response.json();
    },
    enabled: !!businessId
  });

  const [showEditBusiness, setShowEditBusiness] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editFormData, setEditFormData] = useState({
    business_name: "",
    business_type: "",
    industry: [] as string[],
    website: "",
    linkedin_url: "",
    description: "",
    team_size: "",
    location: "",
    founded_year: new Date().getFullYear(),
    business_type_other: "",
    industry_other: ""
  });

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }
    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const res = await fetch(`/api/business/${businessId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ logo_url: base64 })
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to update logo");
        }
        
        toast({ title: "Logo updated successfully!" });
        refetchBusiness();
      } catch (error: any) {
        toast({ 
          title: "Upload Failed", 
          description: error.message || "Failed to upload logo",
          variant: "destructive" 
        });
      } finally {
        setUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (business && showEditBusiness) {
      setEditFormData({
        business_name: business.business_name || "",
        business_type: BUSINESS_TYPES.includes(business.business_type || "") ? business.business_type : (business.business_type ? "Other (Specify)" : ""),
        industry: (business.industry || []).map(ind => INDUSTRIES.includes(ind) ? ind : "Other (Specify)"),
        website: business.website || "",
        linkedin_url: business.linkedin_url || "",
        description: business.description || "",
        team_size: business.team_size || "",
        location: business.location || "",
        founded_year: business.founded_year || new Date().getFullYear(),
        business_type_other: business.business_type && !BUSINESS_TYPES.includes(business.business_type) ? business.business_type : "",
        industry_other: (business.industry || []).find(ind => !INDUSTRIES.includes(ind)) || ""
      });
    }
  }, [business, showEditBusiness]);

  const handleEditInputChange = (field: string, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditIndustryToggle = (industry: string) => {
    setEditFormData(prev => ({
      ...prev,
      industry: prev.industry.includes(industry)
        ? prev.industry.filter(i => i !== industry)
        : [...prev.industry, industry]
    }));
  };

  const handleEditSubmit = async () => {
    if (!editFormData.business_name.trim()) {
      toast({ title: "Business name is required", variant: "destructive" });
      return;
    }
    if (!editFormData.business_type) {
      toast({ title: "Business type is required", variant: "destructive" });
      return;
    }
    if (editFormData.business_type === "Other (Specify)" && !editFormData.business_type_other.trim()) {
      toast({ title: "Please specify business type", variant: "destructive" });
      return;
    }
    if (editFormData.industry.length === 0) {
      toast({ title: "Please select at least one industry", variant: "destructive" });
      return;
    }
    if (editFormData.industry.includes("Other (Specify)") && !editFormData.industry_other.trim()) {
      toast({ title: "Please specify your industry", variant: "destructive" });
      return;
    }
    if (!editFormData.location.trim()) {
      toast({ title: "Location is required", variant: "destructive" });
      return;
    }
    if (!editFormData.description.trim()) {
      toast({ title: "Description is required", variant: "destructive" });
      return;
    }
    if (!editFormData.website.trim()) {
      toast({ title: "Website URL is required", variant: "destructive" });
      return;
    }
    if (!editFormData.linkedin_url.trim()) {
      toast({ title: "LinkedIn URL is required", variant: "destructive" });
      return;
    }
    if (!editFormData.team_size.trim()) {
      toast({ title: "Team size is required", variant: "destructive" });
      return;
    }
    if (!editFormData.founded_year) {
      toast({ title: "Founded year is required", variant: "destructive" });
      return;
    }
    
    try {
      setSubmittingEdit(true);
      const formatUrl = (url?: string) => {
        if (!url || !url.trim()) return undefined;
        let formatted = url.trim();
        if (!/^https?:\/\//i.test(formatted)) {
          formatted = `https://${formatted}`;
        }
        return formatted;
      };

      const payload = {
        business_name: editFormData.business_name,
        business_type: editFormData.business_type === "Other (Specify)" ? editFormData.business_type_other : editFormData.business_type,
        industry: editFormData.industry.map(i => i === "Other (Specify)" ? editFormData.industry_other : i),
        website: formatUrl(editFormData.website) || "",
        linkedin_url: formatUrl(editFormData.linkedin_url) || "",
        description: editFormData.description || "",
        team_size: editFormData.team_size || "",
        location: editFormData.location || "",
        founded_year: editFormData.founded_year || undefined
      };

      const response = await fetch(`/api/business/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update business");
      }

      toast({
        title: "Success",
        description: "Business profile updated successfully"
      });

      setShowEditBusiness(false);
      refetchBusiness();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update business",
        variant: "destructive"
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const { data: members, isLoading: loadingMembers, refetch: refetchMembers } = useQuery<TeamMember[]>({
    queryKey: ["business-members", businessId],
    queryFn: async () => {
      const response = await fetch(`/api/business/${businessId}/members`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to load team members");
      }
      return response.json();
    },
    enabled: !!businessId
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery<any[]>({
    queryKey: ["campaigns", businessId],
    queryFn: async () => {
      const response = await fetch(`/api/business/${businessId}/campaigns`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to load campaigns");
      }
      return response.json();
    },
    enabled: !!businessId
  });

  const { data: campaignStats } = useQuery<any>({
    queryKey: ["campaign-stats", businessId],
    queryFn: async () => {
      const response = await fetch(`/api/business/${businessId}/campaigns/stats`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to load campaign stats");
      }
      return response.json();
    },
    enabled: !!businessId
  });

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [selectedCampaignForApps, setSelectedCampaignForApps] = useState<string | null>(null);


  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }

    try {
      setInviting(true);

      const response = await fetch(`/api/business/${businessId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: inviteEmail,
          role: "member"
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send invite");
      }

      toast({
        title: "Invite sent!",
        description: `An invitation has been sent to ${inviteEmail}`
      });

      setInviteEmail("");
      setShowInviteForm(false);
      refetchMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setInviting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      owner: { icon: Crown, color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/20" },
      admin: { icon: Shield, color: "text-[#E63946] bg-[#E63946]/15 border-[#E63946]/20" },
      member: { icon: UserCheck, color: "text-white/70 bg-white/5 border-white/10" }
    };
    const badge = badges[role as keyof typeof badges] || badges.member;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === "accepted") {
      return <span className="text-xs text-green-400">Active</span>;
    }
    if (status === "pending") {
      return <span className="text-xs text-yellow-400">Pending</span>;
    }
    return <span className="text-xs text-red-400">Declined</span>;
  };

  if (loadingBusiness) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/60">Loading business...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Business not found</h2>
          <Button onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              className="mb-4 text-white/60 hover:text-white p-0 h-auto hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center gap-4">
              <label
                htmlFor="logo-upload"
                className="relative w-16 h-16 rounded-xl bg-white/5 border border-white/10 shrink-0 cursor-pointer group"
                title="Click to upload logo"
              >
                <div className="w-full h-full rounded-xl overflow-hidden">
                  {business.logo_url ? (
                    <img src={business.logo_url} alt={business.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                </div>
                
                {/* Bottom right short icon */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-[#E63946] border-2 border-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {uploadingLogo ? (
                    <div className="w-3 h-3 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-white" />
                  )}
                </div>

                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                />
              </label>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold">{business.business_name}</h1>
                  {business.approved && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span>{business.business_type}</span>
                  {business.location && (
                    <>
                      <span>•</span>
                      <span>{business.location}</span>
                    </>
                  )}
                  {!business.approved && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-400">Pending Approval</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setLocation(`/business/${businessId}/campaigns/new`)}
            className="bg-[#E63946] hover:bg-[#E63946]/90 shadow-[0_0_20px_-5px_rgba(230,57,70,0.4)] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Launch campaign
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Business Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Business Information
                </CardTitle>
                <Dialog open={showEditBusiness} onOpenChange={setShowEditBusiness}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] border-white/10 bg-zinc-950 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Business Information</DialogTitle>
                      <DialogDescription className="text-white/60">Update your company profile details here.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4 text-left">
                      <div>
                        <Label htmlFor="business_name">Business Name *</Label>
                        <Input
                          id="business_name"
                          value={editFormData.business_name}
                          onChange={(e) => handleEditInputChange("business_name", e.target.value)}
                          className="bg-white/5 border-white/10 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="business_type">Business Type *</Label>
                        <Select
                          value={editFormData.business_type}
                          onValueChange={(value) => handleEditInputChange("business_type", value)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            {BUSINESS_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                            <SelectItem value="Other (Specify)">Other (Specify)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {editFormData.business_type === "Other (Specify)" && (
                        <div>
                          <Label htmlFor="business_type_other">Specify Business Type *</Label>
                          <Input
                            id="business_type_other"
                            value={editFormData.business_type_other}
                            onChange={(e) => handleEditInputChange("business_type_other", e.target.value)}
                            className="bg-white/5 border-white/10 mt-1"
                          />
                        </div>
                      )}
                      <div>
                        <Label>Industry *</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {INDUSTRIES.map(industry => (
                            <button
                              key={industry}
                              type="button"
                              onClick={() => handleEditIndustryToggle(industry)}
                              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                editFormData.industry.includes(industry)
                                  ? 'bg-[#E63946]/15 border-[#E63946]/30 text-[#E63946]'
                                  : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                              }`}
                            >
                              {industry}
                            </button>
                          ))}
                        </div>
                      </div>
                      {editFormData.industry.includes("Other (Specify)") && (
                        <div>
                          <Label htmlFor="industry_other">Specify Industry *</Label>
                          <Input
                            id="industry_other"
                            value={editFormData.industry_other}
                            onChange={(e) => handleEditInputChange("industry_other", e.target.value)}
                            placeholder="e.g. Space Tech, AgriTech"
                            className="bg-white/5 border-white/10 mt-1"
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          value={editFormData.location}
                          onChange={(e) => handleEditInputChange("location", e.target.value)}
                          className="bg-white/5 border-white/10 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={editFormData.description}
                          onChange={(e) => handleEditInputChange("description", e.target.value)}
                          rows={4}
                          className="bg-white/5 border-white/10 mt-1 resize-none"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website *</Label>
                        <Input
                          id="website"
                          value={editFormData.website}
                          onChange={(e) => handleEditInputChange("website", e.target.value)}
                          placeholder="https://example.com"
                          className="bg-white/5 border-white/10 mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin_url">LinkedIn URL *</Label>
                        <Input
                          id="linkedin_url"
                          value={editFormData.linkedin_url}
                          onChange={(e) => handleEditInputChange("linkedin_url", e.target.value)}
                          placeholder="https://linkedin.com/company/..."
                          className="bg-white/5 border-white/10 mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="team_size">Team Size *</Label>
                          <Input
                            id="team_size"
                            value={editFormData.team_size}
                            onChange={(e) => handleEditInputChange("team_size", e.target.value)}
                            placeholder="e.g. 1-10"
                            className="bg-white/5 border-white/10 mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="founded_year">Founded Year *</Label>
                          <Input
                            id="founded_year"
                            type="number"
                            value={editFormData.founded_year || ""}
                            onChange={(e) => handleEditInputChange("founded_year", parseInt(e.target.value) || undefined)}
                            className="bg-white/5 border-white/10 mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowEditBusiness(false)} className="bg-white/5 border-white/10">
                          Cancel
                        </Button>
                        <Button onClick={handleEditSubmit} disabled={submittingEdit} className="bg-[#E63946] hover:bg-[#E63946]/90 text-white">
                          {submittingEdit ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-6 px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Company Name</h3>
                    <p className="text-white font-medium">{business.business_name}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Business Type</h3>
                    <p className="text-white font-medium">{business.business_type}</p>
                  </div>
                  <div className="md:col-span-2 lg:col-span-2">
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      {business.industry?.map((ind) => (
                        <span
                          key={ind}
                          className="px-3 py-1 rounded-full text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Location</h3>
                    <p className="text-white font-medium">{business.location}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Team Size</h3>
                    <p className="text-white font-medium">{business.team_size}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Founded</h3>
                    <p className="text-white font-medium">{business.founded_year}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Website</h3>
                    {business.website ? (
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-medium truncate block max-w-[200px]">
                        {business.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <p className="text-white/30 text-sm italic">Not specified</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">LinkedIn</h3>
                    {business.linkedin_url ? (
                      <a href={business.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-medium">
                        View Profile
                      </a>
                    ) : (
                      <p className="text-white/30 text-sm italic">Not specified</p>
                    )}
                  </div>
                </div>

                <div className="pt-5 border-t border-white/10">
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{business.description}</p>
                </div>
              </CardContent>
            </Card>            {/* Campaigns Section */}
            <CampaignsSection businessId={businessId} />
          </div>

          {/* Team Members */}
          <div>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Members
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Invite
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showInviteForm && (
                  <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 mb-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleInvite}
                        disabled={inviting}
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                      >
                        {inviting ? "Sending..." : "Send Invite"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowInviteForm(false);
                          setInviteEmail("");
                        }}
                        className="bg-white/5 border-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {loadingMembers ? (
                  <div className="text-center py-4 text-white/60">Loading members...</div>
                ) : members && members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member._id}
                        className="p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {member.user?.displayName || member.email}
                            </div>
                            {member.user?.displayName && (
                              <div className="text-xs text-white/60">{member.email}</div>
                            )}
                          </div>
                          {getRoleBadge(member.role)}
                        </div>
                        <div className="text-xs text-white/60">
                          {getStatusBadge(member.invite_status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-white/60">
                    No team members yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
