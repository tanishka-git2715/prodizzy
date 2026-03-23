import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ApplicationFormModal } from "@/components/applications/ApplicationFormModal";
import { ApplicationSuccessDialog } from "@/components/applications/ApplicationSuccessDialog";
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  Users,
  ExternalLink,
  Share2,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import type { Campaign } from "@shared/schema";

export default function PublicCampaignView() {
  const [, params] = useRoute("/c/:id");
  const [, setLocation] = useLocation();
  const { session } = useAuth();
  const { toast } = useToast();
  const campaignId = params?.id;
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { data: campaign, isLoading, error } = useQuery<any>({
    queryKey: ["public-campaign", campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/public`);
      if (!response.ok) {
        throw new Error("Campaign not found");
      }
      return response.json();
    },
    enabled: !!campaignId,
  });

  // Handle auto-apply from query param
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("apply") === "true") {
      setShowApplicationModal(true);
    }
  }, []);

  // Update meta tags for social sharing
  useEffect(() => {
    if (campaign) {
      // Set page title
      document.title = `${campaign.title} | Prodizzy`;

      // Create or update Open Graph meta tags
      const metaTags = [
        { property: "og:title", content: campaign.title },
        { property: "og:description", content: campaign.description.slice(0, 200) },
        { property: "og:type", content: "website" },
        { property: "og:url", content: window.location.href },
        { property: "og:site_name", content: "Prodizzy" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: campaign.title },
        { name: "twitter:description", content: campaign.description.slice(0, 200) },
        { name: "description", content: campaign.description.slice(0, 160) },
      ];

      // Add business logo if available
      if (campaign.business?.logo_url) {
        metaTags.push(
          { property: "og:image", content: campaign.business.logo_url },
          { name: "twitter:image", content: campaign.business.logo_url }
        );
      }

      metaTags.forEach(({ property, name, content }) => {
        const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
        let metaTag = document.querySelector(selector) as HTMLMetaElement;

        if (!metaTag) {
          metaTag = document.createElement("meta");
          if (property) metaTag.setAttribute("property", property);
          if (name) metaTag.setAttribute("name", name);
          document.head.appendChild(metaTag);
        }

        metaTag.content = content;
      });
    }

    return () => {
      // Reset title on unmount
      document.title = "Prodizzy";
    };
  }, [campaign]);

  const handleApply = () => {
    if (!session) {
      // Redirect to signup with return URL
      setLocation(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    } else {
      // User is logged in, show application modal
      setShowApplicationModal(true);
    }
  };

  const handleApplicationSuccess = () => {
    setShowApplicationModal(false);
    setShowSuccessDialog(true);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.title,
          text: campaign?.description.slice(0, 100),
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Campaign link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/60">Loading campaign...</div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
          <p className="text-white/60 mb-4">
            This campaign may have been closed or removed
          </p>
          <Button onClick={() => setLocation("/")}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with branding */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setLocation("/")}
          >
            <div className="text-lg sm:text-xl font-bold">
              <span className="text-[#E63946]">Prodizzy</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="bg-white/5 border-white/10"
          >
            <Share2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>

      {/* Campaign Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* Business Header */}
        {campaign.business && (
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-white/10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {campaign.business.logo_url ? (
                <img
                  src={campaign.business.logo_url}
                  alt={campaign.business.business_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">{campaign.business.business_name}</h3>
              <p className="text-xs sm:text-sm text-white/60">Posted an opportunity</p>
            </div>
          </div>
        )}

        {/* Campaign Details */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{campaign.title}</h1>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {campaign.category}
              </Badge>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-6 sm:my-8">
            {campaign.engagementType && (
              <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 mb-1">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs">Type</span>
                </div>
                <p className="font-medium text-sm sm:text-base truncate">{campaign.engagementType}</p>
              </div>
            )}

            {campaign.budget && (
              <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 mb-1">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs">Budget</span>
                </div>
                <p className="font-medium text-sm sm:text-base truncate">{campaign.budget}</p>
              </div>
            )}

            {campaign.location && (
              <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 mb-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs">Location</span>
                </div>
                <p className="font-medium text-sm sm:text-base truncate">{campaign.location}</p>
              </div>
            )}

            {campaign.deadline && (
              <div className="p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 mb-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs">Deadline</span>
                </div>
                <p className="font-medium text-sm sm:text-base">
                  {new Date(campaign.deadline).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="bg-white/5 border-white/10 mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">About this opportunity</h2>
            <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
              {campaign.description}
            </p>

            {/* Skills */}
            {campaign.skills && campaign.skills.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.skills.map((skill: string) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="bg-blue-500/10 border-blue-500/30 text-blue-300"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {campaign.customFields && Object.keys(campaign.customFields).length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
                <div className="space-y-3">
                  {Object.entries(campaign.customFields).map(([key, value]: [string, any]) => {
                    if (value) {
                      return (
                        <div key={key}>
                          <span className="text-sm text-white/60 capitalize">
                            {key.replace(/_/g, " ")}:
                          </span>
                          <p className="font-medium">{value}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#E63946]/10 to-blue-500/10 border border-white/10 rounded-xl p-6 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Interested in this opportunity?</h3>
          <p className="text-sm sm:text-base text-white/60 mb-6">
            {session
              ? "Click apply to submit your application"
              : "Sign up or log in to apply for this opportunity"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={handleApply}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white w-full sm:w-auto"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {session ? "Apply Now" : "Sign Up to Apply"}
            </Button>
            {!session && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/login")}
                className="bg-white/5 border-white/10 w-full sm:w-auto"
              >
                <span className="hidden sm:inline">Already have an account? Login</span>
                <span className="sm:hidden">Login</span>
              </Button>
            )}
          </div>
        </div>

        {/* Browse More CTA */}
        <div className="mt-8 text-center">
          <Button 
            size="lg"
            onClick={() => setLocation("/campaigns/discover")}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white px-8 py-6 h-auto text-lg rounded-2xl transition-all"
          >
            Browse more campaigns
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 sm:mt-16 text-center text-xs sm:text-sm text-white/40">
          <p>
            Posted {new Date(campaign.createdAt).toLocaleDateString()} • {campaign.views || 0}{" "}
            views
          </p>
        </div>
      </div>

      {/* Application Modals */}
      <ApplicationFormModal
        campaignId={campaignId!}
        campaignTitle={campaign.title}
        open={showApplicationModal}
        onOpenChange={setShowApplicationModal}
        onSuccess={handleApplicationSuccess}
      />

      <ApplicationSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        campaignTitle={campaign.title}
      />
    </div>
  );
}

