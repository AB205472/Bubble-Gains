const n = value => Number.isFinite(Number(value)) ? Number(value) : 0;

export const BUBBLE_TIME_ZONE = "America/Chicago";

export function centralDateKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUBBLE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const get = type => parts.find(part => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function uniqueText(items = []) {
  return [...new Set(items.map(item => String(item).trim()).filter(Boolean))];
}

/**
 * A record contributes only when its data directly matches a stat.
 * This same function powers both the displayed score and the source breakdown.
 */
export function getStatContribution(entry, key) {
  const d = entry.data || {};
  const cats = entry.categories || [];
  const reasons = [];
  let points = 0;

  if (key === "strength") {
    const squats = n(d.squats);
    const reps = n(d.strength_reps);
    const minutes = n(d.strength_minutes);

    points = squats / 25 + reps / 25 + minutes / 15;

    if (squats) reasons.push(`${Math.round(squats)} documented squats`);
    if (reps) reasons.push(`${Math.round(reps)} documented non-squat strength reps`);
    if (minutes) reasons.push(`${Math.round(minutes)} documented strength-training minutes`);
  }

  if (key === "agility") {
    const miles = n(d.miles);
    const steps = n(d.steps);
    const flights = n(d.flights);
    const minutes = n(d.cardio_minutes);

    points = miles * 2 + steps / 2500 + flights / 4 + minutes / 15;

    if (miles) reasons.push(`${miles.toFixed(miles % 1 ? 2 : 0)} documented miles`);
    if (steps) reasons.push(`${Math.round(steps).toLocaleString()} documented steps`);
    if (flights) reasons.push(`${Math.round(flights)} documented flights of stairs`);
    if (minutes) reasons.push(`${Math.round(minutes)} documented cardio or active-movement minutes`);
  }

  if (key === "health") {
    const protein = n(d.protein_g);
    const produce = n(d.fruit_veg);
    const water = n(d.water_oz);

    const proteinPoints = Math.min(2, protein / 40);
    const producePoints = Math.min(2, produce * 0.5);
    const waterPoints = Math.min(2, water / 64);

    points = proteinPoints + producePoints + waterPoints;

    if (protein) reasons.push(`${Math.round(protein)}g protein`);
    if (produce) reasons.push(`${produce} fruit/vegetable serving${produce === 1 ? "" : "s"}`);
    if (water) reasons.push(`${Math.round(water)} oz water`);
  }

  if (key === "sleep") {
    if (d.sleep_hours != null) {
      const hours = n(d.sleep_hours);
      const quality = n(d.sleep_quality);

      points = 1;
      reasons.push(`${hours.toFixed(hours % 1 ? 1 : 0)} hours logged`);

      if (hours >= 7) {
        points += 1;
        reasons.push("met the 7-hour target");
      }
      if (quality >= 4) {
        points += 1;
        reasons.push(`sleep quality ${Math.round(quality)}/5`);
      }
    }
  }

  if (key === "resilience") {
    const copingActions = uniqueText(d.coping_actions);
    const boundaries = uniqueText(d.boundaries);
    const recoveryActions = uniqueText(d.recovery_actions);

    points = copingActions.length + boundaries.length + recoveryActions.length;

    copingActions.forEach(item => reasons.push(`coping action: ${item}`));
    boundaries.forEach(item => reasons.push(`boundary: ${item}`));
    recoveryActions.forEach(item => reasons.push(`recovery action: ${item}`));
  }

  if (key === "wisdom") {
    const lessons = uniqueText(d.lessons);
    const facts = uniqueText(d.facts_learned);
    const patterns = uniqueText(d.patterns_noticed);

    points = lessons.length + facts.length + patterns.length;

    lessons.forEach(item => reasons.push(`lesson: ${item}`));
    facts.forEach(item => reasons.push(`fact learned: ${item}`));
    patterns.forEach(item => reasons.push(`pattern noticed: ${item}`));
  }

  if (key === "social") {
    const people = uniqueText(d.people);
    const event = String(d.relationship_event || "").trim();
    const connection = uniqueText(d.connection_actions);

    if (cats.includes("relationships") && (people.length || event || connection.length)) {
      points = 1;
      if (people.length) reasons.push(`people: ${people.join(", ")}`);
      if (event) reasons.push(`relationship event: ${event}`);
      connection.forEach(item => reasons.push(`connection action: ${item}`));
    }
  }

  if (key === "creativity") {
    const creativeActions = uniqueText(d.creative_actions);
    points = creativeActions.length;

    creativeActions.forEach(item => reasons.push(`creative action: ${item}`));
  }

  if (key === "finance") {
    const moneyActions = uniqueText(d.money_actions);
    const spending = n(d.spending);

    points = moneyActions.length + (spending > 0 ? 1 : 0);

    moneyActions.forEach(item => reasons.push(`money action: ${item}`));
    if (spending > 0) reasons.push(`$${spending.toFixed(2)} spending recorded`);
  }

  return {
    points: Math.max(0, points),
    reasons
  };
}

export function getMilestones(entries) {
  return entries
    .flatMap(entry => uniqueText(entry.data?.milestones).map(text => ({
      id: `${entry.id}-${text}`,
      text,
      created_at: entry.created_at,
      entry
    })))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getAchievements(entries, totals, stats) {
  const achievements = [
    { id: "first-memory", icon: "bubble", name: "First Bubble", unlocked: entries.length >= 1, detail: "Saved your first memory." },
    { id: "ten-memories", icon: "memories", name: "Memory Keeper", unlocked: entries.length >= 10, detail: "Saved 10 memories." },
    { id: "mile-five", icon: "butterfly", name: "Little Wanderer", unlocked: totals.miles >= 5, detail: "Logged 5 total miles." },
    { id: "squats-250", icon: "flower", name: "Blooming Strong", unlocked: totals.squats >= 250, detail: "Logged 250 squats." },
    { id: "lesson-five", icon: "wisdom", name: "Lesson Collector", unlocked: stats.wisdom >= 5, detail: "Recorded 5 lessons, facts, or patterns." },
    { id: "all-started", icon: "achievement", name: "Whole-Life Starter", unlocked: Object.values(stats).every(value => value > 0), detail: "Started every stat." }
  ];
  return achievements.filter(item => item.unlocked);
}

export function entryXP(entry) {
  const keys = ["strength", "agility", "health", "sleep", "resilience", "wisdom", "social", "creativity", "finance"];
  const progressXP = keys.reduce((total, key) => total + getStatContribution(entry, key).points * 2, 0);
  return Math.round(2 + Math.min(24, progressXP));
}

export function calculateGame(entries) {
  const totals = {
    xp: 0,
    miles: 0,
    squats: 0,
    workoutMinutes: 0,
    calories: 0,
    protein: 0,
    water: 0,
    sleepHours: 0,
    sleepLogs: 0,
    checkins: entries.length
  };

  const rawStats = {
    strength: 0,
    agility: 0,
    health: 0,
    sleep: 0,
    resilience: 0,
    wisdom: 0,
    social: 0,
    creativity: 0,
    finance: 0
  };

  entries.forEach(entry => {
    const d = entry.data || {};
    totals.xp += entryXP(entry);
    totals.miles += n(d.miles);
    totals.squats += n(d.squats);
    totals.workoutMinutes += n(d.workout_minutes) + n(d.strength_minutes) + n(d.cardio_minutes) + n(d.mobility_minutes);
    totals.calories += n(d.calories);
    totals.protein += n(d.protein_g);
    totals.water += n(d.water_oz);

    if (d.sleep_hours != null) {
      totals.sleepHours += n(d.sleep_hours);
      totals.sleepLogs += 1;
    }

    Object.keys(rawStats).forEach(key => {
      rawStats[key] += getStatContribution(entry, key).points;
    });
  });

  const stats = Object.fromEntries(
    Object.entries(rawStats).map(([key, value]) => [key, Math.max(0, Math.min(99, Math.floor(value)))])
  );

  const level = Math.max(1, Math.floor(totals.xp / 100) + 1);
  const levelXP = totals.xp % 100;

  return {
    totals,
    stats,
    rawStats,
    level,
    levelXP,
    nextLevelXP: 100 - levelXP,
    milestones: getMilestones(entries),
    achievements: getAchievements(entries, totals, stats)
  };
}

export function todayTotals(entries) {
  const today = centralDateKey();
  const todays = entries.filter(entry => centralDateKey(entry.created_at) === today);
  const dailySummary = todays.find(entry => entry.source_type === "bubble_day");
  const checkIns = todays.filter(entry => entry.source_type !== "bubble_day");
  const sumFrom = (source, key) => source.reduce((total, entry) => total + n(entry.data?.[key]), 0);
  const canonical = key => {
    const value = dailySummary?.data?.[key];
    return value !== undefined && value !== null ? n(value) : sumFrom(checkIns, key);
  };

  const confidence = dailySummary?.data?.nutrition_confidence
    ? [dailySummary.data.nutrition_confidence]
    : checkIns.map(entry => entry.data?.nutrition_confidence).filter(Boolean);

  return {
    entries: checkIns.length,
    hasDailySummary: Boolean(dailySummary),
    dailyStatus: dailySummary?.data?.status || null,
    calories: canonical("calories"),
    protein: canonical("protein_g"),
    carbs: canonical("carbs_g"),
    fat: canonical("fat_g"),
    addedSugar: canonical("added_sugar_g"),
    caffeine: canonical("caffeine_mg"),
    produce: canonical("fruit_veg"),
    nutritionConfidence: confidence,
    calorieStatus: dailySummary?.data?.calorie_status || checkIns.map(entry => entry.data?.calorie_status).find(Boolean) || null,
    maintenanceCalories: canonical("maintenance_calories"),
    estimatedDeficitCalories: dailySummary?.data?.estimated_deficit_calories ?? null,
    miles: canonical("miles"),
    squats: canonical("squats"),
    water: canonical("water_oz"),
    sleep: canonical("sleep_hours"),
    workout: canonical("workout_minutes") + canonical("strength_minutes") + canonical("cardio_minutes") + canonical("mobility_minutes")
  };
}

export function missingCheckInQuestions(entries, stats = {}) {
  const today = centralDateKey();
  const todays = entries.filter(entry => centralDateKey(entry.created_at) === today);
  const has = key => todays.some(entry => entry.data?.[key] !== undefined && entry.data?.[key] !== null);

  const questions = [];

  if (!has("sleep_hours")) questions.push("How many hours did you sleep last night, and how would you rate the quality from 1–5?");
  if (!has("water_oz")) questions.push("How much water have you had today?");
  if (!has("mood")) questions.push("What is your actual mood today, not the polite answer?");
  if (!has("miles") && !has("steps") && !has("cardio_minutes") && !has("strength_minutes")) {
    questions.push("Any walking, stairs, swimming, gym work, or tiny work workouts today? Counts, miles, or minutes all help.");
  }
  if (!has("protein_g")) questions.push("What protein have you eaten today, even if it was just a snack?");

  if ((stats.wisdom || 0) === 0) {
    questions.push("What is one lesson, fact, or pattern you have learned recently?");
  }
  if ((stats.resilience || 0) === 0) {
    questions.push("What is one thing you did recently to cope, recover, or protect your peace?");
  }
  if ((stats.creativity || 0) === 0) {
    questions.push("Have you made, written, styled, drawn, designed, or expressed anything lately?");
  }

  return questions.slice(0, 4);
}
