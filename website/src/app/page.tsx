"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import Link from "next/link";
import { ArrowRight, BarChart3, Calendar, Check, Copy, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import API_URLS from "@/lib/api-urls";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export default function HomePage() {
  const t = useTranslations("HomePage");
  const [ref, entry] = useIntersectionObserver({
    threshold: 0.1,
    root: null,
  });

  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShorten = async () => {
    if (!url) {
      toast.error(t("hero.url_input.error"));
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(API_URLS.URL.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ original_url: url }),
      });

      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }

      const data = await response.json();
      const shortUrl = `${window.location.origin}/${data.result.short_code}`;
      setShortUrl(shortUrl);
      
      // Auto copy to clipboard
      await navigator.clipboard.writeText(shortUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to shorten URL");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard", {
        description: error instanceof Error ? error.message : "Failed to copy to clipboard",
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full min-h-[90vh] flex flex-col items-center justify-center px-4 bg-gradient-to-b from-background to-muted">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto space-y-6"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            {t("hero.title")}
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>

          {/* URL Input Section */}
          <div className="w-full max-w-2xl mx-auto space-y-4 justify-center items-center">
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
              <Input
                type="url"
                placeholder={t("hero.url_input.placeholder")}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 h-12 text-lg px-4"
                onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
              />
              <Button
                size="lg"
                onClick={handleShorten}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 h-12 px-8 whitespace-nowrap"
              >
                {isLoading ? (
                  t("hero.url_input.processing")
                ) : (
                  t("hero.url_input.button")
                )}
              </Button>
            </div>

            {/* Result Section */}
            {shortUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-muted/50 backdrop-blur p-4 rounded-lg border border-border/50 justify-center"
              >
                <p className="font-semibold text-lg">
                  {shortUrl}
                </p>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-12 w-12 flex-shrink-0"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 font-semibold px-8"
              >
                {t("hero.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-foreground">
              {t("hero.secondary_cta")}
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section
        ref={ref}
        className="w-full py-24 px-4 bg-gradient-to-b from-muted to-background"
      >
        <motion.div
          initial="hidden"
          animate={entry?.isIntersecting ? "visible" : "hidden"}
          variants={scaleIn}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("features.title")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="backdrop-blur bg-background/60 border-muted">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t("features.analytics.title")}</CardTitle>
                <CardDescription>
                  {t("features.analytics.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="backdrop-blur bg-background/60 border-muted">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Link2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t("features.custom.title")}</CardTitle>
                <CardDescription>
                  {t("features.custom.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="backdrop-blur bg-background/60 border-muted">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t("features.expiration.title")}</CardTitle>
                <CardDescription>
                  {t("features.expiration.description")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-24 px-4 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h3 className="text-4xl font-bold mb-2">10K+</h3>
              <p className="text-muted-foreground">
                {t("stats.links_created")}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <h3 className="text-4xl font-bold mb-2">1M+</h3>
              <p className="text-muted-foreground">
                {t("stats.total_clicks")}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <h3 className="text-4xl font-bold mb-2">5K+</h3>
              <p className="text-muted-foreground">
                {t("stats.active_users")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("cta_section.title")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t("cta_section.subtitle")}
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90  px-8"
            >
              {t("cta_section.button")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
