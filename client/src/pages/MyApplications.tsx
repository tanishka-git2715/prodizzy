import { useMyApplications } from "@/hooks/use-applications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Briefcase, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function MyApplications() {
  const { data: applications, isLoading } = useMyApplications();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  const statusCounts = {
    total: applications?.length || 0,
    pending: applications?.filter((a) => a.status === "pending").length || 0,
    accepted: applications?.filter((a) => a.status === "accepted").length || 0,
    rejected: applications?.filter((a) => a.status === "rejected").length || 0,
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-4 text-white/60 hover:text-white -ml-2"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-white/60">Track your campaign applications and their status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-sm text-white/60 mb-1">Total</p>
              <p className="text-2xl font-bold">{statusCounts.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-sm text-white/60 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{statusCounts.pending}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-sm text-white/60 mb-1">Accepted</p>
              <p className="text-2xl font-bold text-green-400">{statusCounts.accepted}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-sm text-white/60 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-400">{statusCounts.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        {!applications || applications.length === 0 ? (
          <Card className="bg-white/5 border-white/10 p-12 text-center">
            <Briefcase className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
            <p className="text-white/60 mb-6">
              You haven't applied to any campaigns yet. Browse opportunities to get started!
            </p>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-[#E63946] hover:bg-[#E63946]/90"
            >
              Browse Campaigns
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application._id} className="bg-white/5 border-white/10">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Campaign Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        {application.campaign?.business_id && (
                          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-6 h-6 text-white/60" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold mb-1 truncate">
                            {application.campaign?.title || "Campaign"}
                          </h3>
                          <p className="text-sm text-white/60 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Applied {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Message Preview */}
                      {application.message && (
                        <p className="text-sm text-white/80 line-clamp-2 mb-3">
                          {application.message}
                        </p>
                      )}

                      {/* View Campaign Link */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation(`/c/${application.campaign_id}`)}
                        className="text-blue-400 hover:text-blue-300 -ml-2"
                      >
                        View Campaign
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      className={
                        application.status === "accepted"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : application.status === "rejected"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }
                    >
                      {application.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
