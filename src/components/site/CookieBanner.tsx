import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem("viroxen-cookies");
    if (!v) setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (val: "accepted" | "rejected") => {
    localStorage.setItem("viroxen-cookies", val);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-lg border border-border bg-card/95 p-4 shadow-lg backdrop-blur-lg sm:inset-x-4 sm:bottom-4 sm:p-5">
      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          We use only essential cookies to remember your theme and consent preferences. No
          tracking, no third parties.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="ghost" onClick={() => decide("rejected")}>
            Reject
          </Button>
          <Button size="sm" onClick={() => decide("accepted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}