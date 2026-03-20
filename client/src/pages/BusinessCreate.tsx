import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertBusinessSchema } from "@shared/schema";
import { z } from "zod";
import { ArrowRight, ArrowLeft } from "lucide-react";

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
  "Other"
];

export default function BusinessCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Scroll to top when the page loads
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    industry: [] as string[],
    website: "",
    linkedin_url: "",
    description: "",
    team_size: "",
    location: "",
    founded_year: new Date().getFullYear(),
    business_type_other: ""
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIndustryToggle = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industry: prev.industry.includes(industry)
        ? prev.industry.filter(i => i !== industry)
        : [...prev.industry, industry]
    }));
  };

  const validateStep1 = () => {
    if (!formData.business_name.trim()) {
      toast({ title: "Business name is required", variant: "destructive" });
      return false;
    }
    if (!formData.business_type) {
      toast({ title: "Business type is required", variant: "destructive" });
      return false;
    }
    if (formData.business_type === "Other (Specify)" && !formData.business_type_other.trim()) {
      toast({ title: "Please specify business type", variant: "destructive" });
      return false;
    }
    if (formData.industry.length === 0) {
      toast({ title: "Please select at least one industry", variant: "destructive" });
      return false;
    }
    if (!formData.location.trim()) {
      toast({ title: "Location is required", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.description.trim()) {
      toast({ title: "Description is required", variant: "destructive" });
      return false;
    }
    if (!formData.website.trim()) {
      toast({ title: "Website URL is required", variant: "destructive" });
      return false;
    }
    if (!formData.linkedin_url.trim()) {
      toast({ title: "LinkedIn URL is required", variant: "destructive" });
      return false;
    }
    if (!formData.team_size.trim()) {
      toast({ title: "Team size is required", variant: "destructive" });
      return false;
    }
    if (!formData.founded_year) {
      toast({ title: "Founded year is required", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const formatUrl = (url?: string) => {
        if (!url || !url.trim()) return undefined;
        let formatted = url.trim();
        if (!/^https?:\/\//i.test(formatted)) {
          formatted = `https://${formatted}`;
        }
        return formatted;
      };

      // Validate with Zod
      const validated = insertBusinessSchema.parse({
        ...formData,
        business_type: formData.business_type === "Other (Specify)" ? formData.business_type_other : formData.business_type,
        industry: formData.industry.length > 0 ? formData.industry : undefined,
        website: formatUrl(formData.website),
        linkedin_url: formatUrl(formData.linkedin_url),
        description: formData.description || undefined,
        team_size: formData.team_size || undefined,
        location: formData.location || undefined,
        founded_year: formData.founded_year || undefined
      });

      const response = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validated)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create business");
      }

      const business = await response.json();

      toast({
        title: "Business created successfully!",
        description: "Your business profile is pending admin approval."
      });

      // Redirect to dashboard
      setLocation("/dashboard");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create business",
          variant: "destructive"
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-6 -ml-4 text-white/50 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Create Business Profile</h1>
          <p className="text-white/60">
            Set up your company profile to start posting campaigns and inviting team members
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-[#E63946]' : 'bg-white/10'}`} />
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-[#E63946]' : 'bg-white/10'}`} />
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 3 ? 'bg-[#E63946]' : 'bg-white/10'}`} />
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Basic Information"}
              {step === 2 && "Business Details"}
              {step === 3 && "Review & Submit"}
            </CardTitle>
            <CardDescription className="text-white/60">
              {step === 1 && "Tell us about your business"}
              {step === 2 && "Additional information about your company"}
              {step === 3 && "Review your information before submitting"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange("business_name", e.target.value)}
                    placeholder="Acme Inc."
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div>
                  <Label htmlFor="business_type">Business Type *</Label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value) => handleInputChange("business_type", value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
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

                {formData.business_type === "Other (Specify)" && (
                  <div>
                    <Label htmlFor="business_type_other">Specify Business Type *</Label>
                    <Input
                      id="business_type_other"
                      value={formData.business_type_other}
                      onChange={(e) => handleInputChange("business_type_other", e.target.value)}
                      placeholder="e.g. Cooperative, Non-profit"
                      className="bg-white/5 border-white/10"
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
                        onClick={() => handleIndustryToggle(industry)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          formData.industry.includes(industry)
                            ? 'bg-[#E63946]/15 border-[#E63946]/30 text-[#E63946]'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                        }`}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Bangalore, India"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </>
            )}

            {/* Step 2: Business Details */}
            {step === 2 && (
              <>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Tell us about your business..."
                    rows={4}
                    className="bg-white/5 border-white/10 resize-none"
                  />
                </div>



                <div>
                  <Label htmlFor="website">Website *</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://example.com"
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin_url">LinkedIn URL *</Label>
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="team_size">Team Size *</Label>
                    <Input
                      id="team_size"
                      value={formData.team_size}
                      onChange={(e) => handleInputChange("team_size", e.target.value)}
                      placeholder="e.g., 1-10"
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="founded_year">Founded Year *</Label>
                    <Input
                      id="founded_year"
                      type="number"
                      value={formData.founded_year}
                      onChange={(e) => handleInputChange("founded_year", parseInt(e.target.value))}
                      placeholder="2024"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h3 className="font-semibold mb-3">Business Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Name:</span>
                      <span>{formData.business_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Type:</span>
                      <span>{formData.business_type}</span>
                    </div>
                    {formData.industry.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Industry:</span>
                        <span>{formData.industry.join(", ")}</span>
                      </div>
                    )}
                    {formData.location && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Location:</span>
                        <span>{formData.location}</span>
                      </div>
                    )}
                    {formData.team_size && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Team Size:</span>
                        <span>{formData.team_size}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(prev => prev - 1)}
                  className="bg-white/5 border-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto bg-[#E63946] hover:bg-[#E63946]/90 text-white"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="ml-auto bg-[#E63946] hover:bg-[#E63946]/90 text-white disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Create Business"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
