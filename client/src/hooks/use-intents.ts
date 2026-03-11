import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function authHeaders() {
  return { "Content-Type": "application/json" };
}

export function useIntents() {
  const queryClient = useQueryClient();

  // Fetch user's intents
  const { data: intents = [], isLoading } = useQuery({
    queryKey: ["intents"],
    queryFn: async () => {
      const response = await fetch("/api/intents", { headers: authHeaders() });
      if (!response.ok) throw new Error("Failed to fetch intents");
      return response.json();
    }
  });

  // Create intent mutation
  const createIntent = useMutation({
    mutationFn: async (intentData: any) => {
      const response = await fetch("/api/intents", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(intentData)
      });
      if (!response.ok) throw new Error("Failed to create intent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intents"] });
    }
  });

  // Update intent mutation
  const updateIntent = useMutation({
    mutationFn: async ({ intentId, updates }: { intentId: string; updates: any }) => {
      const response = await fetch(`/api/intents/${intentId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error("Failed to update intent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intents"] });
    }
  });

  // Delete intent mutation
  const deleteIntent = useMutation({
    mutationFn: async (intentId: string) => {
      const response = await fetch(`/api/intents/${intentId}`, {
        method: "DELETE",
        headers: authHeaders()
      });
      if (!response.ok) throw new Error("Failed to delete intent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intents"] });
    }
  });

  return {
    intents,
    isLoading,
    createIntent,
    updateIntent,
    deleteIntent
  };
}
