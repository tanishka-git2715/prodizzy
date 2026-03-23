import { useLocation } from "wouter";
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
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [, setLocation] = useLocation();

  const handleViewCampaign = () => {
    setLocation(`/c/${campaign._id}`);
  };

  const daysAgo = Math.floor(
    (Date.now() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="bg-white/[0.03] border-white/8 hover:border-white/15 transition-all duration-200 cursor-pointer group" onClick={handleViewCampaign}>
      <CardContent className="p-5 space-y-4">
        {/* Business Header */}
        {campaign.business && (
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {campaign.business.logo_url ? (
                <img
                  src={campaign.business.logo_url}
                  alt={campaign.business.business_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-5 h-5 text-white/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white/80 truncate">
                {campaign.business.business_name}
              </h4>
              <p className="text-xs text-white/40 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
              </p>
            </div>
          </div>
        )}

        {/* Campaign Title */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#E63946] transition-colors">
            {campaign.title}
          </h3>
          <p className="text-white/65 text-sm leading-relaxed line-clamp-3">
            {campaign.description}
          </p>
        </div>

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
          {campaign.budget && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="truncate">{campaign.budget}</span>
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

        {/* View Button */}
        <Button
          size="sm"
          className="w-full bg-[#E63946] hover:bg-[#E63946]/90 group-hover:scale-[1.02] transition-transform"
          onClick={handleViewCampaign}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
