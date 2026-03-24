import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareCampaignDialogProps {
  campaignId: string | null;
  campaignTitle: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareCampaignDialog({
  campaignId,
  campaignTitle,
  open,
  onOpenChange,
}: ShareCampaignDialogProps) {
  const { toast } = useToast();
  const [linkCopied, setLinkCopied] = useState(false);

  const shareUrl = campaignId ? `${window.location.origin}/c/${campaignId}` : "";
  const shareText = `Check out this opportunity: ${campaignTitle || "Campaign"}`;

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast({
        title: "Link Copied!",
        description: "Campaign link copied to clipboard",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const shareOnPlatform = (platform: string) => {
    if (!shareUrl) return;

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-white/10 text-white max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#E63946]" />
            Share Campaign
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Share this opportunity to reach more people.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Shareable Link */}
          <div>
            <Label className="text-sm text-white/60 mb-2 block">Shareable Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="bg-white/5 border-white/10 font-mono text-sm h-10"
              />
              <Button
                onClick={copyShareLink}
                variant="outline"
                className="bg-white/5 border-white/10 h-10"
              >
                {linkCopied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="ml-2">{linkCopied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div>
            <Label className="text-sm text-white/60 mb-3 block">Share on Social Media</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                onClick={() => shareOnPlatform("whatsapp")}
                variant="outline"
                className="bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-xs sm:text-sm"
              >
                WhatsApp
              </Button>

              <Button
                onClick={() => shareOnPlatform("twitter")}
                variant="outline"
                className="bg-blue-400/10 border-blue-400/30 hover:bg-blue-400/20 text-xs sm:text-sm"
              >
                Twitter
              </Button>

              <Button
                onClick={() => shareOnPlatform("linkedin")}
                variant="outline"
                className="bg-blue-600/10 border-blue-600/30 hover:bg-blue-600/20 text-xs sm:text-sm"
              >
                LinkedIn
              </Button>

              <Button
                onClick={() => shareOnPlatform("facebook")}
                variant="outline"
                className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-xs sm:text-sm"
              >
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
