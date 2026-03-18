import { MapPin, Users, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Business } from "@shared/schema";

interface BusinessCardProps {
  business: Business & { user_role?: string };
  onClick?: () => void;
}

export function BusinessCard({ business, onClick }: BusinessCardProps) {
  return (
    <div
      className="p-5 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Business Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-white truncate">{business.business_name}</h3>
              <p className="text-sm text-white/60">{business.business_type}</p>
            </div>

            {business.user_role && (
              <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 border border-blue-500/30 text-blue-300 shrink-0">
                {business.user_role.charAt(0).toUpperCase() + business.user_role.slice(1)}
              </span>
            )}
          </div>

          {business.description && (
            <p className="text-sm text-white/70 line-clamp-2 mb-3">{business.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
            {business.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{business.location}</span>
              </div>
            )}

            {business.team_size && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{business.team_size} team</span>
              </div>
            )}

            {!business.approved && (
              <div className="flex items-center gap-1 text-yellow-400">
                <Clock className="w-3 h-3" />
                <span>Pending Approval</span>
              </div>
            )}
          </div>

          {business.industry && business.industry.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {business.industry.slice(0, 3).map((ind) => (
                <span
                  key={ind}
                  className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/70"
                >
                  {ind}
                </span>
              ))}
              {business.industry.length > 3 && (
                <span className="px-2 py-0.5 rounded-full text-xs text-white/60">
                  +{business.industry.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrow */}
        <ArrowRight className="w-5 h-5 text-white/40 shrink-0" />
      </div>
    </div>
  );
}
