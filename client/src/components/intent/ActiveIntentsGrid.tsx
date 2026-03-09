import { IntentCard } from "./IntentCard";

interface ActiveIntentsGridProps {
  intents: any[];
  onEdit?: (intent: any) => void;
  onDelete?: (intentId: string) => void;
  onViewMatches?: (intentId: string) => void;
  matchCounts?: Record<string, number>;
}

export function ActiveIntentsGrid({ intents, onEdit, onDelete, onViewMatches, matchCounts }: ActiveIntentsGridProps) {
  if (intents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Your Active Intents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {intents.map((intent) => (
          <IntentCard
            key={intent.id || intent._id}
            intent={intent}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewMatches={onViewMatches}
            matchCount={matchCounts?.[intent.id || intent._id]}
          />
        ))}
      </div>
    </div>
  );
}
