import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, MapPin, Building2, User, TrendingUp, X, Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface IntentMatchesModalProps {
  open: boolean;
  onClose: () => void;
  intentId: string;
  intentType: string;
}

function authHeaders() {
  return { "Content-Type": "application/json" };
}

function MatchCard({ match, onConnect }: { match: any; onConnect: (matchId: string) => void }) {
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Use user_id instead of profile _id
      const targetUserId = match.profile.user_id || match.profile._id || match.profile.id;
      await onConnect(targetUserId);
      toast({
        title: "Connection request sent",
        description: "You'll be notified when they respond"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  };

  // Determine profile type and display info
  const profile = match.profile;
  const score = match.score;
  const isStartup = profile.company_name;
  const isIndividual = profile.full_name && !profile.company_name && !profile.partner_name;
  const isPartner = profile.partner_name;
  const isInvestor = profile.investor_name || profile.fund_name;

  // Get display name
  const displayName = profile.company_name || profile.partner_name || profile.investor_name || profile.fund_name || profile.full_name || "Unknown";

  // Get description
  const description = profile.product_description || profile.company_description || profile.bio || profile.services_description || "No description available";

  // Get location
  const location = profile.location;

  // Get tags based on profile type
  const tags = [];
  if (isStartup) {
    if (profile.stage) tags.push(profile.stage);
    if (profile.industry) {
      const industries = Array.isArray(profile.industry) ? profile.industry : [profile.industry];
      tags.push(...industries.slice(0, 2));
    }
  } else if (isIndividual) {
    if (profile.skills) {
      const skills = Array.isArray(profile.skills) ? profile.skills : [];
      tags.push(...skills.slice(0, 3));
    }
    if (profile.experience_level) tags.push(profile.experience_level);
  } else if (isPartner) {
    if (profile.partner_type) tags.push(profile.partner_type);
    if (profile.services_offered) {
      const services = Array.isArray(profile.services_offered) ? profile.services_offered : [];
      tags.push(...services.slice(0, 2));
    }
  } else if (isInvestor) {
    if (profile.check_size) tags.push(`Check: ${profile.check_size}`);
    if (profile.stages) {
      const stages = Array.isArray(profile.stages) ? profile.stages : [];
      tags.push(...stages.slice(0, 2));
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isStartup && <Building2 className="w-4 h-4 text-blue-400 shrink-0" />}
            {isIndividual && <User className="w-4 h-4 text-green-400 shrink-0" />}
            {isPartner && <Building2 className="w-4 h-4 text-purple-400 shrink-0" />}
            {isInvestor && <TrendingUp className="w-4 h-4 text-orange-400 shrink-0" />}
            <h3 className="text-white font-medium truncate">{displayName}</h3>
          </div>
          {location && (
            <div className="flex items-center gap-1 text-xs text-white/40 mb-2">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
          )}
          <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">{description}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <Sparkles className="w-3 h-3 text-green-400" />
            <span className="text-xs font-semibold text-green-300">{score}% match</span>
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/50 border border-white/10">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleConnect}
          disabled={connecting}
          size="sm"
          className="flex-1 bg-blue-500 hover:bg-blue-600"
        >
          {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect"}
        </Button>
      </div>
    </div>
  );
}

export function IntentMatchesModal({ open, onClose, intentId, intentType }: IntentMatchesModalProps) {
  const [, setLocation] = useLocation();
  const { data: matches, isLoading, error } = useQuery({
    queryKey: ["intent-matches", intentId],
    queryFn: async () => {
      const response = await fetch(`/api/matches/intents/${intentId}`, {
        headers: authHeaders()
      });
      if (!response.ok) throw new Error("Failed to fetch matches");
      return response.json();
    },
    enabled: open && !!intentId
  });

  const handleConnect = async (targetUserId: string) => {
    const response = await fetch("/api/connections", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        target_id: targetUserId,
        intent_id: intentId
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create connection");
    }
    return response.json();
  };

  const handleDiscover = () => {
    onClose();
    setLocation("/discover");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-black border-white/20 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Matches for {intentType}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-white/40" />
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-400 text-sm">
              Failed to load matches. Please try again.
            </div>
          )}

          {matches && matches.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className="space-y-2">
                <div className="text-white/40 text-sm">No matches found yet</div>
                <div className="text-white/30 text-xs">Check back later as more users join</div>
              </div>
              <Button
                onClick={handleDiscover}
                variant="outline"
                className="border-white/20 hover:bg-white/10"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Discover Page
              </Button>
            </div>
          )}

          {matches && matches.length > 0 && (
            <>
              <div className="text-xs text-white/40">
                Found {matches.length} matching profile{matches.length !== 1 ? 's' : ''}
              </div>
              <div className="space-y-3">
                {matches.map((match: any) => (
                  <MatchCard
                    key={match.profile._id || match.profile.id}
                    match={match}
                    onConnect={handleConnect}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
