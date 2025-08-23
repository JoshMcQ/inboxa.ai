import { GlobalHeader } from "@/components/layouts/GlobalHeader";
import { Toaster } from "@/components/Toast";
import { NavBottom } from "@/components/NavBottom";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SideNav } from "@/components/SideNav";
import { AssistantDrawer } from "@/components/assistant/AssistantDrawer";
import { ShortcutsModal } from "@/components/modals/ShortcutsModal";

export function SideNavWithTopNav({
  children,
  defaultOpen,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SideNav />
      <SidebarInset className="overflow-hidden bg-background">
        <GlobalHeader trigger={<SidebarTrigger className="sm:-ml-4" />} />
        <Toaster closeButton richColors theme="light" visibleToasts={9} />
        {children}
        {/* space for Crisp so it doesn't cover content */}
        {/* <div className="h-16" /> */}
        <div
          className="md:hidden md:pt-0"
          style={{ paddingTop: "calc(env(safe-area-inset-bottom) + 1rem)" }}
        >
          <NavBottom />
        </div>
      </SidebarInset>
      {/* Global Assistant Drawer (collapsible right panel) */}
      <AssistantDrawer />
      {/* Global keyboard shortcuts modal */}
      <ShortcutsModal />
    </SidebarProvider>
  );
}
