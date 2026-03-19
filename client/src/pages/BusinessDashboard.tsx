import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Settings, ArrowLeft, Mail, Shield, UserCheck, UserX, Crown, Rocket, Plus, TrendingUp, Eye, Calendar, Share2, Copy, BadgeCheck } from "lucide-react";
import type { Business, TeamMember } from "@shared/schema";
import { ApplicationsList } from "@/components/applications/ApplicationsList";

export default function BusinessDashboard() {
  const [, params] = useRoute("/business/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const businessId = params?.id;

  const { data: business, isLoading: loadingBusiness } = useQuery<Business>({
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

  const handleShareCampaign = (campaignId: string, campaignTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/c/${campaignId}`;

    if (navigator.share) {
      navigator.share({
        title: campaignTitle,
        url: shareUrl,
      }).catch(() => {
        // Fallback to clipboard
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
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              className="mb-4 text-white/60 hover:text-white p-0 h-auto hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center gap-4">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Business Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.description && (
                  <div>
                    <h3 className="text-sm font-medium text-white/60 mb-1">Description</h3>
                    <p className="text-white/90">{business.description}</p>
                  </div>
                )}

                {business.industry && business.industry.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-white/60 mb-2">Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      {business.industry.map((ind) => (
                        <span
                          key={ind}
                          className="px-3 py-1 rounded-full text-sm bg-blue-500/20 border border-blue-500/30 text-blue-300"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  {business.website && (
                    <div>
                      <h3 className="text-sm font-medium text-white/60 mb-1">Website</h3>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm"
                      >
                        {business.website}
                      </a>
                    </div>
                  )}

                  {business.linkedin_url && (
                    <div>
                      <h3 className="text-sm font-medium text-white/60 mb-1">LinkedIn</h3>
                      <a
                        href={business.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm"
                      >
                        View Profile
                      </a>
                    </div>
                  )}

                  {business.team_size && (
                    <div>
                      <h3 className="text-sm font-medium text-white/60 mb-1">Team Size</h3>
                      <p className="text-sm">{business.team_size}</p>
                    </div>
                  )}

                  {business.founded_year && (
                    <div>
                      <h3 className="text-sm font-medium text-white/60 mb-1">Founded</h3>
                      <p className="text-sm">{business.founded_year}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Campaigns Section */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Campaigns
                  </CardTitle>
                  <Button
                    onClick={() => setLocation(`/business/${businessId}/campaigns/new`)}
                    className="bg-[#E63946] hover:bg-[#E63946]/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Launch Opportunity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Campaign Stats */}
                {campaignStats && (
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-2xl font-bold text-white">{campaignStats.active || 0}</div>
                      <div className="text-sm text-white/60">Active</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-2xl font-bold text-white">{campaignStats.draft || 0}</div>
                      <div className="text-sm text-white/60">Drafts</div>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="text-2xl font-bold text-yellow-400">{campaignStats.pendingApproval || 0}</div>
                      <div className="text-sm text-yellow-400/80">Pending Approval</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-2xl font-bold text-white">{campaignStats.totalViews || 0}</div>
                      <div className="text-sm text-white/60">Total Views</div>
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
                          Your campaigns are shareable immediately, but applications will only be visible to you after admin approval. This helps maintain quality and prevents spam.
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
                        className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                        onClick={() => setLocation(`/campaigns/${campaign._id}`)}
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
                                Pending Approval
                              </span>
                            )}
                            {campaign.status === 'active' && campaign.approved && (
                              <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                                Approved
                              </span>
                            )}
                            {campaign.status !== 'active' && (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                campaign.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {campaign.status}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/60">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {campaign.views || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {campaign.applications || 0} applications
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>
                          {campaign.skills && campaign.skills.length > 0 && (
                            <span className="flex items-center gap-1">
                              {campaign.skills.slice(0, 2).join(", ")}
                              {campaign.skills.length > 2 && ` +${campaign.skills.length - 2}`}
                            </span>
                          )}
                        </div>

                        {/* View Applications Button */}
                        {campaign.applications > 0 && (
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
                                : `View ${campaign.applications} Application${campaign.applications !== 1 ? "s" : ""}`}
                            </Button>

                            {/* Applications List */}
                            {selectedCampaignForApps === campaign._id && (
                              <ApplicationsList
                                campaignId={campaign._id}
                                campaignTitle={campaign.title}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {campaigns.length > 5 && (
                      <Button
                        variant="ghost"
                        onClick={() => setLocation(`/business/${businessId}/campaigns`)}
                        className="w-full text-blue-400 hover:text-blue-300"
                      >
                        View all {campaigns.length} campaigns
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-xl bg-[#E63946]/10 border border-[#E63946]/20 flex items-center justify-center mx-auto mb-4">
                      <Rocket className="w-8 h-8 text-[#E63946]" />
                    </div>
                    <h3 className="font-semibold mb-2">Launch your first campaign</h3>
                    <p className="text-sm text-white/60 mb-4">
                      Create opportunities and connect with talent, creators, investors, and more
                    </p>
                    <Button
                      onClick={() => setLocation(`/business/${businessId}/campaigns/new`)}
                      className="bg-[#E63946] hover:bg-[#E63946]/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Launch Opportunity
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
