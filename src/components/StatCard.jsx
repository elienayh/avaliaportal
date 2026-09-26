import React from "react";
import { Card } from "@/components/ui/card";

export default function StatCard({ icon: Icon, label, value, tone = "default" }) {
  const tones = {
    default: "bg-primary/10 text-primary",
    action: "bg-action/10 text-action",
    reserved: "bg-reserved/10 text-reserved",
  };
  return (
    <Card className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0">
        <div className="text-xl sm:text-2xl font-bold font-display text-foreground leading-none">
          {value}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
          {label}
        </div>
      </div>
    </Card>
  );
}