"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { z } from "zod";

import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";

import { Input } from "@/components/ui/input";
import API_URLS from "@/lib/api-urls";

const LoginSchema = z.object({
  email: z.string().email("Auth.error.email_not_valid"),
  password: z.string().min(8, "Auth.error.password_min_length"),
});

type LoginForm = z.infer<typeof LoginSchema>;

const LoginModal = () => {
  const t = useTranslations();
  const [verify] = useQueryState("verify");
  const router = useRouter();

  const [loginLoading, setLoginLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  });

  useEffect(() => {
    if (verify === "true") {
      setTimeout(() => {
        toast.success(t("Auth.login.verify_successful"), {
          description: t("Auth.login.verify_successful_content"),
        });
      }, 100);
    } else if (verify === "false") {
      setTimeout(() => {
        toast.error(t("Auth.error.verify_error"), {
          description: t("Auth.error.verify_error_content"),
        });
      }, 100);
    }
    // TODO: Check if already logged in
  }, [verify, t]);

  // Handle opening the popup for OAuth
  // Commented out to fix linter warning, may be needed in the future
  // const openPopup = (authUrl: string) => {
  //   const width = 500;
  //   const height = 600;
  //   const left = (window.screen.width - width) / 2;
  //   const top = (window.screen.height - height) / 2;

  //   const popup = window.open(
  //     authUrl,
  //     "Oauth",
  //     `width=${width},height=${height},top=${top},left=${left}`,
  //   );
  // };

  const handleLogin: SubmitHandler<LoginForm> = async (values) => {
    try {
      setLoginLoading(true);
      
      // Sanitize email input by trimming whitespace and converting to lowercase
      const sanitizedValues = {
        ...values,
        email: values.email.trim().toLowerCase()
      };
      
      const response = await fetch(API_URLS.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedValues),
      });

      setLoginLoading(false);

      const data = await response.json();

      if (response.ok) {
        // Use a more appropriate success message for login
        toast.success(t("Auth.login.success"), {
          description: t("Auth.login.success_description"),
        });

        // Redirect to dashboard or home page
        router.push("/dashboard");
        return;
      } else if (response.status === 400) {
        // Handle specific error codes from the backend
        if (data.error === "invalid_email_format") {
          setError("email", { message: "Auth.error.email_not_valid" });
        } else if (data.error === "password_too_short") {
          setError("password", { message: "Auth.error.password_min_length" });
        } else if (data.field === "email") {
          setError("email", { message: "Auth.error.invalid_credentials" });
        } else if (data.field === "password") {
          setError("password", { message: "Auth.error.invalid_credentials" });
        } else {
          // Generic format error fallback
          setError("email", { message: "Auth.error.invalid_format" });
          setError("password", { message: "Auth.error.invalid_format" });
        }
        return;
      } else if (response.status === 401) {
        // Incorrect credentials
        setError("email", { message: "Auth.error.invalid_credentials" });
        setError("password", { message: "Auth.error.invalid_credentials" });
        return;
      } else if (response.status >= 500) {
        // Server error
        throw new Error(data.message || "Server error");
      }
    } catch (error) {
      toast.error(t("Global.error.unexpected_error"), {
        description: (
          <div>
            <pre className="bg-crust text-text p-2 rounded-lg">
              <code>{`${error}`}</code>
            </pre>
          </div>
        ),
      });
      setLoginLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="bg-crust py-8 px-4 shadow-lg rounded-xl w-full">
        <h2 className="text-title text-center mb-6 font-bold text-xl">
          {t("Auth.login.title")}
        </h2>

        <form
          className="flex flex-col gap-3 px-2"
          onSubmit={handleSubmit(handleLogin)}
        >
          <div>
            <Input
              {...register("email")}
              placeholder={t("Auth.login.email")}
              startAdornment={
                <Icon icon="lucide:mail" className="text-text w-5 h-5" />
              }
              className="font-semibold"
              type="email"
            />
            {errors.email && (
              <p className="pt-1 text-red text-sm">{t(errors.email.message)}</p>
            )}
          </div>
          <div>
            <Input
              {...register("password")}
              placeholder={t("Auth.password.password")}
              startAdornment={
                <Icon
                  icon="lucide:lock-keyhole"
                  className="text-text w-5 h-5"
                />
              }
              className="font-semibold"
              type="password"
            />

            {errors.password && (
              <p className="pt-1 text-red text-sm">
                {t(errors.password.message)}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full h-10 flex justify-center items-center rounded-lg text-surface0 bg-green hover:bg-green/80 font-semibold transition-ease-in-out"
            disabled={loginLoading}
          >
            {loginLoading ? (
              <Icon icon="lucide:loader" className="animate-spin text-xl" />
            ) : (
              <Icon icon="lucide:log-in" className="text-xl" />
            )}
            <p className="pl-2">{t("Auth.login.login")}</p>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
