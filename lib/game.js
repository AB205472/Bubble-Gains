const n = value => Number.isFinite(Number(value)) ? Number(value) : 0;

export function entryXP(entry) {
  const d = entry.data || {};
  let xp = 4;
  xp += Math.min(12, n(d.workout_minutes) / 5);
  xp += Math.min(10, n(d.miles) * 3);
  xp += Math.min(10, n(d.squats) / 20);
  xp += Math.min(6, n(d.protein_g) / 25);
  xp += Math.min(5, n(d.water_oz) / 24);
  xp += Math.min(8, n(d.growth_points));
  if ((entry.categories || []).includes("relationships")) xp += 3;
  if ((entry.categories || []).includes("mind")) xp += 3;
  return Math.round(xp);
}

export function calculateGame(entries) {
  const totals = {
    xp: 0, miles: 0, squats: 0, workoutMinutes: 0, calories: 0,
    protein: 0, water: 0, sleepHours: 0, sleepLogs: 0, checkins: entries.length
  };
  const points = {
    strength: 8, agility: 8, health: 10, sleep: 10,
    resilience: 12, wisdom: 10, social: 10, creativity: 8, finance: 8
  };

  entries.forEach(entry => {
    const d = entry.data || {};
    const cats = entry.categories || [];
    const xp = entryXP(entry);
    totals.xp += xp;
    totals.miles += n(d.miles);
    totals.squats += n(d.squats);
    totals.workoutMinutes += n(d.workout_minutes);
    totals.calories += n(d.calories);
    totals.protein += n(d.protein_g);
    totals.water += n(d.water_oz);
    if (d.sleep_hours != null) {
      totals.sleepHours += n(d.sleep_hours);
      totals.sleepLogs += 1;
    }

    points.strength += n(d.strength_reps) / 35 + n(d.squats) / 40 + n(d.workout_minutes) / 25;
    points.agility += n(d.miles) * 2.4 + n(d.steps) / 2500 + n(d.flights) * .5 + (d.exercises || []).filter(x => /stairs|stair|side step|walking|treadmill|swim/i.test(x)).length;
    points.health += Math.min(3, n(d.protein_g) / 35) + n(d.fruit_veg) * .7 + Math.min(2, n(d.water_oz) / 40);
    points.sleep += d.sleep_hours != null ? Math.max(-1, (n(d.sleep_hours) - 5) * .8) : 0;
    points.resilience += cats.includes("growth") ? 2.4 : 0;
    points.resilience += cats.includes("mind") ? 1.1 : 0;
    points.wisdom += n(d.growth_points) / 3 + (cats.includes("growth") ? 1.2 : 0);
    points.social += cats.includes("relationships") ? 1.6 : 0;
    points.creativity += cats.includes("creativity") || cats.includes("fun") ? 1.2 : 0;
    points.finance += cats.includes("money") ? 1.4 : 0;
  });

  const level = Math.max(1, Math.floor(totals.xp / 100) + 1);
  const levelXP = totals.xp % 100;
  const stats = Object.fromEntries(
    Object.entries(points).map(([k,v]) => [k, Math.max(1, Math.min(99, Math.round(v)))])
  );

  return { totals, stats, level, levelXP, nextLevelXP: 100 - levelXP };
}

export function todayTotals(entries) {
  const today = new Date().toDateString();
  const todays = entries.filter(e => new Date(e.created_at).toDateString() === today);
  const sum = key => todays.reduce((a,e) => a + n(e.data?.[key]), 0);
  return {
    entries: todays.length,
    calories: sum("calories"),
    protein: sum("protein_g"),
    miles: sum("miles"),
    squats: sum("squats"),
    water: sum("water_oz"),
    sleep: sum("sleep_hours"),
    workout: sum("workout_minutes")
  };
}

export function missingCheckInQuestions(entries) {
  const today = new Date().toDateString();
  const todays = entries.filter(e => new Date(e.created_at).toDateString() === today);
  const has = key => todays.some(e => e.data?.[key] !== undefined && e.data?.[key] !== null);
  const questions = [];
  if (!has("sleep_hours")) questions.push("How many hours did you sleep last night—and was it decent sleep or restless?");
  if (!has("water_oz")) questions.push("How much water have you had so far?");
  if (!has("mood")) questions.push("What is your actual mood today, not the polite answer?");
  if (!has("miles") && !has("steps") && !has("workout_minutes")) questions.push("Any walking, stairs, swimming, gym time, or tiny work workouts today?");
  if (!has("protein_g")) questions.push("What protein have you eaten today, even if it was just a snack?");
  return questions.slice(0, 3);
}
