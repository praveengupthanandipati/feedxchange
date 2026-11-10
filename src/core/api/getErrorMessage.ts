function messageFrom(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  for (const key of ["message", "detail", "title", "ErrorMessage", "errorMessage"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (Array.isArray(candidate)) {
      const messages = candidate.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
      if (messages.length) return messages.join(" ");
    }
  }

  if (record.errors && typeof record.errors === "object") {
    const messages = Object.values(record.errors as Record<string, unknown>)
      .map(messageFrom)
      .filter(Boolean);
    if (messages.length) return messages.join(" ");
  }

  return "";
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "data" in error) {
    const message = messageFrom((error as { data?: unknown }).data);
    if (message) return message;
  }
  return messageFrom(error) || fallback;
}
