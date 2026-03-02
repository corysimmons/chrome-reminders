import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import contentCss from "@/globals.css?inline";

let toastRoot: Root | null = null;
let toastHost: HTMLDivElement | null = null;

function getSonnerCss(): string {
  // Sonner injects a <style> into document.head at module load time.
  // We need to copy it into our shadow root so it can style the toasts.
  for (const el of document.querySelectorAll("style")) {
    if (el.textContent?.includes("[data-sonner-toaster]")) {
      return el.textContent;
    }
  }
  return "";
}

function ensureToaster() {
  if (toastHost && document.body.contains(toastHost)) return;

  const host = document.createElement("div");
  host.id = "remindme-toast-host";
  document.body.appendChild(host);
  toastHost = host;

  const shadow = host.attachShadow({ mode: "open" });

  // Inject Tailwind CSS + sonner CSS into shadow root
  const style = document.createElement("style");
  style.textContent = contentCss + "\n" + getSonnerCss();
  shadow.appendChild(style);

  const mountPoint = document.createElement("div");
  mountPoint.id = "remindme-toast-root";
  shadow.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  toastRoot = root;

  flushSync(() => {
    root.render(<Toaster />);
  });
}

export function showToast(message: string) {
  ensureToaster();
  toast(message);
}
