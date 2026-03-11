import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText } from "lucide-react";

interface CreateIntentCardProps {
  onFormCreate: () => void;
  onAICreate: () => void;
}

export function CreateIntentCard({ onFormCreate, onAICreate }: CreateIntentCardProps) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">What do you need help with?</CardTitle>
        <CardDescription className="text-white/50">
          Create an intent to get matched with the right people
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={onAICreate}
            className="flex flex-col items-start gap-3 rounded-lg border border-white/15 bg-white/5 p-5 text-left transition-colors hover:border-white/25 hover:bg-white/10"
          >
            <Sparkles className="h-5 w-5 text-white/70" />
            <div>
              <div className="font-medium text-white mb-1">Describe in Your Words</div>
              <div className="text-sm text-white/50">AI will understand what you need</div>
            </div>
          </button>

          <button
            onClick={onFormCreate}
            className="flex flex-col items-start gap-3 rounded-lg border border-white/15 bg-white/5 p-5 text-left transition-colors hover:border-white/25 hover:bg-white/10"
          >
            <FileText className="h-5 w-5 text-white/70" />
            <div>
              <div className="font-medium text-white mb-1">Fill a Form</div>
              <div className="text-sm text-white/50">Traditional structured approach</div>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
