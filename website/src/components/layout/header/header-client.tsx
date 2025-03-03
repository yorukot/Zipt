"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { thumbs } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

import { User } from "./header";

// import SelectLanguage from "../select-language";
// import { ToggleTheme } from "../toggle-theme";

interface HeaderClientSideProps {
  user: User;
}

export default function HeaderClientSide({ user }: HeaderClientSideProps) {
  const t = useTranslations();

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
              <a href="/login">
                <button className="px-4 py-1 rounded-lg bg-transparent border-surface1 border-2 hover:bg-surface1/50 font-bold transition-ease-in-out">
                  {t("Auth.login.login")}
                </button>
              </a>
              <a href="/signup">
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
