import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Shell } from "@/components/Shell";
import { StoreProvider } from "@/lib/store";

export const Route = createRootRoute({
  component: () => (
    <StoreProvider>
      <Shell>
        <Outlet />
      </Shell>
      <Toaster richColors position="top-center" />
    </StoreProvider>
  ),
});
