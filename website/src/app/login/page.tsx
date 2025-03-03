"use client";

import { useTranslations } from "next-intl";

import AuthPageLayout from "@/components/layout/auth-layout";

import LoginModal from "./login-modal";

const LoginLayout = () => {
  const t = useTranslations("Auth");

  return (
    <AuthPageLayout
      Footer={
        <p className="text-peach font-bold">
          {t("login.dont_have_an_account")}{" "}
          <a
            href="/signup"
            className="text-blue font-bold transition-colors duration-100 hover:underline hover:decoration-blue"
          >
            {t("signup.signup")}
          </a>
        </p>
      }
      Button={
        <a href="/signup">
          <button className="px-4 py-1 rounded-lg bg-transparent border-surface1 border-2 hover:bg-surface1 font-bold transition-ease-in-out">
            {t("signup.signup")}
          </button>
        </a>
      }
      Modal={<LoginModal />}
    />
  );
};

export default LoginLayout;
