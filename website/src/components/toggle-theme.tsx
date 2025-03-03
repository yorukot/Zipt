"use client";

import { useTheme } from "next-themes";

import * as React from "react";

import { Icon } from "@iconify/react";

export function ToggleTheme() {
  const { setTheme, theme } = useTheme();

  return (
    <button
      className="w-6 h-6"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "light" ? (
        <Icon icon="lucide:moon" className="w-6 h-6 text-peach" />
      ) : (
        <Icon icon="lucide:sun" className="w-6 h-6 text-peach" />
      )}
    </button>
  );
}
