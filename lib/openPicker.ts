/* The date fields are invisible native inputs laid over styled text, and
   Chrome only opens the calendar from its (hidden) indicator icon — so open
   it explicitly on any click. showPicker throws if the picker can't open
   (already open, unsupported); the input then just keeps focus as before. */
export function openPicker(e: { currentTarget: HTMLInputElement }) {
  try {
    e.currentTarget.showPicker();
  } catch {
    /* fall back to the browser's default behaviour */
  }
}
