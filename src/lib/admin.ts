export const ADMIN_EMAIL = "chopdekaradhrit2013@gmail.com";
export const ADMIN_PASSWORD = "@Scorpion123";
export function isAdminEmail(email?: string | null) {
  return (email || "").trim().toLowerCase() === ADMIN_EMAIL;
}
export function isAdminLogin(email: string, password: string) {
  return isAdminEmail(email) && password === ADMIN_PASSWORD;
}
