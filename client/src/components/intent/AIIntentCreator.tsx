import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, AlertCircle } from "lucide-react";
import { IntentPreview } from "./IntentPreview";

interface AIIntentCreatorProps {
  open: boolean;
  onClose: () => void;
  profileType: string;
  onSubmit: (intentData: any) => void;
  onSwitchToForm: (parsedData?: any) => void;
}

function authHeaders() {
  return { "Content-Type": "application/json" };
}

export function AIIntentCreator({ open, onClose, profileType, onSubmit, onSwitchToForm }: AIIntentCreatorProps) {
  const [userText, setUserText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedIntent, setParsedIntent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!userText.trim()) {
      setError("Please describe what you need");
      return;
    }

    setParsing(true);
    setError(null);

    try {
      const response = await fetch("/api/intents/parse-ai", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          text: userText,
          profile_type: profileType
        })
      });

      if (!response.ok) {
        throw new Error("Failed to parse intent");
      }

      const data = await response.json();

      if (data.intent_type === "unclear" || (data.confidence && data.confidence < 60)) {
        setError(`I'm not quite sure what you need. Did you mean: ${data.suggestions?.join(", ") || "hiring, fundraising, or partnerships"}?`);
        setParsing(false);
        return;
      }

      setParsedIntent(data);
    } catch (err: any) {
      setError(err.message || "Failed to parse your request. Please try again.");
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = () => {
    if (parsedIntent) {
      onSubmit({
        profile_type: profileType,
        intent_type: parsedIntent.intent_type,
        metadata: parsedIntent.metadata || {}
      });
      handleReset();
    }
  };

  const handleEdit = () => {
    onSwitchToForm(parsedIntent);
    handleReset();
  };

  const handleReset = () => {
    setUserText("");
    setParsedIntent(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const EXAMPLES: Record<string, string[]> = {
    startup: [
      "I need to hire a frontend developer with React experience. Budget is around ₹40k per month. Need someone to start in 2 weeks.",
      "Looking to raise ₹50 lakhs seed funding for my SaaS startup in the edtech space.",
      "Need a marketing agency to help with our product launch next month."
    ],
    partner: [
      "Looking for SaaS startups who need AI automation services. We work with seed to Series A companies.",
      "Want to connect with early-stage fintech startups for potential investments."
    ],
    individual: [
      "Looking for full-time React developer position at an early-stage startup. 3 years experience, expecting ₹50-60k per month.",
      "Available for freelance UI/UX design projects. Can work 20 hours per week."
    ]
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-black border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            What do you need?
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Describe in your own words what you're looking for. Our AI will understand and create a structured intent.
          </DialogDescription>
        </DialogHeader>

        {!parsedIntent ? (
          <div className="space-y-4">
            <div>
              <Textarea
                placeholder="Example: I need to hire a React developer with 2+ years experience. Budget is ₹40-50k per month. Need someone to start in 2 weeks..."
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                rows={6}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
              />
              {EXAMPLES[profileType] && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-white/50">Examples:</p>
                  {EXAMPLES[profileType].slice(0, 2).map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setUserText(example)}
                      className="block text-xs text-blue-400 hover:text-blue-300 text-left"
                    >
                      • {example}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleParse}
                disabled={parsing || !userText.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                {parsing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Parse with AI
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <IntentPreview
            intent={parsedIntent}
            profileType={profileType}
            onConfirm={handleConfirm}
            onEdit={handleEdit}
            onCancel={handleReset}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
