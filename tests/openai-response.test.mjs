import test from "node:test";
import assert from "node:assert/strict";
import { extractResponseText, parseStructuredResponse } from "../lib/server/openai-response.js";

test("extracts text from raw Responses API output array", () => {
  const response = { output: [{ type:"message", content:[{type:"output_text", text:'{"ok":true}'}] }] };
  assert.equal(extractResponseText(response), '{"ok":true}');
  assert.deepEqual(parseStructuredResponse(response), {ok:true});
});

test("supports SDK-style output_text as a compatibility path", () => {
  assert.deepEqual(parseStructuredResponse({output_text:'{"value":2}'}), {value:2});
});

test("removes JSON markdown fences", () => {
  const response = {output:[{type:"message",content:[{type:"output_text",text:'```json\n{"ok":true}\n```'}]}]};
  assert.deepEqual(parseStructuredResponse(response), {ok:true});
});

test("fails clearly when no output exists", () => {
  assert.throws(() => parseStructuredResponse({output:[]}), /no text output/i);
});
