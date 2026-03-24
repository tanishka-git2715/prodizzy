import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BusinessDetailView } from "@/components/campaigns/BusinessDetailView";
import type { Business } from "@shared/schema";

export default function PublicBusinessProfile() {
  const [, params] = useRoute("/business/:id/view");
  const [, setLocation] = useLocation();
  const businessId = params?.id;

  const { data: business, isLoading } = useQuery<Business>({
    queryKey: ["public-business", businessId],
    queryFn: async () => {
      const response = await fetch(`/api/public/business/${businessId}`);
      if (!response.ok) {
        throw new Error("Failed to load business profile");
      }
      return response.json();
    },
    enabled: !!businessId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white/60">
        <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
        <Button variant="outline" onClick={() => setLocation("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-8 text-white/40 hover:text-white p-0 h-auto hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-[#E63946]/20 to-blue-500/20" />
          
          <div className="p-8 -mt-16">
            <BusinessDetailView business={business as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
