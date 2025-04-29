"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { API_URLS } from "@/lib/api-urls";
import { Badge } from "@/components/ui/badge";

interface DomainSettingsProps {
  workspaceId: string;
}

interface DomainData {
  domain: string;
  verified: boolean;
  verify_token?: string;
}

interface DomainListData
  extends Array<{
    id: string;
    workspace_id: string;
    domain: string;
    verified: boolean;
    verify_token?: string;
    created_at: string;
    updated_at: string;
  }> {}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DomainSettings({ workspaceId }: DomainSettingsProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [newDomain, setNewDomain] = React.useState("");
  const [isValidDomain, setIsValidDomain] = React.useState(true);
  const t = useTranslations("Dashboard");

  const {
    data: currentDomain,
    error: currentDomainError,
    mutate: mutateCurrentDomain,
  } = useSWR<DomainData>(API_URLS.WORKSPACE.DOMAIN.GET(workspaceId), fetcher);

  const {
    data: domainList,
    error: domainListError,
    mutate: mutateDomainList,
  } = useSWR<DomainListData>(
    API_URLS.WORKSPACE.DOMAIN.LIST(workspaceId),
    fetcher
  );

  const checkDomainValidity = (domain: string) => {
    // Basic domain format validation
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    const isValid = domainRegex.test(domain);
    setIsValidDomain(isValid);
    return isValid;
  };

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!checkDomainValidity(newDomain)) {
        toast.error(t("settings.invalidDomainFormat"));
        return;
      }

      const response = await fetch(
        API_URLS.WORKSPACE.DOMAIN.CREATE(workspaceId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ domain: newDomain }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (error.error === "resource_already_exists") {
          toast.error(t("settings.domainExists"));
        } else {
          throw new Error("Failed to create domain");
        }
        return;
      }

      const data = await response.json();
      if (data.result?.verify_token) {
        // Show verification instructions
        toast.info(t("settings.verificationInstructions"), {
          duration: 10000,
        });
      }

      await Promise.all([mutateCurrentDomain(), mutateDomainList()]);
      setNewDomain("");
      toast.success(t("settings.savedDomain"));
    } catch (error) {

      toast.error(t("settings.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const response = await fetch(
        API_URLS.WORKSPACE.DOMAIN.VERIFY(workspaceId, domainId)
      );
      const data = await response.json();

      if (!response.ok) {
        if (data.result?.verify_token) {
          // Show verification instructions with the new token
          toast.info(t("settings.verificationInstructions"), {
            duration: 10000,
          });
        } else {
          throw new Error("Failed to verify domain");
        }
        return;
      }

      await Promise.all([mutateCurrentDomain(), mutateDomainList()]);
      toast.success(t("settings.domainVerified"));
    } catch (error) {
      toast.error(t("settings.verificationError"));
    }
  };

  if (currentDomainError || domainListError)
    return <div>Failed to load domain settings, please try again later.</div>;

  // Sort domains to show unverified ones first
  const sortedDomains = domainList
    ? [...domainList].sort((a, b) => {
        if (a.verified === b.verified) return 0;
        return a.verified ? 1 : -1;
      })
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.domainSettings")}</CardTitle>
        <CardDescription>{t("settings.domainDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDomainSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("settings.addNewDomain")}
            </label>
            <div className="flex gap-2">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                className={!isValidDomain ? "border-red-500" : ""}
              />
              <Button type="submit" disabled={isLoading || !newDomain}>
                {isLoading && (
                  <Icon
                    icon="lucide:loader-2"
                    className="mr-2 h-4 w-4 animate-spin"
                  />
                )}
                {t("settings.addDomain")}
              </Button>
            </div>
            {!isValidDomain && (
              <p className="text-sm text-red-500">
                {t("settings.invalidDomainFormat")}
              </p>
            )}
          </div>
        </form>

        <div className="space-y-4 mt-6">
          <h3 className="text-sm font-medium">{t("settings.yourDomains")}</h3>

          {sortedDomains.length > 0 ? (
            sortedDomains.map((domain) => (
              <div
                key={domain.id}
                className="flex flex-col space-y-4 md:space-y-0 p-4 border rounded-lg"
              >
                <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{domain.domain}</span>
                    {!domain.verified && (
                      <Badge
                        variant="outline"
                        className="px-2 py-1 text-xs rounded bg-destructive text-destructive-foreground"
                      >
                        {t("settings.unverified")}
                      </Badge>
                    )}
                  </div>
                  {!domain.verified && (
                    <Button
                      variant="outline"
                      onClick={() => handleVerifyDomain(domain.id)}
                    >
                      {t("settings.verifyDomain")}
                    </Button>
                  )}
                </div>

                {!domain.verified && domain.verify_token && (
                  <div className="space-y-2 mt-2">
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-2">
                        Add the following DNS records to verify domain
                        ownership:
                      </p>

                      <div className="space-y-4">
                        {/* DNS Records Table */}
                        <div className="overflow-x-auto rounded-lg border">
                          <table className="w-full text-sm">
                            <thead className="bg-muted">
                              <tr>
                                <th
                                  className="px-4 py-2 text-left font-medium whitespace-nowrap"
                                  style={{ width: "1%" }}
                                >
                                  Type
                                </th>
                                <th
                                  className="px-4 py-2 text-left font-medium whitespace-nowrap"
                                  style={{ width: "1%" }}
                                >
                                  Name
                                </th>
                                <th className="px-4 py-2 text-left font-medium">
                                  Content
                                </th>
                                <th
                                  className="px-4 py-2 text-left font-medium whitespace-nowrap"
                                  style={{ width: "1%" }}
                                >
                                  TTL
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Check if domain is a subdomain */}
                              {(() => {
                                // Count the number of dots to determine if it's a subdomain
                                // "example.com" has 1 dot, while "sub.example.com" has 2+
                                const domainParts = domain.domain.split(".");
                                const isSubdomain = domainParts.length > 2;
                                const nameValue = isSubdomain
                                  ? domainParts[0]
                                  : "@";
                                // For subdomains, we need the main domain for DNS settings
                                const mainDomain = isSubdomain
                                  ? domainParts.slice(1).join(".")
                                  : domain.domain;

                                return (
                                  <>
                                    {/* TXT Record */}
                                    <tr className="border-t">
                                      <td className="px-4 py-3 font-mono whitespace-nowrap">
                                        TXT
                                      </td>
                                      <td className="px-4 py-3 font-mono whitespace-nowrap">
                                        {nameValue}
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 flex-shrink-0 p-0 rounded-full"
                                            onClick={() => {
                                              navigator.clipboard.writeText(
                                                domain.verify_token || ""
                                              );
                                              toast.success(
                                                t("settings.tokenCopied")
                                              );
                                            }}
                                            title="Copy to clipboard"
                                          >
                                            <Icon
                                              icon="lucide:copy"
                                              className="h-4 w-4"
                                            />
                                          </Button>
                                          <div className="overflow-x-auto">
                                            <code className="font-mono text-sm whitespace-nowrap">
                                              {domain.verify_token}
                                            </code>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        Automatic
                                      </td>
                                    </tr>
                                    {/* CNAME Record */}
                                    <tr className="border-t">
                                      <td className="px-4 py-3 font-mono whitespace-nowrap">
                                        CNAME
                                      </td>
                                      <td className="px-4 py-3 font-mono whitespace-nowrap">
                                        {nameValue}
                                      </td>
                                      <td className="px-4 py-3 font-mono">
                                        {process.env.NEXT_PUBLIC_LINKS_DOMAIN}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        Automatic
                                      </td>
                                    </tr>

                                    {!isSubdomain && (
                                      <tr className="border-t bg-muted">
                                        <td colSpan={4} className="px-4 py-3">
                                          <div className="flex items-start gap-2">
                                            <span className="text-amber-600">
                                              ⚠️
                                            </span>
                                            <p className="text-xs">
                                              Note: Some DNS providers don't
                                              allow CNAME records on apex
                                              domains. If you encounter issues,
                                              consider using an A record
                                              pointing to our IP (check
                                              documentation) or using a
                                              subdomain instead.
                                            </p>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </>
                                );
                              })()}
                            </tbody>
                          </table>
                        </div>

                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded flex gap-2 items-center">
                          <span className="text-amber-600">⚠️</span>
                          <p>
                            DNS changes may take up to 24-48 hours to propagate.
                            Click "Verify Domain" after adding these records.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">
              {t("settings.noDomains")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
