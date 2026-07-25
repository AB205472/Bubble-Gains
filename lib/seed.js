export const PROFILE = {
  name: "Alli",
  age: 25,
  height: "5'4\"",
  weight: null,
  weightNote: "Probably below 180 lb; waiting for a fresh weigh-in.",
  goals: [
    "Lose fat without punishing myself",
    "Build real strength and stamina",
    "Sleep more consistently",
    "Create a peaceful, connected life",
    "Meet people where they meet me"
  ],
  principles: [
    "Mistakes are data.",
    "Progress over perfection.",
    "Make decisions based on values, not fears.",
    "After so much chaos, peace is something I can give myself."
  ]
};

export const SEED_ENTRIES = [
  {
    created_at: "2026-07-04T18:00:00-05:00",
    raw_text: "Last weigh-in was around 180. I want to lose weight but I also want to stop obsessing over the scale.",
    summary: "Chose progress beyond the scale.",
    encouragement: "Not weighing every day can be part of healing your relationship with progress.",
    categories: ["body","mind","growth"],
    data: { mood:"hopeful", weight_lb:180, lessons:["Daily weighing is not required for progress."], notes:["Last known weight; current weight may be lower."] }
  },
  {
    created_at: "2026-07-12T22:30:00-05:00",
    raw_text: "I do not want to keep being emotionally invested in someone who cannot meet me in the same place.",
    summary: "Recognized the cost of one-sided emotional investment.",
    encouragement: "Naming the pattern is already a boundary beginning to form.",
    categories: ["relationships","mind","growth"],
    data: { mood:"hurt", people:["Justin"], relationship_event:"clarity", patterns_noticed:["I repeatedly become deeply invested in people who cannot meet me in the same emotional place."], lessons:["Reciprocity matters more than simply maintaining closeness."], boundaries:["Recognized the need to reduce one-sided emotional investment."], notes:["Wants reciprocal emotional investment."] }
  },
  {
    created_at: "2026-07-16T18:30:00-05:00",
    raw_text: "Nat is pregnant. I love her and want to support her, but it also hits my own grief really hard.",
    summary: "Held love for Nat alongside personal grief.",
    encouragement: "Two truths can live together: you can love her deeply and still need care for yourself.",
    categories: ["relationships","mind","growth"],
    data: { mood:"grief", people:["Nat"], relationship_event:"pregnancy support", lessons:["Love for someone else and personal grief can exist at the same time."], boundaries:["Needs sustainable boundaries while continuing to support Nat."], notes:["Needs sustainable boundaries while staying loving."] }
  },
  {
    created_at: "2026-07-17T08:00:00-05:00",
    raw_text: "Started using tiny resistance-band workouts at work: curls, pull-aparts, kickbacks, side steps, squats, calf raises.",
    summary: "Started the workday strength routine.",
    encouragement: "Tiny workouts count because they are repeatable.",
    categories: ["body","growth","work"],
    data: { exercises:["band curls","pull-aparts","kickbacks","side steps","squats","calf raises"], notes:["Exercise types were recorded, but exact repetitions and duration were not provided, so this entry does not add numeric Strength or Agility points."] }
  },
  {
    created_at: "2026-07-18T20:00:00-05:00",
    raw_text: "Ate three taco croissants and a Whopper. Did light swimming, walked about half a mile, and climbed four flights of stairs.",
    summary: "Logged food plus a surprisingly active day.",
    encouragement: "Movement still counts on a higher-calorie day.",
    categories: ["body","fun"],
    data: { calories:1850, protein_g:70, miles:0.5, flights:4, exercises:["light swimming","walking","stairs"], recovery_actions:["Went swimming and moved outside."], notes:["Swimming duration was not provided, so only the documented half mile and four flights affect Agility."] }
  },
  {
    created_at: "2026-07-20T20:30:00-05:00",
    raw_text: "50 squats, 20 curls each side, about 10 push-ups, then two treadmill miles: one at incline 3 and one at incline 8.5.",
    summary: "Completed a full strength and incline-walking session.",
    encouragement: "That is real work—legs, arms, pushing strength, and endurance all in one session.",
    categories: ["body","growth"],
    data: { squats:50, strength_reps:50, miles:2, cardio_minutes:48, exercises:["squats","40 curls","10 push-ups","incline treadmill"], notes:["The two treadmill miles at 2.5 mph equal about 48 minutes. Strength reps include only the 40 curls and 10 push-ups; squats are counted separately."] }
  },
  {
    created_at: "2026-07-21T06:15:00-05:00",
    raw_text: "Before work: 50 squats, 20 push-ups total, stair master, 10 weighted squats, 10 curls each side, 20 shoulder lifts, two short planks, and stretching.",
    summary: "Got up early and trained before work.",
    encouragement: "You did this before the day could talk you out of it.",
    categories: ["body","growth"],
    data: { squats:60, strength_reps:60, exercises:["50 squats","20 push-ups","stair master","10 weighted squats","20 curls","20 shoulder lifts","planks","stretching"], notes:["Strength reps include 20 push-ups, 20 curls, and 20 shoulder lifts. The 60 total squats are counted separately. Stair-master and plank duration were not provided, so no time-based points are added."] }
  },
  {
    created_at: "2026-07-21T08:30:00-05:00",
    raw_text: "Breakfast was vanilla yogurt, strawberries, blueberries, honey, flax granola, and green tea with peach flavor.",
    summary: "Built a colorful, filling breakfast.",
    encouragement: "That breakfast brought protein, fruit, fiber, and actual enjoyment.",
    categories: ["body"],
    data: { calories:430, protein_g:18, fruit_veg:2, foods:["vanilla yogurt","strawberries","blueberries","honey","flax granola","green tea"] }
  },
  {
    created_at: "2026-07-21T11:30:00-05:00",
    raw_text: "Two small salami cheese roll-ups and tuna later.",
    summary: "Added easy protein snacks.",
    encouragement: "Convenient protein is still good protein.",
    categories: ["body"],
    data: { calories:360, protein_g:36, foods:["salami cheese roll-ups","tuna"] }
  },
  {
    created_at: "2026-07-21T20:00:00-05:00",
    raw_text: "I realized I do not have to suck in to not hate myself anymore. I am not at my goal, but I do not feel like the biggest thing in the room when I breathe.",
    summary: "Felt a major body-image shift.",
    encouragement: "This is one of the biggest wins in your history: your body became somewhere you could breathe.",
    categories: ["mind","body","growth"],
    data: { mood:"proud", lessons:["I do not have to suck in my stomach to deserve comfort in my body."], milestones:["Breathed normally without feeling like the biggest person in the room."], notes:["Body-neutrality milestone."] }
  },
  {
    created_at: "2026-07-22T08:00:00-05:00",
    raw_text: "My job is demanding and too much of the clerical, payroll, and accounting work falls on me. I want a life with art, peace, health, and work that matters.",
    summary: "Named the gap between current work and desired life.",
    encouragement: "Burnout is information. It is pointing toward the life you want to build.",
    categories: ["work","mind","growth"],
    data: { mood:"burned out", work_stress:8, patterns_noticed:["My current workload consumes the time and mental space I want to give to health, art, and meaningful service."], lessons:["Burnout is information about what needs to change."], notes:["Wants more time for art, health, homelessness, hunger, abuse, and recovery work."] }
  },
  {
    created_at: "2026-07-23T03:00:00-05:00",
    raw_text: "Sleep has been rough for months. I fall asleep around 9, wake between 2 and 4, and my mind starts racing.",
    summary: "Logged the recurring sleep pattern.",
    encouragement: "Sleep deserves to be tracked as a real stat, not treated like a personal failure.",
    categories: ["body","mind"],
    data: { sleep_hours:5, sleep_quality:2, mood:"tired", patterns_noticed:["I often wake between 2 and 4 a.m. and my mind begins racing."], notes:["Frequently wakes between 2–4 a.m."] }
  },
  {
    created_at: "2026-07-23T18:00:00-05:00",
    raw_text: "Justin keeps wanting me to stay with him and be around, but he still says he does not want a relationship. I care about him deeply and the uncertainty hurts.",
    summary: "Logged closeness with Justin and the pain of uncertainty.",
    encouragement: "Closeness can be real while still not being enough for what your heart needs.",
    categories: ["relationships","mind"],
    data: { mood:"conflicted", people:["Justin"], relationship_event:"situationship uncertainty", patterns_noticed:["His desire for closeness does not automatically mean he wants the same commitment I want."], lessons:["Real closeness can still be insufficient when my need for clarity is unmet."], notes:["Wants reciprocity, safety, and clarity."] }
  },
  {
    created_at: "2026-07-24T12:00:00-05:00",
    raw_text: "I did my makeup to feel cute, hated it, took most of it off, used brow gel, chapstick, and a little bronzer, and felt prettier. That has never happened before.",
    summary: "Preferred her natural face and felt genuinely cute.",
    encouragement: "That was not giving up on makeup. That was recognizing yourself.",
    categories: ["mind","growth","fun"],
    data: { mood:"confident", lessons:["Feeling like myself can matter more than performing a conventional version of looking cute."], creative_actions:["Chose a natural makeup look that felt authentic."], milestones:["Preferred her natural face and felt genuinely cute."], notes:["Authentic self-expression milestone."] }
  },
  {
    created_at: "2026-07-24T18:30:00-05:00",
    raw_text: "100 squats and walked about a mile.",
    summary: "Finished 100 squats and another mile.",
    encouragement: "Your consistency is becoming part of who you are.",
    categories: ["body","growth"],
    data: { squats:100, miles:1, exercises:["squats","walking"], notes:["No separate strength repetitions or workout duration were provided; only 100 squats and one mile are scored."] }
  },
  {
    created_at: "2026-07-24T20:30:00-05:00",
    raw_text: "Raspberries, green tea, green drink, most of a pork sandwich, pepperoni meat stick, two oatmeal raisin cookies, blueberry fig bar, cotton candy ice cream bar, and an Airhead.",
    summary: "Logged the full day honestly instead of hiding the fun food.",
    encouragement: "Accurate tracking beats perfect-looking tracking every single time.",
    categories: ["body"],
    data: { calories:1760, protein_g:52, fruit_veg:1, foods:["raspberries","green tea","green drink","pork sandwich","pepperoni meat stick","oatmeal raisin cookies","blueberry fig bar","ice cream bar","Airhead"] }
  }
];
