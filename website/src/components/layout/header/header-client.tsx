"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { thumbs } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import useSWR from "swr";
import API_URLS from "@/lib/api-urls";
import { User } from "./header";

import SelectLanguage from "@/components/select-language";
import { ToggleTheme } from "@/components/toggle-theme";

interface HeaderClientSideProps {
  user: User;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  
  const data = await response.json();
  return data?.result;
};

export default function HeaderClientSide({ user: initialUser }: HeaderClientSideProps) {
  const t = useTranslations();
  const [user, setUser] = useState<User | null>(initialUser);
  
  const refreshToken = async () => {
    try {
      const response = await fetch(API_URLS.AUTH.REFRESH, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        console.error("Token refresh failed");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  useEffect(() => {
    // Set up interval to refresh token every 10 minutes
    const tokenInterval = setInterval(() => {
      refreshToken();
    }, 10 * 60 * 1000); // 10 minutes in milliseconds

    // Clean up intervals on component unmount
    return () => {
      clearInterval(tokenInterval);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border flex justify-center">
      <div className="container justify-between flex">
        <div className="flex h-14 items-center px-4">
          <Image
            src="/logo.png"
            width={40}
            height={40}
            alt="InstructHub logo"
          />
        </div>
        <div className="flex h-14 items-center px-4 space-x-2">
          <SelectLanguage />
          <ToggleTheme />
          {user ? (
            <div className="flex items-center space-x-3">
              <Image
                src={
                  user?.avatar ||
                  createAvatar(thumbs, {
                    seed: user?.id.toString(),
                  }).toDataUri()
                }
                width={40}
                height={40}
                alt={`${user.username}'s avatar`}
                className="rounded-full"
              />
            </div>
          ) : (
            <>
              <a href="/auth/login">
                <button className="px-4 py-1 rounded-lg bg-transparent border-surface1 border-2 hover:bg-surface1/50 font-bold transition-ease-in-out">
                  {t("Auth.login.login")}
                </button>
              </a>
              <a href="/auth/signup">
                <button className="px-4 py-1 rounded-lg bg-surface1 border-surface1 border-2 hover:bg-surface0 hover:border-surface0 font-bold transition-ease-in-out">
                  {t("Auth.signup.signup")}
                </button>
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
