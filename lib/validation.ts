export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Invalid email format";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Must contain uppercase letter";
  if (!/[a-z]/.test(password)) return "Must contain lowercase letter";
  if (!/[0-9]/.test(password)) return "Must contain a number";
  return null;
}

export function sanitizeString(str: string): string {
  return str.trim().substring(0, 255);
}
