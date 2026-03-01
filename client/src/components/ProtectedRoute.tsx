import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  component: React.ComponentType;
}

export default function ProtectedRoute({ component: Component }: Props) {
  const { session, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    setLocation("/login");
    return null;
  }

  return <Component />;
}
