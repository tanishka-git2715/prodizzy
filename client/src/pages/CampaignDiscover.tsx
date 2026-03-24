import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { ApplicationFormModal } from "@/components/applications/ApplicationFormModal";
import { ApplicationSuccessDialog } from "@/components/applications/ApplicationSuccessDialog";
import { Filter, X, Search, Loader2 } from "lucide-react";
import type { Campaign } from "@shared/schema";

const CATEGORIES = [
  "All",
  "Hiring",
  "Freelance",
  "Creator",
  "Startup",
  "Testing",
  "Students",
  "Advisory",
  "Fundraising",
  "Agency",
  "General",
  "Growth",
  "Other"
];

const ENGAGEMENT_TYPES = [
  "All",
  "Full-time",
  "Part-time",
  "Contract",
  "Project-based",
  "Equity",
  "Internship",
  "Freelance",
  "Long-term",
  "Advisory"
];

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active
          ? "bg-white text-black border-white"
          : "bg-transparent text-white/55 border-white/15 hover:border-white/30 hover:text-white/80"
      }`}
    >
      {label}
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-40 bg-white/10 rounded" />
          <div className="h-3 w-full bg-white/10 rounded" />
          <div className="h-3 w-2/3 bg-white/10 rounded" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-16 bg-white/10 rounded-full" />
        <div className="h-6 w-20 bg-white/10 rounded-full" />
      </div>
      <div className="h-9 w-full bg-white/10 rounded-lg" />
    </div>
  );
}

export default function CampaignDiscover() {
  const [, setLocation] = useLocation();
  const [category, setCategory] = useState("All");
  const [engagementType, setEngagementType] = useState("All");
  const [location, setLocationFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (category && category !== "All") p.set("category", category);
    if (engagementType && engagementType !== "All") p.set("engagementType", engagementType);
    if (location) p.set("location", location);
    return p;
  }, [category, engagementType, location]);

  const hasActiveFilters = category !== "All" || engagementType !== "All" || location;

  const { data: campaigns, isLoading, error } = useQuery<Campaign[]>({
    queryKey: ["campaigns-discover", category, engagementType, location],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/discover?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load campaigns");
      }
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });

  // Client-side search filter
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    if (!searchQuery) return campaigns;

    const query = searchQuery.toLowerCase();
    return campaigns.filter(
      (campaign) =>
        campaign.title.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query) ||
        campaign.business?.business_name?.toLowerCase().includes(query) ||
        campaign.skills?.some((skill) => skill.toLowerCase().includes(query))
    );
  }, [campaigns, searchQuery]);

  const handleApplyClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplicationModal(false);
    setShowSuccessDialog(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setLocation("/")}
          >
            <div className="text-xl font-bold">
              <span className="text-[#E63946]">Prodizzy</span>
            </div>
            <div className="hidden sm:block text-sm text-white/40">/ Discover Opportunities</div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen((v) => !v)}
              className="border-white/10 text-white/80 bg-white/0 hover:bg-white/5"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10">
                  On
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Filter Panel */}
      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sticky top-[65px] z-30 overflow-hidden border-b border-white/5 bg-black/90 backdrop-blur-xl"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] text-white/30 uppercase tracking-wider mr-1">
                    Category
                  </span>
                  {CATEGORIES.map((cat) => (
                    <FilterPill
                      key={cat}
                      label={cat}
                      active={category === cat}
                      onClick={() => setCategory(cat)}
                    />
                  ))}
                </div>

                {/* Engagement Type Filter */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] text-white/30 uppercase tracking-wider mr-1">
                    Engagement
                  </span>
                  {ENGAGEMENT_TYPES.map((type) => (
                    <FilterPill
                      key={type}
                      label={type}
                      active={engagementType === type}
                      onClick={() => setEngagementType(type)}
                    />
                  ))}
                </div>

                {/* Location Filter */}
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    value={location}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="Filter by location..."
                    className="bg-white/5 border-white/10 text-white text-sm placeholder-white/25 max-w-xs"
                  />
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        setCategory("All");
                        setEngagementType("All");
                        setLocationFilter("");
                      }}
                      className="flex items-center gap-1 text-xs text-white/35 hover:text-white/70 transition-colors"
                    >
                      <X className="w-3 h-3" /> Clear filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header & Search */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Discover Opportunities
              </h1>
              <p className="text-white/35 text-sm mt-1">
                {filteredCampaigns
                  ? `${filteredCampaigns.length} active campaign${filteredCampaigns.length !== 1 ? "s" : ""}`
                  : "Loading..."}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-white/25 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns, companies, or skills..."
              className="bg-white/5 border-white/10 text-white pl-10 placeholder-white/25"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="border border-red-500/20 bg-red-500/10 rounded-2xl p-10 text-center">
            <div className="text-red-400 font-semibold">Failed to load campaigns</div>
            <div className="text-white/40 text-sm mt-1">Please try again later</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredCampaigns?.length === 0 && (
          <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-10 text-center">
            <div className="text-white font-semibold">No campaigns found</div>
            <div className="text-white/40 text-sm mt-1">
              {hasActiveFilters || searchQuery
                ? "Try clearing filters or broadening your search"
                : "Check back later for new opportunities"}
            </div>
            {(hasActiveFilters || searchQuery) && (
              <div className="mt-5">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCategory("All");
                    setEngagementType("All");
                    setLocationFilter("");
                    setSearchQuery("");
                  }}
                  className="border-white/10 text-white/80 bg-white/0 hover:bg-white/5"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Campaign Grid */}
        {!isLoading && filteredCampaigns && filteredCampaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard 
                key={campaign._id} 
                campaign={campaign} 
                onApply={handleApplyClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Application Modals */}
      {selectedCampaign && (
        <>
          <ApplicationFormModal
            campaignId={selectedCampaign._id}
            campaignTitle={selectedCampaign.title}
            open={showApplicationModal}
            onOpenChange={setShowApplicationModal}
            onSuccess={handleApplicationSuccess}
          />
          <ApplicationSuccessDialog
            open={showSuccessDialog}
            onOpenChange={setShowSuccessDialog}
            campaignTitle={selectedCampaign.title}
          />
        </>
      )}
    </div>
  );
}
