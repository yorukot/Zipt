"use client";

import { useTranslations } from "next-intl";

import AuthPageLayout from "@/components/layout/auth-layout";
import SignupEmailModal from "./signup-email-modal";

const SignupLayout = () => {
  const t = useTranslations("Auth");

  return (
    <AuthPageLayout
      Footer={
        <p className="text-peach font-bold">
          {t("signup.already_have_an_account")}{" "}
          <a
            href="/login"
            className="text-blue font-bold transition-colors duration-100 hover:underline hover:decoration-blue"
          >
            {t("login.login")}
          </a>
        </p>
      }
      Button={
        <a href="/login">
          <button className="px-4 py-1 rounded-lg bg-transparent border-surface1 border-2 hover:bg-surface1 font-bold transition-ease-in-out">
            {t("login.login")}
          </button>
        </a>
      }
      Modal={
        <>
          <SignupEmailModal />
        </>
      }
    />
  );
};

export default SignupLayout;
