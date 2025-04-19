"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSelector } from "./language-selector";
import { Button } from "./ui/button";

export function Header() {
  const t = useTranslations("Header");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background px-3">
      <div className="justify-center flex">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Logo />
          
          <nav className="hidden md:flex gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {t("home")}
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {t("about")}
            </Link>
            <Link 
              href="/services" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {t("services")}
            </Link>
            <Link 
              href="/contact" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {t("contact")}
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            
            <div className="flex items-center border-l pl-4 ml-4 gap-x-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  {t("signup")}
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </div>
      </div>
    </header>
  );
} 