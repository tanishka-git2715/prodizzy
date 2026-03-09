import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, CheckCircle2, Clock, Users, Sparkles } from "lucide-react";
import { useState } from "react";
import { IntentMatchesModal } from "./IntentMatchesModal";

interface IntentCardProps {
  intent: any;
  onEdit?: (intent: any) => void;
  onDelete?: (intentId: string) => void;
  matchCount?: number;
}

const INTENT_TYPE_LABELS: Record<string, string> = {
  validation: "Idea Validation",
  hiring: "Hiring",
  partnerships: "Partnerships",
  promotions: "Promotions",
  fundraising: "Fundraising",
  clients: "Get Clients",
  dealflow: "Deal Flow",
  jobs: "Find Jobs",
  freelance: "Freelance Work",
  internship: "Internships",
  collaboration: "Collaborations"
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-500/20 text-green-400 border-green-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  fulfilled: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30"
};

export function IntentCard({ intent, onEdit, onDelete, matchCount }: IntentCardProps) {
  const [showMatches, setShowMatches] = useState(false);

  const getIntentSummary = () => {
    const metadata = intent.metadata || {};

    switch (intent.intent_type) {
      case 'hiring':
        return metadata.role || "Looking to hire";
      case 'fundraising':
        return `Raising ${metadata.capital_amount || 'funds'}`;
      case 'partnerships':
        return metadata.partner_type || "Seeking partnership";
      case 'promotions':
        return metadata.campaign_type || "Run promotions";
      case 'validation':
        return "Get feedback on idea";
      case 'clients':
        return metadata.service_type || "Looking for clients";
      case 'jobs':
        return metadata.preferred_roles || "Looking for job opportunities";
      case 'freelance':
        return metadata.skills || "Looking for freelance work";
      default:
        return INTENT_TYPE_LABELS[intent.intent_type] || intent.intent_type;
    }
  };

  return (
    <>
      <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{INTENT_TYPE_LABELS[intent.intent_type] || intent.intent_type}</CardTitle>
                <Badge variant="outline" className={`${STATUS_COLORS[intent.status]} border`}>
                  {intent.status}
                </Badge>
              </div>
              <p className="text-sm text-white/60">{getIntentSummary()}</p>
            </div>

            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(intent)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(intent.id || intent._id)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Metadata preview */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {intent.metadata?.budget_range && (
              <div className="flex items-center gap-1 text-white/50">
                <span>Budget:</span>
                <span className="text-white/70">{intent.metadata.budget_range}</span>
              </div>
            )}
            {intent.metadata?.urgency && (
              <div className="flex items-center gap-1 text-white/50">
                <Clock className="h-3 w-3" />
                <span className="text-white/70 capitalize">{intent.metadata.urgency}</span>
              </div>
            )}
          </div>

          {/* View matches button */}
          <div className="pt-2 border-t border-white/10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMatches(true)}
              className="w-full border-white/20 hover:bg-white/10"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              View Matches
            </Button>
          </div>
        </CardContent>
      </Card>

      <IntentMatchesModal
        open={showMatches}
        onClose={() => setShowMatches(false)}
        intentId={intent.id || intent._id}
        intentType={INTENT_TYPE_LABELS[intent.intent_type] || intent.intent_type}
      />
    </>
  );
}
