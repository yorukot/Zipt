import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import API_URLS from "@/lib/api-urls";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/auth/login");
  }

  const workspaces = await fetch(API_URLS.WORKSPACE.LIST, {
    headers: {
      Cookie: `access_token=${accessToken}`,
    },
    credentials: "include",
  }).then((res) => res.json());

  if (workspaces.length === 0) {
    redirect("/workspace/create");
  }
  
  return (
    <div>
      {children}
    </div>
  );
}
