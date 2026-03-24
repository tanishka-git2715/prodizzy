import { Building2, MapPin, Globe, Linkedin, Users, Calendar, Info } from "lucide-react";
import { ensureHttps } from "@/lib/utils";

interface BusinessDetailViewProps {
  business: {
    business_name: string;
    business_type?: string;
    industry?: string[];
    website?: string;
    linkedin_url?: string;
    logo_url?: string;
    description?: string;
    team_size?: string;
    location?: string;
    founded_year?: number;
  };
}

function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color ?? "bg-white/8 text-white/50 border-white/10"}`}>
      {label}
    </span>
  );
}

function DetailItem({ label, value, icon: Icon, isLink }: { label: string; value?: string | number; icon: any; isLink?: boolean }) {
  if (!value) return null;
  
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="w-3 h-3" />
        {label}
      </p>
      {isLink ? (
        <a 
          href={ensureHttps(String(value))} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors block truncate"
        >
          {String(value).replace(/^https?:\/\//, "")}
        </a>
      ) : (
        <p className="text-sm font-medium text-white/80">{value}</p>
      )}
    </div>
  );
}

export function BusinessDetailView({ business }: BusinessDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
          {business.logo_url ? (
            <img 
              src={business.logo_url} 
              alt={business.business_name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="w-8 h-8 text-white/20" />
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-white truncate">{business.business_name}</h2>
          <div className="flex items-center gap-2">
            <Tag label={business.business_type || "Company"} color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
            {business.industry && business.industry.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {business.industry.slice(0, 2).map((ind) => (
                  <Tag key={ind} label={ind} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
        <DetailItem label="Location" value={business.location} icon={MapPin} />
        <DetailItem label="Team Size" value={business.team_size} icon={Users} />
        <DetailItem label="Founded" value={business.founded_year} icon={Calendar} />
        <DetailItem label="Website" value={business.website} icon={Globe} isLink />
        <DetailItem label="LinkedIn" value={business.linkedin_url} icon={Linkedin} isLink />
      </div>

      {/* Industries (Full List) */}
      {business.industry && business.industry.length > 2 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider">Industries</p>
          <div className="flex flex-wrap gap-2">
            {business.industry.map((ind) => (
              <Tag key={ind} label={ind} />
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {business.description && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3 h-3" />
            Description
          </p>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
              {business.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
