import { useState } from "react";
import { useCampaignApplications } from "@/hooks/use-applications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Briefcase, Calendar, Loader2, User } from "lucide-react";
import { ProfileDetailView } from "@/components/ProfileDetailView";

interface ApplicationsListProps {
  campaignId: string;
  campaignTitle: string;
}

export function ApplicationsList({ campaignId, campaignTitle }: ApplicationsListProps) {
  const { data: applications, isLoading } = useCampaignApplications(campaignId);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  const acceptedApplications = (applications ?? []).filter((app) => 
    app.status === "accepted" || app.status === "approved"
  );

  if (acceptedApplications.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        <p>No approved applications yet for this campaign.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Applications List */}
      <div className="space-y-3">
        {acceptedApplications.map((application) => {
          const isExpanded = expandedIds.has(application._id);

          return (
            <Card key={application._id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      {application.user?.avatarUrl ? (
                        <img
                          src={application.user.avatarUrl}
                          alt={application.user.displayName || "Applicant"}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {(application.user?.displayName || application.user?.email || "A")[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Applicant Info */}
                    <div>
                      <h4 className="font-medium text-white">
                        {application.user?.displayName || application.user?.email || "Anonymous"}
                      </h4>
                      {application.user?.email && application.user?.displayName && (
                        <p className="text-sm text-white/60">{application.user.email}</p>
                      )}
                      <p className="text-xs text-white/40 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        Applied {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message Preview */}
                {application.message && (
                  <div className="mb-3">
                    <p className="text-sm text-white/80 line-clamp-2">
                      {application.message}
                    </p>
                  </div>
                )}

                {/* Links */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {application.resume_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="bg-white/5 border-white/10 text-xs"
                    >
                      <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-3 h-3 mr-1" />
                        Resume
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                  {application.portfolio_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="bg-white/5 border-white/10 text-xs"
                    >
                      <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer">
                        <Briefcase className="w-3 h-3 mr-1" />
                        Portfolio
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>

                {/* Expand/Collapse */}
                {(application.message || (application.answers && Object.keys(application.answers).length > 0)) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newExpanded = new Set(expandedIds);
                      if (isExpanded) {
                        newExpanded.delete(application._id);
                      } else {
                        newExpanded.add(application._id);
                      }
                      setExpandedIds(newExpanded);
                    }}
                    className="text-blue-400 text-xs mb-3"
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </Button>
                )}

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-white/10 pt-4 mt-2 space-y-6">
                    {/* Profile Preview */}
                    {application.profile && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <User className="w-4 h-4 text-[#E63946]" />
                          <h5 className="text-sm font-bold uppercase tracking-wider text-white/40">Applicant Profile Preview</h5>
                        </div>
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <ProfileDetailView profile={application.profile} isAdmin={true} />
                        </div>
                      </div>
                    )}

                    {/* Application details if profile is not enough or to complement */}
                    <div className="space-y-4">
                      {application.message && (
                        <div>
                          <h5 className="text-xs font-bold text-white/25 uppercase tracking-wider mb-2">Application Message</h5>
                          <p className="text-sm text-white/70 bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">{application.message}</p>
                        </div>
                      )}

                      {application.contact_details && (
                        <div>
                          <h5 className="text-xs font-bold text-white/25 uppercase tracking-wider mb-1">Contact Details</h5>
                          <p className="text-sm text-white/70">{application.contact_details}</p>
                        </div>
                      )}

                      {application.answers && Object.keys(application.answers).length > 0 && (
                        <div>
                          <h5 className="text-xs font-bold text-white/25 uppercase tracking-wider mb-2">Additional Answers</h5>
                          <div className="space-y-3">
                            {Object.entries(application.answers).map(([key, value]) => (
                              <div key={key} className="bg-white/5 p-3 rounded-lg border border-white/5">
                                <span className="text-[10px] text-white/30 uppercase font-bold block mb-1">
                                  {key.replace(/_/g, " ")}
                                </span>
                                <p className="text-sm text-white/80">{String(value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
