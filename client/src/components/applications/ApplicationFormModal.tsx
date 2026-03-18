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
  customFields = [],
  open,
  onOpenChange,
  onSuccess,
}: ApplicationFormModalProps) {
  const { toast } = useToast();
  const createApplication = useCreateApplication(campaignId);

  const [formData, setFormData] = useState({
    message: "",
    resume_url: "",
    portfolio_url: "",
    answers: {} as Record<string, any>,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URLs if provided
    if (formData.resume_url && !isValidUrl(formData.resume_url)) {
      toast({ title: "Invalid URL", description: "Please enter a valid resume URL", variant: "destructive" });
      return;
    }
    if (formData.portfolio_url && !isValidUrl(formData.portfolio_url)) {
      toast({ title: "Invalid URL", description: "Please enter a valid portfolio URL", variant: "destructive" });
      return;
    }

    try {
      await createApplication.mutateAsync(formData);
      onSuccess();
      // Reset form
      setFormData({ message: "", resume_url: "", portfolio_url: "", answers: {} });
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
            Submit your application. All fields are optional unless marked as required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Message */}
          <div>
            <Label htmlFor="message">Cover Letter / Message</Label>
            <Textarea
              id="message"
              placeholder="Why are you interested in this opportunity?"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="bg-white/5 border-white/10 text-white min-h-32"
              maxLength={500}
            />
            <p className="text-xs text-white/40 mt-1">{formData.message.length}/500</p>
          </div>

          {/* Resume URL */}
          <div>
            <Label htmlFor="resume">Resume URL</Label>
            <Input
              id="resume"
              type="url"
              placeholder="https://..."
              value={formData.resume_url}
              onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Portfolio URL */}
          <div>
            <Label htmlFor="portfolio">Portfolio / Work Samples URL</Label>
            <Input
              id="portfolio"
              type="url"
              placeholder="https://..."
              value={formData.portfolio_url}
              onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Dynamic Custom Fields */}
          {customFields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  required={field.required}
                  value={formData.answers[field.name] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      answers: { ...formData.answers, [field.name]: e.target.value },
                    })
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type || "text"}
                  required={field.required}
                  value={formData.answers[field.name] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      answers: { ...formData.answers, [field.name]: e.target.value },
                    })
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              )}
            </div>
          ))}

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
