/**
 * The app's replacement for Alert.alert.
 *
 * The native alert is a grey system box in the system font — the one thing in
 * the app that looked like it came from somewhere else. This keeps the same
 * call shape (title, message, buttons with `style` "cancel" | "destructive")
 * so any screen, hook or plain function can ask a question, and <DialogHost />
 * (mounted once, at the root) renders it as a themed sheet.
 *
 * One dialog at a time: a new one replaces whatever is showing, the way a
 * second Alert.alert would queue behind the first — except nothing here ever
 * needs to queue.
 */

let current = null;
let seq = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeDialog(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDialog() {
  return current;
}

/**
 * @param {object} options
 * @param {string} options.title
 * @param {string} [options.message]
 * @param {Array<{text: string, style?: "default"|"cancel"|"destructive", onPress?: Function, icon?: any}>} [options.buttons]
 * @param {any} [options.icon]   Phosphor icon component shown above the title.
 * @param {"accent"|"danger"} [options.tone]
 */
export function showDialog({ title, message, buttons, icon, tone } = {}) {
  seq += 1;
  current = {
    id: seq,
    title: title ?? "",
    message: message ?? "",
    buttons: buttons?.length ? buttons : [{ text: "U redu" }],
    icon: icon ?? null,
    tone: tone ?? (buttons?.some((b) => b.style === "destructive") ? "danger" : "accent"),
  };
  emit();
  return current.id;
}

export function closeDialog(id) {
  if (!current || (id != null && current.id !== id)) return;
  current = null;
  emit();
}

/** A yes/no question as a promise: resolves true on confirm, false otherwise. */
export function confirmDialog({
  title,
  message,
  confirmText = "Potvrdi",
  cancelText = "Odustani",
  destructive = false,
  icon,
}) {
  return new Promise((resolve) => {
    showDialog({
      title,
      message,
      icon,
      buttons: [
        { text: cancelText, style: "cancel", onPress: () => resolve(false) },
        {
          text: confirmText,
          style: destructive ? "destructive" : "default",
          onPress: () => resolve(true),
        },
      ],
    });
  });
}

/** Test helper: forget any open dialog. */
export function resetDialogs() {
  current = null;
  emit();
}
