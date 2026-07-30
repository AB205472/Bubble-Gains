import test from "node:test";
import assert from "node:assert/strict";
import { todayTotals, centralDateKey } from "../lib/game.js";

test("centralDateKey returns a YYYY-MM-DD key", () => {
  assert.match(centralDateKey(new Date("2026-07-28T12:00:00Z")), /^\d{4}-\d{2}-\d{2}$/);
});

test("final daily summary overrides same-day check-ins instead of double counting", () => {
  const date = centralDateKey();
  const entries = [
    {id:"checkin",created_at:`${date}T10:00:00-05:00`,categories:["body"],data:{squats:40,calories:500,protein_g:20}},
    {id:"day",source_type:"bubble_day",created_at:`${date}T12:00:00-05:00`,categories:["body"],data:{status:"final",squats:80,calories:1475,protein_g:72,carbs_g:171,fat_g:49,calorie_status:"deficit"}}
  ];
  const totals = todayTotals(entries);
  assert.equal(totals.squats,80);
  assert.equal(totals.calories,1475);
  assert.equal(totals.protein,72);
  assert.equal(totals.entries,1);
  assert.equal(totals.hasDailySummary,true);
});
