import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertWaitlistEntry, WaitlistResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCreateWaitlist() {
  const { toast } = useToast();

  return useMutation<WaitlistResponse, Error, InsertWaitlistEntry>({
    mutationFn: async (data: InsertWaitlistEntry) => {
      const res = await fetch(api.waitlist.create.path, {
        method: api.waitlist.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("This email is already on the waitlist.");
        }
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to join waitlist");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to the future of networking.",
        description: "You've been added to the priority waitlist.",
        variant: "default",
        className: "bg-primary text-primary-foreground border-none",
      });
    },
    onError: (error) => {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
