import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CohortData {
  cohort: string;
  signupCount: number;
  retention: {
    month0: number;
    month1: number;
    month2: number;
    month3: number;
    month6: number;
  };
}

interface CohortTableProps {
  data: CohortData[];
}

export function CohortTable({ data }: CohortTableProps) {
  const getRetentionColor = (rate: number) => {
    if (rate >= 80) return "bg-green-500/20 text-green-700";
    if (rate >= 60) return "bg-green-400/20 text-green-600";
    if (rate >= 40) return "bg-yellow-400/20 text-yellow-700";
    if (rate >= 20) return "bg-orange-400/20 text-orange-700";
    return "bg-red-400/20 text-red-700";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cohort Retention Analysis</CardTitle>
        <CardDescription>User retention by signup month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cohort</TableHead>
                <TableHead className="text-right">Signups</TableHead>
                <TableHead className="text-center">Month 0</TableHead>
                <TableHead className="text-center">Month 1</TableHead>
                <TableHead className="text-center">Month 2</TableHead>
                <TableHead className="text-center">Month 3</TableHead>
                <TableHead className="text-center">Month 6</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No cohort data available yet
                  </TableCell>
                </TableRow>
              ) : (
                data.map((cohort) => (
                  <TableRow key={cohort.cohort}>
                    <TableCell className="font-medium">{cohort.cohort}</TableCell>
                    <TableCell className="text-right">{cohort.signupCount}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-md ${getRetentionColor(cohort.retention.month0)}`}>
                        {cohort.retention.month0.toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-md ${getRetentionColor(cohort.retention.month1)}`}>
                        {cohort.retention.month1.toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-md ${getRetentionColor(cohort.retention.month2)}`}>
                        {cohort.retention.month2.toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-md ${getRetentionColor(cohort.retention.month3)}`}>
                        {cohort.retention.month3.toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-md ${getRetentionColor(cohort.retention.month6)}`}>
                        {cohort.retention.month6.toFixed(0)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
