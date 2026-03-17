import { useLocation } from "wouter";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { campaignTemplates } from "@/lib/campaignTemplates";

export default function TemplateSelection() {
  const [, params] = useRoute("/business/:businessId/campaigns/new");
  const [, setLocation] = useLocation();
  const businessId = params?.businessId;

  const handleTemplateSelect = (templateId: string) => {
    setLocation(`/business/${businessId}/campaigns/create?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/business/${businessId}`)}
            className="mb-4 text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#E63946]/10 border border-[#E63946]/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#E63946]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Launch an Opportunity</h1>
              <p className="text-white/60">Choose a template to get started in seconds</p>
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaignTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-400 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-sm text-white/60 line-clamp-2">
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
        <div className="mt-8 text-center">
          <p className="text-sm text-white/40">
            All templates are fully customizable after selection
          </p>
        </div>
      </div>
    </div>
  );
}
