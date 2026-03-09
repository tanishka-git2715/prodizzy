import { useState } from "react";
import { useIntents } from "@/hooks/use-intents";
import { CreateIntentCard } from "./CreateIntentCard";
import { AIIntentCreator } from "./AIIntentCreator";
import { FormIntentCreator } from "./FormIntentCreator";
import { ActiveIntentsGrid } from "./ActiveIntentsGrid";
import { useToast } from "@/hooks/use-toast";

interface IntentSectionProps {
  profileType: string;
}

export function IntentSection({ profileType }: IntentSectionProps) {
  const { intents, createIntent, deleteIntent } = useIntents();
  const { toast } = useToast();
  const [creationMode, setCreationMode] = useState<"none" | "ai" | "form">("none");

  const handleCreateIntent = async (intentData: any) => {
    try {
      await createIntent.mutateAsync(intentData);
      toast({
        title: "Intent created",
        description: "Your intent has been created successfully"
      });
      setCreationMode("none");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create intent",
        variant: "destructive"
      });
    }
  };

  const handleDeleteIntent = async (intentId: string) => {
    if (!confirm("Are you sure you want to delete this intent?")) return;

    try {
      await deleteIntent.mutateAsync(intentId);
      toast({
        title: "Intent deleted",
        description: "Your intent has been deleted"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete intent",
        variant: "destructive"
      });
    }
  };

  const activeIntents = intents.filter((intent: any) => intent.status === "open");

  return (
    <div className="space-y-6">
      {/* Active Intents */}
      {activeIntents.length > 0 && (
        <ActiveIntentsGrid
          intents={activeIntents}
          onDelete={handleDeleteIntent}
        />
      )}

      {/* Create Intent Card */}
      <CreateIntentCard
        onFormCreate={() => setCreationMode("form")}
        onAICreate={() => setCreationMode("ai")}
      />

      {/* AI Intent Creator Modal */}
      <AIIntentCreator
        open={creationMode === "ai"}
        onClose={() => setCreationMode("none")}
        profileType={profileType}
        onSubmit={handleCreateIntent}
        onSwitchToForm={(parsedData) => {
          setCreationMode("form");
          // TODO: Pass parsedData to FormIntentCreator if needed
        }}
      />

      {/* Form Intent Creator Modal */}
      <FormIntentCreator
        open={creationMode === "form"}
        onClose={() => setCreationMode("none")}
        profileType={profileType}
        onSubmit={handleCreateIntent}
      />
    </div>
  );
}
