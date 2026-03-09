import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Edit2, X } from "lucide-react";

interface IntentPreviewProps {
  intent: any;
  profileType: string;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
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

export function IntentPreview({ intent, profileType, onConfirm, onEdit, onCancel }: IntentPreviewProps) {
  const metadata = intent.metadata || {};

  const renderMetadataField = (key: string, value: any) => {
    if (!value) return null;

    const label = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    if (Array.isArray(value)) {
      return (
        <div key={key}>
          <span className="text-white/50 text-sm">{label}:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {value.map((item, i) => (
              <span key={i} className="px-2 py-0.5 bg-white/10 rounded-md text-xs text-white/80">
                {item}
              </span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={key}>
        <span className="text-white/50 text-sm">{label}:</span>
        <span className="text-white/90 ml-2">{value}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            We understood your intent!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-white/50 text-sm">Intent Type:</span>
            <span className="text-white/90 font-semibold ml-2">
              {INTENT_TYPE_LABELS[intent.intent_type] || intent.intent_type}
            </span>
          </div>

          {Object.entries(metadata).map(([key, value]) => renderMetadataField(key, value))}

          {intent.confidence && (
            <div className="pt-2 border-t border-white/10">
              <span className="text-white/50 text-xs">
                Confidence: {intent.confidence}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={onConfirm}
          className="flex-1 bg-green-500 hover:bg-green-600"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Confirm & Create
        </Button>
        <Button
          onClick={onEdit}
          variant="outline"
          className="border-white/20 hover:bg-white/10"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
