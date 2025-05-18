"use client";

import * as React from "react";
import API_URLS from "@/lib/api-urls";

// Function to refresh the access token
async function refreshAccessToken() {
  // Check if the refresh token is expired
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    return;
  }

  // Check if the access token is expired
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    return;
  }

  // Check if the access token is expired
  try {
    const response = await fetch(API_URLS.AUTH.REFRESH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
}

export function TokenRefresh() {
  React.useEffect(() => {
    // Initial refresh
    refreshAccessToken();

    // Set up interval for refreshing every 10 minutes
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 10 * 60 * 1000); // 10 minutes in milliseconds

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
}
