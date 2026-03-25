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
  campaignCategory?: string;
  customFields?: Array<{ name: string; label: string; type: string; required?: boolean }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ApplicationFormModal({
  campaignId,
  campaignTitle,
  campaignCategory,
  open,
  onOpenChange,
  onSuccess,
}: ApplicationFormModalProps) {
  const { toast } = useToast();
  const createApplication = useCreateApplication(campaignId);

  const [formData, setFormData] = useState({
    message: "",
    contact_details: "",
    reference_link: "",
    resume_url: "",
    answers: {} as Record<string, any>,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    try {
      await createApplication.mutateAsync(formData);
      onSuccess();
      // Reset form
      setFormData({ message: "", contact_details: "", reference_link: "", resume_url: "", answers: {} });
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
            <Label htmlFor="message">
              {campaignCategory === "Testing" ? "Give your feedback" : "Message / Cover Letter"}
            </Label>
            <Textarea
              id="message"
              placeholder={
                campaignCategory === "Testing" 
                  ? "What are your thoughts or suggestions?" 
                  : "Tell the campaign creator why you're a good fit..."
              }
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
              className="bg-white/5 border-white/10 text-white mt-1"
              required
            />
          </div>

          {/* Reference Link */}
          <div>
            <Label htmlFor="reference_link">Reference Link (Optional)</Label>
            <Input
              id="reference_link"
              type="url"
              placeholder="e.g. LinkedIn, Portfolio, GitHub"
              value={formData.reference_link}
              onChange={(e) => setFormData({ ...formData, reference_link: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1"
            />
          </div>
          
          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume" className="text-sm">Upload File (Optional)</Label>
            <input 
              type="file" 
              id="resume"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData((prev) => ({ ...prev, resume_url: reader.result as string }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
            />
            {formData.resume_url && formData.resume_url.length >= 500 && (
              <p className="text-xs text-green-400/70 ml-1">File selected and ready to save</p>
            )}
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
