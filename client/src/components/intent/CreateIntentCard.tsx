import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText } from "lucide-react";

interface CreateIntentCardProps {
  onFormCreate: () => void;
  onAICreate: () => void;
}

export function CreateIntentCard({ onFormCreate, onAICreate }: CreateIntentCardProps) {
  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
      <CardHeader>
        <CardTitle className="text-xl">What do you need help with?</CardTitle>
        <CardDescription className="text-white/60">
          Create an intent to get matched with the right people
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={onAICreate}
            className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30"
            variant="outline"
          >
            <Sparkles className="h-6 w-6" />
            <div className="text-center">
              <div className="font-semibold">Describe in Your Words</div>
              <div className="text-xs text-white/60 mt-1">AI will understand what you need</div>
            </div>
          </Button>

          <Button
            onClick={onFormCreate}
            className="h-auto py-4 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20"
            variant="outline"
          >
            <FileText className="h-6 w-6" />
            <div className="text-center">
              <div className="font-semibold">Fill a Form</div>
              <div className="text-xs text-white/60 mt-1">Traditional structured approach</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
