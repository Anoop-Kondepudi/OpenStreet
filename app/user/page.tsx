"use client";

import { MapboxMap } from "@/components/mapbox-map";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function UserPage() {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Civic Link</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View community reports in your area
          </p>
        </div>
      </header>

      {/* Map - Full screen below header */}
      <main className="flex-1 p-4">
        <div className="h-full w-full">
          <MapboxMap onReportSelect={() => {}} />
        </div>
      </main>
    </div>
  );
}
