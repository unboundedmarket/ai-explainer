// Stable anonymous browser id for counting distinct users.
const USER_ID_KEY = "cce_user_id";

export function getUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `u-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}
