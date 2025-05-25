import { toast } from "sonner";
// API_URLS import removed as it's not used

export const fetcher = async (url: string) => {
  try {
    const res = await fetch(url, {
      credentials: "include",
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch data");
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An unexpected error occurred");
    }
    throw error;
  }
};
