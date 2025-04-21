"use client"

import { useState, useEffect } from "react"
import { Icon } from "@iconify/react"

interface UrlFaviconProps {
  url: string
  className?: string
}

export function UrlFavicon({ url, className = "h-4 w-4" }: UrlFaviconProps) {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    try {
      // Extract domain from URL
      const domain = new URL(url).hostname
      // Set Google's favicon service URL
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      setFaviconUrl(googleFaviconUrl)
    } catch (error) {
      console.error("Failed to parse URL:", error)
      setHasError(true)
    }
  }, [url])

  // Show globe icon if there's an error or no favicon URL
  if (hasError || !faviconUrl) {
    return <Icon icon="lucide:globe" className={className} />
  }

  return (
    <img
      src={faviconUrl}
      alt="Website favicon"
      className={className}
      onError={() => setHasError(true)}
    />
  )
} 