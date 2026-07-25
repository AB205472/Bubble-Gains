const n = value => Number.isFinite(Number(value)) ? Number(value) : 0;

export const BUBBLE_TIME_ZONE = "America/Chicago";

export function centralDateKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUBBLE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const get = type => parts.find(p => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * One source of truth for every game stat.
 * The Home score and the clickable source breakdown both use this function.
 * A record contributes only when it contains data directly relevant to that stat.
 */
export function getStatContribution(entry, key) {
  const d = entry.data || {};
  const cats = entry.categories || [];
  const reasons = [];
  let points = 0;

  if (key === "strength") {
    const squatPoints = n(d.squats) / 25;
    const repPoints = n(d.strength_reps) / 25;
    const strengthMinutePoints = n(d.strength_minutes) / 15;
    points = squatPoints + repPoints + strengthMinutePoints;

    if (d.squats) reasons.push(`${Math.round(n(d.squats))} squats`);
    if (d.strength_reps) reasons.push(`${Math.round(n(d.strength_reps))} non-squat strength reps`);
    if (d.strength_minutes) reasons.push(`${Math.round(n(d.strength_minutes))} strength-training minutes`);
  }

  if (key === "agility") {
    const milePoints = n(d.miles) * 2;
    const stepPoints = n(d.steps) / 2500;
    const flightPoints = n(d.flights) / 4;
    const cardioMinutePoints = n(d.cardio_minutes) / 15;
    points = milePoints + stepPoints + flightPoints + cardioMinutePoints;

    if (d.miles) reasons.push(`${n(d.miles).toFixed(n(d.miles) % 1 ? 2 : 0)} miles`);
    if (d.steps) reasons.push(`${Math.round(n(d.steps)).toLocaleString()} steps`);
    if (d.flights) reasons.push(`${Math.round(n(d.flights))} flights of stairs`);
    if (d.cardio_minutes) reasons.push(`${Math.round(n(d.cardio_minutes))} cardio or active-movement minutes`);
  }

  if (key === "health") {
    const proteinPoints = n(d.protein_g) >= 25 ? 1 : 0;
    const producePoints = Math.min(2, Math.floor(n(d.fruit_veg)));
    const hydrationPoints = n(d.water_oz) >= 32 ? 1 : 0;
    points = proteinPoints + producePoints + hydrationPoints;

    if (proteinPoints) reasons.push(`${Math.round(n(d.protein_g))}g protein logged`);
    if (producePoints) reasons.push(`${Math.round(n(d.fruit_veg))} fruit/vegetable serving${Math.round(n(d.fruit_veg)) === 1 ? "" : "s"}`);
    if (hydrationPoints) reasons.push(`${Math.round(n(d.water_oz))} oz water logged`);
  }

  if (key === "sleep") {
    if (d.sleep_hours != null) {
      points = 1; // logging sleep is useful data
      reasons.push(`${n(d.sleep_hours).toFixed(n(d.sleep_hours) % 1 ? 1 : 0)} hours logged`);
      if (n(d.sleep_hours) >= 7) {
        points += 1;
        reasons.push("met the 7-hour sleep target");
      }
      if (n(d.sleep_quality) >= 4) {
        points += 1;
        reasons.push(`sleep quality ${Math.round(n(d.sleep_quality))}/5`);
      }
    }
  }

  if (key === "resilience") {
    const explicitGrowth = n(d.growth_points);
    const hardMindCheckIn = cats.includes("mind") && Boolean(d.mood);
    const boundaryWork = /boundary|clarity|protect|step back|reciprocal|uncertainty/i.test(
      `${d.relationship_event || ""} ${(d.notes || []).join(" ")}`
    );

    points = explicitGrowth + (hardMindCheckIn ? 1 : 0) + (boundaryWork ? 1 : 0);

    if (explicitGrowth) reasons.push(`${explicitGrowth} explicitly recorded growth point${explicitGrowth === 1 ? "" : "s"}`);
    if (hardMindCheckIn) reasons.push(`honest emotional check-in: ${d.mood}`);
    if (boundaryWork) reasons.push("boundary, clarity, or self-protection work");
  }

  if (key === "wisdom") {
    const reflectionPoints = cats.includes("growth") ? 1 : 0;
    const insightPoints = (d.notes || []).some(note =>
      /realized|recognized|learned|pattern|values|peace|milestone|wants|needs/i.test(note)
    ) ? 1 : 0;
    points = reflectionPoints + insightPoints;

    if (reflectionPoints) reasons.push("entry was explicitly categorized as growth");
    if (insightPoints) reasons.push("record contains a named insight, value, need, or pattern");
  }

  if (key === "social") {
    const hasRelationshipData =
      cats.includes("relationships") &&
      ((d.people || []).length > 0 || Boolean(d.relationship_event));
    points = hasRelationshipData ? 1 : 0;

    if (hasRelationshipData) {
      if ((d.people || []).length) reasons.push(`people mentioned: ${(d.people || []).join(", ")}`);
      if (d.relationship_event) reasons.push(d.relationship_event);
    }
  }

  if (key === "creativity") {
    const creative = cats.includes("creativity");
    points = creative ? 1 : 0;
    if (creative) reasons.push("explicit creativity or self-expression entry");
  }

  if (key === "finance") {
    const moneyEntry = cats.includes("money");
    points = moneyEntry ? 1 : 0;
    if (moneyEntry) {
      if (d.spending) reasons.push(`$${n(d.spending).toFixed(2)} spending logged`);
      else reasons.push("money, budget, income, or planning entry");
    }
  }

  return {
    points: Math.max(0, points),
    reasons
  };
}

export function entryXP(entry) {
  const d = entry.data || {};
  let xp = 2; // basic reward for checking in
  xp += Math.min(10, getStatContribution(entry, "strength").points * 2);
  xp += Math.min(10, getStatContribution(entry, "agility").points * 2);
  xp += Math.min(6, getStatContribution(entry, "health").points * 2);
  xp += Math.min(6, getStatContribution(entry, "sleep").points * 2);
  xp += Math.min(8, getStatContribution(entry, "resilience").points);
  xp += Math.min(5, getStatContribution(entry, "wisdom").points * 2);
  xp += Math.min(3, getStatContribution(entry, "social").points * 2);
  xp += Math.min(3, getStatContribution(entry, "creativity").points * 2);
  xp += Math.min(3, getStatContribution(entry, "finance").points * 2);
  return Math.round(xp);
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
    totals.workoutMinutes +=
      n(d.workout_minutes) +
      n(d.strength_minutes) +
      n(d.cardio_minutes) +
      n(d.mobility_minutes);
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
    Object.entries(rawStats).map(([key, value]) => [
      key,
      Math.max(0, Math.min(99, Math.floor(value)))
    ])
  );

  const level = Math.max(1, Math.floor(totals.xp / 100) + 1);
  const levelXP = totals.xp % 100;

  return {
    totals,
    stats,
    rawStats,
    level,
    levelXP,
    nextLevelXP: 100 - levelXP
  };
}

export function todayTotals(entries) {
  const today = centralDateKey();
  const todays = entries.filter(entry => centralDateKey(entry.created_at) === today);
  const sum = key => todays.reduce((total, entry) => total + n(entry.data?.[key]), 0);

  return {
    entries: todays.length,
    calories: sum("calories"),
    protein: sum("protein_g"),
    miles: sum("miles"),
    squats: sum("squats"),
    water: sum("water_oz"),
    sleep: sum("sleep_hours"),
    workout:
      sum("workout_minutes") +
      sum("strength_minutes") +
      sum("cardio_minutes") +
      sum("mobility_minutes")
  };
}

export function missingCheckInQuestions(entries) {
  const today = centralDateKey();
  const todays = entries.filter(entry => centralDateKey(entry.created_at) === today);
  const has = key => todays.some(entry =>
    entry.data?.[key] !== undefined && entry.data?.[key] !== null
  );

  const questions = [];
  if (!has("sleep_hours")) questions.push("How many hours did you sleep last night—and was it decent sleep or restless?");
  if (!has("water_oz")) questions.push("How much water have you had so far?");
  if (!has("mood")) questions.push("What is your actual mood today, not the polite answer?");
  if (!has("miles") && !has("steps") && !has("cardio_minutes") && !has("strength_minutes")) {
    questions.push("Any walking, stairs, swimming, gym time, or tiny work workouts today?");
  }
  if (!has("protein_g")) questions.push("What protein have you eaten today, even if it was just a snack?");
  return questions.slice(0, 3);
}
