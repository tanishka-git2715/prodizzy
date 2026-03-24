import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Plus, TrendingUp, Eye, Users, Calendar, Share2 } from "lucide-react";
import { ApplicationsList } from "@/components/applications/ApplicationsList";
import { useState } from "react";
import { useCampaignApplications } from "@/hooks/use-applications";

// Fetches accepted applications count for a single campaign
function AcceptedCount({ campaignId }: { campaignId: string }) {
  const { data: apps } = useCampaignApplications(campaignId);
  const count = (apps ?? []).filter((a) => a.status === "accepted" || a.status === "approved").length;
  return <>{count}</>;
}

// Returns accepted count as a number (for conditional rendering)
function useAcceptedCount(campaignId: string) {
  const { data: apps } = useCampaignApplications(campaignId);
  return (apps ?? []).filter((a) => a.status === "accepted" || a.status === "approved").length;
}

// Button component that uses the hook (hooks can't be called conditionally)
function ViewApplicationsButton({ campaign, selectedCampaignForApps, setSelectedCampaignForApps }: {
  campaign: any;
  selectedCampaignForApps: string | null;
  setSelectedCampaignForApps: (id: string | null) => void;
}) {
  const acceptedCount = useAcceptedCount(campaign._id);
  if (acceptedCount === 0) return null;
  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <Button
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedCampaignForApps(
            selectedCampaignForApps === campaign._id ? null : campaign._id
          );
        }}
        className="w-full text-blue-400 hover:text-blue-300"
      >
        {selectedCampaignForApps === campaign._id
          ? "Hide Applications"
          : `View ${acceptedCount} Application${acceptedCount !== 1 ? "s" : ""}`}
      </Button>
      {selectedCampaignForApps === campaign._id && (
        <ApplicationsList
          campaignId={campaign._id}
          campaignTitle={campaign.title}
        />
      )}
    </div>
  );
}

interface CampaignsSectionProps {
  businessId?: string;
}

export function CampaignsSection({ businessId }: CampaignsSectionProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCampaignForApps, setSelectedCampaignForApps] = useState<string | null>(null);

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery<any[]>({
    queryKey: businessId ? ["campaigns", businessId] : ["user-campaigns"],
    queryFn: async () => {
      const endpoint = businessId
        ? `/api/business/${businessId}/campaigns`
        : `/api/user/campaigns`;

      const response = await fetch(endpoint, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to load campaigns");
      }
      return response.json();
    }
  });

  const { data: campaignStats } = useQuery<any>({
    queryKey: businessId ? ["campaign-stats", businessId] : ["user-campaign-stats"],
    queryFn: async () => {
      const endpoint = businessId
        ? `/api/business/${businessId}/campaigns/stats`
        : `/api/user/campaigns/stats`;

      const response = await fetch(endpoint, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to load campaign stats");
      }
      return response.json();
    },
    enabled: true // Always enable to see personal stats if no businessId
  });

  const handleShareCampaign = (campaignId: string, campaignTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/c/${campaignId}`;

    if (navigator.share) {
      navigator.share({
        title: campaignTitle,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description: "Campaign link copied to clipboard",
        });
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Campaign link copied to clipboard",
      });
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#E63946]" />
            Campaigns
          </CardTitle>
          <Button
            onClick={() => setLocation(businessId ? `/business/${businessId}/campaigns/new` : `/campaigns/new`)}
            className="bg-[#E63946] hover:bg-[#E63946]/90 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Launch
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Campaign Stats */}
        {campaignStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white">{campaignStats.active || 0}</div>
              <div className="text-sm text-white/60">Active</div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400">{campaignStats.pendingApproval || 0}</div>
              <div className="text-sm text-yellow-400/80">Pending</div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white">{campaignStats.totalViews || 0}</div>
              <div className="text-sm text-white/60">Views</div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white">{campaignStats.totalApplications || 0}</div>
              <div className="text-sm text-white/60">Applications</div>
            </div>
          </div>
        )}

        {/* Approval Notice */}
        {campaignStats && campaignStats.pendingApproval > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-400 mb-1">
                  {campaignStats.pendingApproval} Campaign{campaignStats.pendingApproval > 1 ? 's' : ''} Awaiting Approval
                </h4>
                <p className="text-sm text-yellow-400/80">
                  Visible shareable immediately, but applications visible after admin approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {loadingCampaigns ? (
          <div className="text-center py-8 text-white/60">Loading campaigns...</div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="space-y-3">
            {campaigns.slice(0, 5).map((campaign) => (
              <div
                key={campaign._id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{campaign.title}</h4>
                    <p className="text-sm text-white/60 line-clamp-2">{campaign.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === 'active' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleShareCampaign(campaign._id, campaign.title, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    )}
                    {campaign.status === 'active' && !campaign.approved && (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        Pending
                      </span>
                    )}
                    {campaign.status === 'active' && campaign.approved && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                        Approved
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {campaign.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <AcceptedCount campaignId={campaign._id} />
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* View Applications section */}
                <ViewApplicationsButton campaign={campaign} selectedCampaignForApps={selectedCampaignForApps} setSelectedCampaignForApps={setSelectedCampaignForApps} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-white/30 text-sm italic">No campaigns launched yet</p>
        )}
      </CardContent>
    </Card>
  );
}
