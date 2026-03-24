import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, Calendar, Users, ExternalLink, ChevronDown, ChevronUp, Mail, Phone, FileText, Briefcase, User as UserIcon, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileDetailView } from "@/components/ProfileDetailView";
import { BusinessDetailView } from "@/components/campaigns/BusinessDetailView";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  approved: boolean;
  views: number;
  applications: number;
  createdAt: string;
  business?: {
    business_name: string;
    logo_url?: string;
    location?: string;
    industry?: string[];
    business_type?: string;
    team_size?: string;
    website?: string;
    linkedin_url?: string;
    founded_year?: number;
    description?: string;
  };
  creator?: {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
  };
  individual_profile?: any;
}

function ApplicationRow({ application, onStatusUpdate }: { application: any; onStatusUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: (status: "accepted" | "rejected" | "pending") =>
      fetch(`/api/admin/applications/${application._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      }).then((r) => r.json()),
    onSuccess: () => {
      onStatusUpdate();
    },
  });

  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            {application.user?.avatarUrl ? (
              <img
                src={application.user.avatarUrl}
                alt={application.user.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium">
                {(application.user?.displayName || application.user?.email || "A")[0].toUpperCase()}
              </span>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {application.user?.displayName || "Anonymous"}
            </p>
            {application.user?.email && (
              <p className="text-xs text-white/60 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {application.user.email}
              </p>
            )}
            <p className="text-xs text-white/40 mt-1">
              Applied {new Date(application.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <Badge
          variant="outline"
          className={`text-xs ${
            (application.status === "accepted" || application.status === "approved")
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : application.status === "rejected"
              ? "bg-red-500/20 text-red-400 border-red-500/30"
              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          }`}
        >
          {application.status === "accepted" || application.status === "approved" ? "approved" : application.status}
        </Badge>
      </div>

      {/* Quick Info */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {application.contact_details && (
          <div className="text-xs text-white/60 flex items-center gap-1 px-2 py-1 rounded bg-white/5">
            <Phone className="w-3 h-3" />
            {application.contact_details}
          </div>
        )}
        {application.resume_url && (
          <a
            href={application.resume_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded bg-white/5"
          >
            <FileText className="w-3 h-3" />
            Resume
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {application.portfolio_url && (
          <a
            href={application.portfolio_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded bg-white/5"
          >
            <Briefcase className="w-3 h-3" />
            Portfolio
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Message Preview */}
      {application.message && (
        <p className="text-xs text-white/70 line-clamp-2 mb-3">{application.message}</p>
      )}

      {/* Expand/Collapse */}
      {(application.message || (application.answers && Object.keys(application.answers).length > 0)) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-400 hover:text-blue-300 mb-3 flex items-center gap-1"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="border-t border-white/6 pt-3 space-y-6">
              {/* Profile Preview */}
              {application.profile && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <UserIcon className="w-4 h-4 text-[#E63946]" />
                    <h5 className="text-sm font-bold uppercase tracking-wider text-white/40">Applicant Profile</h5>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <ProfileDetailView profile={application.profile} isAdmin={true} />
                  </div>
                </div>
              )}

              {/* Application Details */}
              <div className="space-y-3">
                {application.message && (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Application Message</p>
                    <p className="text-sm text-white/70 bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">{application.message}</p>
                  </div>
                )}
                {application.answers && Object.keys(application.answers).length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Additional Answers</p>
                    <div className="space-y-2">
                      {Object.entries(application.answers).map(([key, value]) => (
                        <div key={key} className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <span className="text-xs text-white/50 capitalize block mb-1">{key.replace(/_/g, " ")}</span>
                          <p className="text-sm text-white/70">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-white/6">
        {application.status !== "accepted" && application.status !== "approved" && (
          <Button
            size="sm"
            onClick={() => updateStatusMutation.mutate("accepted")}
            disabled={updateStatusMutation.isPending}
            className="bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25"
          >
            <Check className="w-3 h-3 mr-1" />
            Approve
          </Button>
        )}
        {application.status !== "rejected" && (
          <Button
            size="sm"
            onClick={() => updateStatusMutation.mutate("rejected")}
            disabled={updateStatusMutation.isPending}
            variant="outline"
            className="bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25"
          >
            <X className="w-3 h-3 mr-1" />
            Reject
          </Button>
        )}
        {(application.status === "accepted" || application.status === "approved" || application.status === "rejected") && (
          <Button
            size="sm"
            onClick={() => updateStatusMutation.mutate("pending")}
            disabled={updateStatusMutation.isPending}
            variant="outline"
            className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/25"
          >
            Reset to Pending
          </Button>
        )}
      </div>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const [expanded, setExpanded] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const queryClient = useQueryClient();

  const { data: applications } = useQuery<any[]>({
    queryKey: ["admin-campaign-applications", campaign._id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/campaigns/${campaign._id}/applications`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load applications");
      return response.json();
    },
    enabled: showApplications,
  });

  const approveMutation = useMutation({
    mutationFn: (approved: boolean) =>
      fetch(`/api/admin/campaigns/${campaign._id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approved }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    },
  });

  return (
    <div
      className={`border rounded-xl transition-colors ${
        campaign.approved
          ? "border-green-500/20 bg-green-500/5"
          : "border-yellow-500/20 bg-yellow-500/5"
      }`}
    >
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-white font-medium text-sm">{campaign.title}</span>
            <Badge variant="outline" className="text-xs">
              {campaign.category}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                campaign.status === "active"
                  ? "bg-green-500/20 text-green-400"
                  : campaign.status === "draft"
                  ? "bg-gray-500/20 text-gray-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {campaign.status}
            </Badge>
            {campaign.approved ? (
              <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/20">
                Approved
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                Pending Approval
              </span>
            )}
          </div>
          <p className="text-white/40 text-xs">
            {campaign.business?.business_name || campaign.creator?.displayName || "Unknown Creator"} •{" "}
            {new Date(campaign.createdAt).toLocaleDateString()} • {campaign.views} views •{" "}
            {campaign.applications} applications
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(`/c/${campaign._id}`, "_blank")}
            className="bg-white/5 border border-white/10"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View
          </Button>

          {campaign.applications > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowApplications(!showApplications)}
              className="bg-white/5 border border-white/10"
            >
              <Users className="w-3 h-3 mr-1" />
              {campaign.applications} Apps
            </Button>
          )}

          {!campaign.approved ? (
            <Button
              size="sm"
              onClick={() => approveMutation.mutate(true)}
              disabled={approveMutation.isPending}
              className="bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25"
            >
              <Check className="w-3 h-3 mr-1" />
              Approve
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => approveMutation.mutate(false)}
              disabled={approveMutation.isPending}
              variant="outline"
              className="bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25"
            >
              <X className="w-3 h-3 mr-1" />
              Revoke
            </Button>
          )}

          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-white/30 hover:text-white/60 transition-colors p-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/6 pt-4">
              <div className="mb-4">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">
                  Description
                </p>
                <p className="text-white/70 text-sm whitespace-pre-wrap">
                  {campaign.description}
                </p>
              </div>

              {/* Creator/Business Profile Section */}
              <div className="mb-6 pt-4 border-t border-white/6">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  {campaign.business ? <Building2 className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                  {campaign.business ? "Business Information" : "Creator Profile"}
                </p>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 sm:p-6">
                  {campaign.business ? (
                    <BusinessDetailView business={campaign.business as any} />
                  ) : campaign.individual_profile ? (
                    <ProfileDetailView profile={campaign.individual_profile} />
                  ) : (
                    <p className="text-sm text-white/40 italic">No additional profile data available.</p>
                  )}
                </div>
              </div>

              {showApplications && applications && applications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/6">
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-3">
                    Applications ({applications.length})
                  </p>
                  <div className="space-y-3">
                    {applications.map((app: any) => (
                      <ApplicationRow
                        key={app._id}
                        application={app}
                        onStatusUpdate={() => {
                          queryClient.invalidateQueries({
                            queryKey: ["admin-campaign-applications", campaign._id],
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CampaignManagement() {
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const response = await fetch("/api/admin/campaigns", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load campaigns");
      return response.json();
    },
  });

  const filteredCampaigns = campaigns?.filter((c) => {
    if (filter === "pending") return c.status === "active" && !c.approved;
    if (filter === "approved") return c.approved;
    return true;
  });

  const stats = {
    total: campaigns?.length || 0,
    pending: campaigns?.filter((c) => c.status === "active" && !c.approved).length || 0,
    approved: campaigns?.filter((c) => c.approved).length || 0,
    totalApplications: campaigns?.reduce((sum, c) => sum + c.applications, 0) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-white/60">Total Campaigns</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-white/60">Pending Approval</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
            <div className="text-sm text-white/60">Approved</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-400">{stats.totalApplications}</div>
            <div className="text-sm text-white/60">Total Applications</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => setFilter("all")}
          variant={filter === "all" ? "default" : "outline"}
          className={filter === "all" ? "bg-white text-black" : "bg-white/5 border-white/10"}
        >
          All ({stats.total})
        </Button>
        <Button
          size="sm"
          onClick={() => setFilter("pending")}
          variant={filter === "pending" ? "default" : "outline"}
          className={
            filter === "pending"
              ? "bg-yellow-500 text-black"
              : "bg-white/5 border-white/10 text-yellow-400"
          }
        >
          Pending ({stats.pending})
        </Button>
        <Button
          size="sm"
          onClick={() => setFilter("approved")}
          variant={filter === "approved" ? "default" : "outline"}
          className={
            filter === "approved"
              ? "bg-green-500 text-black"
              : "bg-white/5 border-white/10 text-green-400"
          }
        >
          Approved ({stats.approved})
        </Button>
      </div>

      {/* Campaigns List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-white/60">Loading campaigns...</div>
        ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <CampaignRow key={campaign._id} campaign={campaign} />
          ))
        ) : (
          <div className="text-center py-12 text-white/60">
            No campaigns {filter !== "all" && `in ${filter} status`}
          </div>
        )}
      </div>
    </div>
  );
}
