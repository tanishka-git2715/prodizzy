import { useLocation, Link } from "wouter";
import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  ExternalLink,
  Clock
} from "lucide-react";
import type { Campaign } from "@shared/schema";

interface CampaignCardProps {
  campaign: Campaign;
  onApply?: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, onApply }: CampaignCardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleViewCampaign = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocation(`/c/${campaign._id}`);
  };

  const handleApplyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      // Pass redirect info to login page
      setLocation(`/login?redirect=${encodeURIComponent(`/c/${campaign._id}?apply=true`)}`);
    } else if (user.profileStatus?.needsOnboarding) {
      // Should already be handled by global redirects but just in case
      const dashboardPath = user.profileType === 'startup' ? '/business/onboard' : '/onboard';
      setLocation(dashboardPath);
    } else if (onApply) {
      // If we have an onApply callback, use it (direct apply from discovery)
      onApply(campaign);
    } else {
      // Go to the campaign page to apply (fallback)
      setLocation(`/c/${campaign._id}?apply=true`);
    }
  };

  const daysAgo = Math.floor(
    (Date.now() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const highlights = useMemo(() => {
    const importantFields = ['role', 'experience', 'duration', 'platform', 'equity', 'product', 'stage', 'amount', 'domain', 'compensation'];
    return Object.entries(campaign.customFields || {})
      .filter(([key, value]) => importantFields.includes(key) && value)
      .map(([key, value]) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value: String(value)
      }))
      .slice(0, 3);
  }, [campaign.customFields]);

  return (
    <Card className="bg-white/[0.03] border-white/8 hover:border-white/15 transition-all duration-200 cursor-pointer group" onClick={handleViewCampaign}>
      <CardContent className="p-5 space-y-4">


        {/* Campaign Title */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#E63946] transition-colors">
            {campaign.title}
          </h3>
          <p className="text-white/65 text-sm leading-relaxed line-clamp-3">
            {campaign.description}
          </p>
        </div>

        {/* Campaign Highlights (Custom Fields) */}
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 py-2 px-3 bg-white/[0.02] border border-white/5 rounded-xl">
            {highlights.map((h) => (
              <div key={h.key} className="flex flex-col">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">{h.label}</span>
                <span className="text-xs text-white/80 font-medium truncate max-w-[120px]">
                  {h.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Category & Engagement Type */}
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {campaign.category}
          </Badge>
          {campaign.engagementType && (
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {campaign.engagementType}
            </Badge>
          )}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-2 text-xs text-white/50">
          {campaign.compensation && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="truncate">{campaign.compensation}</span>
            </div>
          )}
          {campaign.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{campaign.location}</span>
            </div>
          )}
          {campaign.deadline && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span className="truncate">
                {new Date(campaign.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
          {campaign.views > 0 && (
            <div className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{campaign.views} views</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {campaign.skills && campaign.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {campaign.skills.slice(0, 3).map((skill: string) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-xs bg-white/5 text-white/60 border border-white/10 rounded-full"
              >
                {skill}
              </span>
            ))}
            {campaign.skills.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-white/5 text-white/60 border border-white/10 rounded-full">
                +{campaign.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white/80 transition-all"
            onClick={handleViewCampaign}
          >
            View Details
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-[#E63946] hover:bg-[#E63946]/90 font-medium transition-all"
            onClick={handleApplyNow}
          >
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
