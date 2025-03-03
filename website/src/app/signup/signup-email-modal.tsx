"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";

import { Input } from "@/components/ui/input";
import API_URLS from "@/lib/api-urls";

const EmailSignupSchema = z.object({
  display_name: z
    .string()
    .min(1, { message: "Auth.error.display_name_is_required" })
    .max(32, { message: "Auth.error.display_name_too_long" }),
  email: z.string().email({ message: "Auth.error.email_not_valid" }),
  password: z.string().min(8, { message: "Auth.error.password_min_length" }),
});

type EmailSignupForm = z.infer<typeof EmailSignupSchema>;

const SignupEmailModal = () => {
  const [signupLoading, setSignupLoading] = useState(false);
  const t = useTranslations();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EmailSignupForm>({
    resolver: zodResolver(EmailSignupSchema),
  });

  const handleSignup = async (values: EmailSignupForm) => {
    try {
      setSignupLoading(true);
      const response = await fetch(
        API_URLS.AUTH.REGISTER,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );

      setSignupLoading(false);

      const data = await response.json();

      if (response.ok) {
        if (data.status === "success" && data.data?.token) {
          toast.success(t("Auth.signup.success"), {
            description: t("Auth.signup.success_description"),
          });
          
          router.push("/dashboard");
          return;
        }
      } else if (response.status === 400) {
        if (data.message?.includes("email")) {
          setError("email", { message: "Auth.error.email_already_been_used" });
        } else if (data.message?.includes("password")) {
          setError("password", { message: "Auth.error.invalid_password" });
        } else if (data.message?.includes("display_name")) {
          setError("display_name", { message: "Auth.error.invalid_display_name" });
        } else {
          toast.error(t("Auth.error.invalid_registration_data"));
        }
      } else if (response.status >= 500) {
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
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="bg-crust pt-5 px-6 shadow-lg h-fit rounded-3xl w-full pb-5">
        <div className="text-title text-center mb-5 font-bold text-2xl">
          {t("Auth.signup.create_new_account")}
        </div>

        <form className="grid gap-3" onSubmit={handleSubmit(handleSignup)}>
          <div>
            <Input
              {...register("display_name")}
              placeholder={t("Auth.display_name")}
              className="font-semibold"
              startAdornment={
                <Icon icon="lucide:user-round" className="text-text w-5 h-5" />
              }
              type="text"
            />
            {errors.display_name && (
              <p className="pt-1 text-red text-sm">
                {t(errors.display_name.message)}
              </p>
            )}
          </div>

          <div>
            <Input
              {...register("email")}
              placeholder={t("Auth.email")}
              className="font-semibold"
              startAdornment={
                <Icon icon="lucide:mail" className="text-text w-5 h-5" />
              }
              type="email"
            />
            {errors.email && (
              <p className="pt-1 text-red text-sm">{t(errors.email.message)}</p>
            )}
          </div>

          <div>
            <Input
              {...register("password")}
              placeholder={t("Auth.password")}
              className="font-semibold"
              startAdornment={
                <Icon
                  icon="lucide:lock-keyhole"
                  className="text-text w-5 h-5"
                />
              }
              type="password"
            />
            {errors.password && (
              <p className="pt-1 text-red text-sm">
                {t(errors.password.message)}
              </p>
            )}
          </div>

          {/*line*/}
          <div className="mx-[4px] h-[1px] bg-text my-4" />

          <button
            type="submit"
            className="w-full h-10 flex justify-center items-center gap-2 rounded-lg cursor-pointer font-bold text-surface0 bg-green hover:bg-green/80 disabled:cursor-not-allowed transition-ease-in-out"
            disabled={signupLoading}
          >
            {signupLoading ? (
              <Icon
                icon="lucide:loader"
                className="text-xl animate-loading text-surface0"
              />
            ) : (
              <Icon icon="lucide:user-plus" className="text-xl" />
            )}
            <span>{t("Auth.signup.signup")}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupEmailModal;
