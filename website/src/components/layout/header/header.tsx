// components/AuthPageLayout.tsx
import { useTranslations } from "next-intl";
import { cookies } from "next/headers";
import Image from "next/image";

import React from "react";

import API_URLS from "@/lib/api-urls";

import HeaderClientSide from "./header-client";

// import SelectLanguage from "../select-language";
// import { ToggleTheme } from "../toggle-theme";

export interface User {
  id: number;
  username: string;
  email: string;
  verify: boolean;
  avatar: string;
  created_at: string;
  updated_at: string;
}

export default async function Header() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  let response = await fetch(API_URLS.USER.GET_DATA, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Cookie: `access_token=${accessToken}`,
    },
  });

  const userData: User = (await response.json())?.result;

  return <HeaderClientSide user={userData}></HeaderClientSide>;
}
