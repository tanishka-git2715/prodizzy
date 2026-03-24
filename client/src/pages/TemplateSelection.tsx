import { useLocation, useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { campaignTemplates } from "@/lib/campaignTemplates";
import { useMemo } from "react";

export default function TemplateSelection() {
  const [location, setLocation] = useLocation();
  const [, businessParams] = useRoute("/business/:businessId/campaigns/new");

  // Determine if this is a business or individual campaign
  const { isBusinessCampaign, businessId } = useMemo(() => {
    const isBusiness = location.includes('/business/');
    const bId = businessParams?.businessId;
    return {
      isBusinessCampaign: isBusiness && bId,
      businessId: bId
    };
  }, [location, businessParams]);

  const handleTemplateSelect = (templateId: string) => {
    if (isBusinessCampaign) {
      setLocation(`/business/${businessId}/campaigns/create?template=${templateId}`);
    } else {
      setLocation(`/campaigns/create?template=${templateId}`);
    }
  };

  const handleBackClick = () => {
    if (isBusinessCampaign) {
      setLocation(`/business/${businessId}`);
    } else {
      setLocation('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="mb-4 text-white/60 hover:text-white -ml-2 sm:ml-0"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex items-start gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center gap-2">
                <span>⭐</span> PRODIZZY CAMPAIGN TEMPLATES
              </h1>
              <p className="text-sm sm:text-base text-white/60">Choose a template to get started</p>
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {campaignTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg mb-1 group-hover:text-blue-400 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/60 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Tip */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-white/40 px-4">
            All templates are fully customizable after selection
          </p>
        </div>
      </div>
    </div>
  );
}
