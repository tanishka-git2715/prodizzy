import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface FunnelChartProps {
  data: {
    signups: number;
    profileCompleted: number;
    firstBrowse: number;
    firstConnection: number;
    acceptedConnection: number;
    conversionRates: {
      signupToProfile: string;
      profileToBrowse: string;
      browseToConnection: string;
      connectionToAccepted: string;
    };
  };
}

export function FunnelChart({ data }: FunnelChartProps) {
  const funnelData = [
    {
      stage: "Signups",
      users: data.signups,
      rate: "100%",
      color: "#3b82f6"
    },
    {
      stage: "Profile Completed",
      users: data.profileCompleted,
      rate: data.conversionRates.signupToProfile + "%",
      color: "#8b5cf6"
    },
    {
      stage: "First Browse",
      users: data.firstBrowse,
      rate: data.conversionRates.profileToBrowse + "%",
      color: "#ec4899"
    },
    {
      stage: "First Connection",
      users: data.firstConnection,
      rate: data.conversionRates.browseToConnection + "%",
      color: "#f59e0b"
    },
    {
      stage: "Accepted Connection",
      users: data.acceptedConnection,
      rate: data.conversionRates.connectionToAccepted + "%",
      color: "#10b981"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Funnel</CardTitle>
        <CardDescription>User conversion at each stage</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={funnelData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={150} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold">{data.stage}</p>
                      <p className="text-sm text-gray-600">Users: {data.users}</p>
                      <p className="text-sm text-gray-600">Conversion: {data.rate}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="users" radius={[0, 8, 8, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {funnelData.map((item) => (
            <div key={item.stage} className="text-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">{item.stage}</div>
              <div className="text-2xl font-bold">{item.users}</div>
              <div className="text-xs text-muted-foreground">{item.rate}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
