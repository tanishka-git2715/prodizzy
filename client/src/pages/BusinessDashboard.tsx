import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, Settings, ArrowLeft, Mail, Shield, UserCheck, UserX, Crown } from "lucide-react";
import type { Business, TeamMember } from "@shared/schema";

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

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

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
              className="mb-4 text-white/60 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#E63946]/10 border border-[#E63946]/20 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-[#E63946]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{business.business_name}</h1>
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
            onClick={() => setLocation(`/business/${businessId}/settings`)}
            variant="outline"
            className="bg-white/5 border-white/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Business Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
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

            {/* Campaigns Section (Placeholder for Phase 2) */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-white/60">
                  <p className="mb-2">No campaigns yet</p>
                  <p className="text-sm">Campaign feature coming soon!</p>
                </div>
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
