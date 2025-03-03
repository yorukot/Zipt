"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { thumbs } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { toast } from "sonner";

import API_URLS from "@/lib/api-urls";
import { User } from "./header";

import SelectLanguage from "@/components/select-language";
import { ToggleTheme } from "@/components/toggle-theme";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, LayoutDashboard } from "lucide-react";

interface HeaderClientSideProps {
  user: User;
}

export default function HeaderClientSide({ user: initialUser }: HeaderClientSideProps) {
  const t = useTranslations();
  const router = useRouter();
  const [user,] = useState<User | null>(initialUser);
  
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

  const handleLogout = async () => {
    try {
      const response = await fetch(API_URLS.AUTH.LOGOUT, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        toast.success(t("Auth.logout.success"));
        // Redirect to homepage after logout
        router.push("/");
        router.refresh();
      } else {
        toast.error(t("Auth.logout.error"));
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error(t("Global.error.unexpected_error"));
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
            alt="Zipt logo"
          />
        </div>
        <div className="flex h-14 items-center px-4 space-x-2">
          <SelectLanguage />
          <ToggleTheme />
          {user ? (
            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer rounded-full hover:ring-2 hover:ring-primary/50 transition-all">
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
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>{t("Navigation.dashboard")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t("Navigation.settings")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("Auth.logout.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
