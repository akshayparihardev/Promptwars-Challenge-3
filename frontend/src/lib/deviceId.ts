/**
 * Stable, anonymous device identifier for saving history without login.
 */
export function getDeviceId(): string {
  const KEY = "carbon_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
