// Turns an API error into a message for the screen. Only a short, human-readable sentence from the API is shown
// (e.g. "Deductions cannot be more than the invoice total."); raw backend data – JSON bodies, status codes, stack
// traces, exception / SQL text, URLs, HTML pages – is never exposed: the screen's own fallback message is used instead.

const GENERIC_TITLES = /^(An error occurred while processing your request\.?|One or more validation errors occurred\.?|Bad Request|Internal Server Error|Not Found|Unauthorized|Forbidden)$/i;

/** Technical text that must not reach the user. */
// Plain sentences may contain "<=", "[x]" or start with a number ("100 MT exceeds …"): only real markup, JSON braces,
// status lines, stack traces, exception / SQL / runtime text are treated as technical.
const TECHNICAL =
  /[{}]|<\/?[a-z][^>]*>|\bat\s+[\w.$<>]+\(|Exception\b|\bStack\s?trace\b|\bSystem\.|Microsoft\.|\bSQL\b|\bSELECT\b|\bINSERT\b|\bUPDATE\s+\w+\s+SET\b|\bnull reference\b|\bObject reference\b|https?:\/\/|\bHTTP\s?\d{3}\b|^\d{3}\s+[A-Za-z ]+$|\btraceId\b|\bFETCH_ERROR\b|\bPARSING_ERROR\b|\bTypeError\b|\bReferenceError\b|\bFailed to fetch\b|\bNetworkError\b|Cannot read propert|is not a function|is not defined|Unexpected token/i;

/** A message fit to show: one short, plain sentence. */
const isPresentable = (text: string) => text.length > 0 && text.length <= 240 && !text.includes("\n") && !TECHNICAL.test(text);

function messageFrom(value: unknown): string {
  if (typeof value === "string") {
    const text = value.trim();
    // Endpoints read as text hand back their JSON error body as a string: read the message out of it.
    if (/^[[{]/.test(text)) {
      try {
        return messageFrom(JSON.parse(text));
      } catch {
        return "";
      }
    }
    return isPresentable(text) ? text : "";
  }
  if (!value || typeof value !== "object") return "";

  // A list of messages (e.g. errors.ErrorMessage: ["…"]): the presentable ones, joined.
  if (Array.isArray(value)) return value.map(messageFrom).filter(Boolean).join(" ");

  const record = value as Record<string, unknown>;
  for (const key of ["message", "detail", "ErrorMessage", "errorMessage"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && isPresentable(candidate.trim())) return candidate.trim();
    if (Array.isArray(candidate)) {
      const messages = candidate.filter((item): item is string => typeof item === "string" && isPresentable(item.trim()));
      if (messages.length) return messages.join(" ");
    }
  }

  // Validation problems ({ title: "One or more validation errors occurred.", errors: {...} }): the field
  // messages say what is wrong, the title doesn't.
  if (record.errors && typeof record.errors === "object") {
    const messages = Object.values(record.errors as Record<string, unknown>)
      .map(messageFrom)
      .filter(Boolean);
    if (messages.length) return messages.join(" ");
  }

  // ASP.NET's stock titles say nothing about what went wrong: the screen's own message reads better.
  const title = record.title;
  if (typeof title === "string" && isPresentable(title.trim()) && !GENERIC_TITLES.test(title.trim())) return title.trim();

  return "";
}

/** The API's own explanation when it is a plain sentence, otherwise `fallback`. Never raw backend data. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "data" in error) {
    const message = messageFrom((error as { data?: unknown }).data);
    if (message) return message;
    return fallback;
  }
  // A JavaScript error thrown in the screen's own code is never shown as is: use the screen's message.
  if (error instanceof Error) return fallback;
  return messageFrom(error) || fallback;
}
