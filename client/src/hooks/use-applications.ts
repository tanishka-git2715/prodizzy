import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CampaignApplication, InsertCampaignApplication } from "@shared/schema";

// 1. Create application mutation
export function useCreateApplication(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<InsertCampaignApplication, "campaign_id">) => {
      const response = await fetch(`/api/campaigns/${campaignId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...data, campaign_id: campaignId }),
      });
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("You have already applied to this campaign");
        }
        throw new Error("Failed to submit application");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-campaign", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });
}

// 2. Fetch campaign applications (business owner)
export function useCampaignApplications(campaignId: string) {
  return useQuery<CampaignApplication[]>({
    queryKey: ["campaigns", campaignId, "applications"],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/applications`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
    enabled: !!campaignId,
  });
}

// 3. Fetch user's applications
export function useMyApplications() {
  return useQuery<CampaignApplication[]>({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const response = await fetch("/api/my-applications", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
  });
}

// 4. Update application status (accept/reject)
export function useUpdateApplicationStatus(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: "accepted" | "rejected" }) => {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", campaignId, "applications"] });
    },
  });
}
