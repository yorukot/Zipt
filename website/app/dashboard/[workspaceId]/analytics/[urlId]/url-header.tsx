import * as React from "react";
import { Icon } from "@iconify/react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface URLHeaderProps {
  urlInfo: {
    short_code: string;
    original_url: string;
    created_at: string;
    expires_at: string | null;
  };
}

export function URLHeader({ urlInfo }: URLHeaderProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{urlInfo.short_code}</CardTitle>
        <CardDescription className="truncate max-w-2xl">
          {urlInfo.original_url}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <Icon
              icon="lucide:link"
              className="h-4 w-4 text-muted-foreground"
            />
            <span className="text-sm">{`${window.location.origin}/${urlInfo.short_code}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon
              icon="lucide:clock"
              className="h-4 w-4 text-muted-foreground"
            />
            <span className="text-sm">
              {new Date(urlInfo.created_at).toLocaleDateString()}
            </span>
          </div>
          {urlInfo.expires_at && (
            <div className="flex items-center gap-2">
              <Icon
                icon="lucide:calendar"
                className="h-4 w-4 text-muted-foreground"
              />
              <span className="text-sm">
                Expires: {new Date(urlInfo.expires_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 