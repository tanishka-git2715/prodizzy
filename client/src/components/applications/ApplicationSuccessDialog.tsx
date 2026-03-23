import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

interface ApplicationSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignTitle: string;
}

export function ApplicationSuccessDialog({
  open,
  onOpenChange,
  campaignTitle,
}: ApplicationSuccessDialogProps) {
  const [, setLocation] = useLocation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-white/10 text-white max-w-md text-center">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">Application Submitted!</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4 text-center">
          <p className="text-white/60">
            Your application to <span className="text-white font-medium">{campaignTitle}</span> has
            been submitted successfully.
          </p>
          <p className="text-sm text-white/40">
            you'll be notified once owner reviews your application.
          </p>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={() => {
                setLocation("/my-applications");
                onOpenChange(false);
              }}
              className="bg-[#E63946] hover:bg-[#E63946]/90"
            >
              View My Applications
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/5 border-white/10"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
