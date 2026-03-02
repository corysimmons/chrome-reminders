import { createRoot, type Root } from "react-dom/client";
import type { Reminder, TweetData } from "@/shared/types";
import { ExistingReminderDialog } from "./ExistingReminderDialog";
import contentCss from "@/globals.css?inline";

let currentRoot: Root | null = null;
let currentHost: HTMLDivElement | null = null;

export function mountAlertDialog(
  reminder: Reminder,
  tweetData: TweetData,
  onCancel: () => void,
  onChangeTime: () => void,
  onClose: () => void
) {
  unmountAlertDialog();

  const host = document.createElement("div");
  host.id = "remindme-alert-host";
  document.body.appendChild(host);
  currentHost = host;

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = contentCss;
  shadow.appendChild(style);

  const mountPoint = document.createElement("div");
  mountPoint.id = "remindme-alert-root";
  shadow.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  currentRoot = root;

  root.render(
    <ExistingReminderDialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          unmountAlertDialog();
        }
      }}
      reminder={reminder}
      tweetData={tweetData}
      onCancel={() => {
        onCancel();
        unmountAlertDialog();
      }}
      onChangeTime={() => {
        unmountAlertDialog();
        onChangeTime();
      }}
      container={mountPoint}
    />
  );
}

export function unmountAlertDialog() {
  if (currentRoot) {
    currentRoot.unmount();
    currentRoot = null;
  }
  if (currentHost) {
    currentHost.remove();
    currentHost = null;
  }
}
