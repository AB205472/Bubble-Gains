/**
 * Helpers for the raw REST shape returned by POST /v1/responses.
 * The convenience `output_text` property is guaranteed by the official SDK,
 * but is not safe to assume when calling the REST endpoint with fetch.
 */
export function extractResponseText(response) {
  if (!response || typeof response !== "object") return "";
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const pieces = [];
  for (const item of Array.isArray(response.output) ? response.output : []) {
    if (item?.type !== "message") continue;
    for (const content of Array.isArray(item.content) ? item.content : []) {
      if (content?.type === "output_text" && typeof content.text === "string") {
        pieces.push(content.text);
      } else if (content?.type === "refusal" && typeof content.refusal === "string") {
        throw new Error(content.refusal);
      }
    }
  }
  return pieces.join("\n").trim();
}

export function parseStructuredResponse(response) {
  let text = extractResponseText(response);
  if (!text) {
    const reason = response?.incomplete_details?.reason;
    throw new Error(reason ? `OpenAI response was incomplete: ${reason}.` : "OpenAI returned no text output.");
  }

  // Be defensive if a model/provider wraps JSON in a Markdown fence.
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("OpenAI returned malformed structured output.");
  }
}

export async function readJsonResponse(response) {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`OpenAI returned a non-JSON HTTP response (${response.status}).`);
  }
}
