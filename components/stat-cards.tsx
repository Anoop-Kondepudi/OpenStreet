import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShieldAlert, Lightbulb, Users, Building2 } from "lucide-react";
import issueData from "@/docs/issue.json";
import ideaData from "@/docs/idea.json";
import civilianEventData from "@/docs/civilian-event.json";
import governmentEventData from "@/docs/government-event.json";

// Calculate metrics from JSON data
const issueReports = issueData.reports.length;
const ideaReports = ideaData.reports.length;
const civilianEventReports = civilianEventData.reports.length;
const governmentEventReports = governmentEventData.reports.length;
const totalReports = issueReports + ideaReports + civilianEventReports + governmentEventReports;

// Calculate reports today (2025-11-09)
const today = "2025-11-09";
const reportsToday = [
  ...issueData.reports,
  ...ideaData.reports,
  ...civilianEventData.reports,
  ...governmentEventData.reports
].filter((report) => report.timestamp.startsWith(today)).length;

const stats = [
  {
    title: "Total Reports",
    value: totalReports.toString(),
    icon: FileText,
    trend: `${issueReports} issues, ${ideaReports} ideas, ${civilianEventReports + governmentEventReports} events`,
    trendUp: true,
  },
  {
    title: "Issues",
    value: issueReports.toString(),
    icon: ShieldAlert,
    trend: `${Math.round((issueReports / totalReports) * 100)}% of total`,
    trendUp: false,
  },
  {
    title: "Ideas",
    value: ideaReports.toString(),
    icon: Lightbulb,
    trend: `${Math.round((ideaReports / totalReports) * 100)}% of total`,
    trendUp: true,
  },
  {
    title: "Civilian Events",
    value: civilianEventReports.toString(),
    icon: Users,
    trend: `${Math.round((civilianEventReports / totalReports) * 100)}% of total`,
    trendUp: true,
  },
  {
    title: "Government Events",
    value: governmentEventReports.toString(),
    icon: Building2,
    trend: `${Math.round((governmentEventReports / totalReports) * 100)}% of total`,
    trendUp: true,
  },
];

export function StatCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={stat.trendUp ? "text-green-600" : "text-red-600"}>
                  {stat.trend}
                </span>
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
