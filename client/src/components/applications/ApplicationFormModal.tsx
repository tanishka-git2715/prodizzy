import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateApplication } from "@/hooks/use-applications";
import { Loader2 } from "lucide-react";

interface ApplicationFormModalProps {
  campaignId: string;
  campaignTitle: string;
  customFields?: Array<{ name: string; label: string; type: string; required?: boolean }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ApplicationFormModal({
  campaignId,
  campaignTitle,
  open,
  onOpenChange,
  onSuccess,
}: ApplicationFormModalProps) {
  const { toast } = useToast();
  const createApplication = useCreateApplication(campaignId);

  const [formData, setFormData] = useState({
    message: "",
    contact_details: "",
    answers: {} as Record<string, any>,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    try {
      await createApplication.mutateAsync(formData);
      onSuccess();
      // Reset form
      setFormData({ message: "", contact_details: "", answers: {} });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to {campaignTitle}</DialogTitle>
          <DialogDescription className="text-white/60">
            Submit your application. Both fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Message */}
          <div>
            <Label htmlFor="message">Tell us more about yourself</Label>
            <Textarea
              id="message"
              placeholder="Why are you interested in this opportunity?"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="bg-white/5 border-white/10 text-white min-h-32 resize-none"
              maxLength={500}
              required
            />
            <p className="text-xs text-white/40 mt-1">{formData.message.length}/500</p>
          </div>

          {/* Contact Details */}
          <div>
            <Label htmlFor="contact_details">Add your point of contact</Label>
            <Input
              id="contact_details"
              type="text"
              placeholder="Phone number or preferred contact method"
              value={formData.contact_details}
              onChange={(e) => setFormData({ ...formData, contact_details: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={createApplication.isPending}
              className="flex-1 bg-[#E63946] hover:bg-[#E63946]/90"
            >
              {createApplication.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/5 border-white/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
