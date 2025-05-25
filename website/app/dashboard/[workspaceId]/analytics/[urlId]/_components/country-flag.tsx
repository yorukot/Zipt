import * as React from "react";
import { hasFlag } from "country-flag-icons";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { Icon } from "@iconify/react";

interface CountryFlagProps {
  countryCode: string;
  countryName?: string;
  className?: string;
  iconOnly?: boolean;
}

export function CountryFlag({ countryCode, countryName, className, iconOnly = false }: CountryFlagProps) {
  // Ensure code is uppercase for consistency
  const code = countryCode.toUpperCase();
  
  // Check if we have a flag for this country
  const hasValidFlag = hasFlag(code);
  const displayName = countryName || code;
  
  return (
    <span className={`flex items-center gap-2 ${className || ""}`}>
      {hasValidFlag ? (
        <span className="text-lg" aria-hidden="true">
          {getUnicodeFlagIcon(code)}
        </span>
      ) : (
        <span className="text-muted-foreground" aria-hidden="true">
          <Icon icon="material-symbols:question-mark" />
        </span>
      )}
      {!iconOnly && <span>{displayName}</span>}
    </span>
  );
} 