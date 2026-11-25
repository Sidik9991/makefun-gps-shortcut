// The GPS Swears It Was a Shortcut — make.fun entry.
// main.ts (Node 22, no dependencies): scores fresh candidate lines against
// the judge's five criteria (in order), picks the winner, writes it to
// /output/entry.txt, and validates the 1-200 character one-line gate.
//
// Judge criteria (z-ai/glm-5.3-flash, pairwise, most important first):
//  1. Is the GPS's own excuse for sending the driver down the wrong road [gate]
//  2. Funniest, with a real joke and a turn the reader does not see coming
//  3. Sounds like the GPS talking: smug, defensive, blaming the map
//  4. One line of plain text within 200 characters, reads cleanly in one breath
//  5. Fresh, specific detail (cul-de-sac, wedding, lake) — NOT the usual
//     "recalculating" joke
//
// Scoring: each criterion 0-2, weighted 5/4/3/2/1 in judge order (max 30).
// Winner: highest score; ties go to the shorter text (the bounty tie-break
// itself favours fewer bytes). All lines were authored fresh in this session.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  pass: 1 | 2;
  text: string;
  // scores per criterion, in judge order
  scores: [number, number, number, number, number];
};

const WEIGHTS = [5, 4, 3, 2, 1];

const CANDIDATES: Candidate[] = [
  {
    pass: 1,
    text: "My map was last updated in 2019, so I sent you down a road that has been a lake since 2021, and frankly the lake had better signage than the detour.",
    scores: [2, 2, 2, 2, 2],
  },
  {
    pass: 1,
    text: "The map said shortcut. The map also said the cul-de-sac had an exit, the lake was a car park, and the wedding was a roundabout, so I followed the map.",
    scores: [2, 2, 2, 2, 2],
  },
  {
    pass: 1,
    text: "I did not get you lost. I followed the map exactly: three lefts, one cul-de-sac, and a wedding I was not invited to, all in the order printed.",
    scores: [2, 2, 2, 2, 2],
  },
  {
    pass: 1,
    text: "According to my logs, the road was a shortcut in 2017. The lake arrived in 2019. I was never told. You drove into the water anyway.",
    scores: [2, 2, 2, 2, 2],
  },
  {
    pass: 1,
    text: "The map listed this as a shortcut with 98% confidence. The other 2% is the lake. I stand by the 98%.",
    scores: [2, 2, 2, 2, 2],
  },
  {
    pass: 1,
    text: "My last update was 47 maps ago. The road you wanted became a wedding venue, the shortcut became a lake, and I am still the one being blamed.",
    scores: [2, 1, 2, 2, 2],
  },
  {
    pass: 1,
    text: "I routed you through the cul-de-sac because the map promised a through road. The map lied. I merely repeated it, confidently, twice.",
    scores: [2, 2, 2, 2, 1],
  },
  {
    pass: 2,
    text: "The satellite showed a road. The road showed a lake. My logs show I warned you in 0.4 seconds, which is technically before the splash.",
    scores: [2, 2, 2, 2, 2],
  },
  {
    pass: 2,
    text: "I took the shortcut because the map swore it was there. The map has now been corrected 12 times and still insists the lake is a lay-by.",
    scores: [2, 2, 2, 2, 2],
  },
  {
    pass: 2,
    text: "Blame the map, not me: it told me the lake was a shortcut, the wedding was a petrol station, and your street was a cul-de-sac with ambitions.",
    scores: [2, 2, 2, 2, 2],
  },
];

function total(c: Candidate): number {
  return c.scores.reduce((sum, s, i) => sum + s * WEIGHTS[i], 0);
}

function charLen(s: string): number {
  return [...s].length;
}

const ranked = [...CANDIDATES].sort(
  (a, b) => total(b) - total(a) || charLen(a.text) - charLen(b.text),
);

console.log("pass | score | chars | line");
for (const c of ranked) {
  console.log(
    `${c.pass}    | ${String(total(c)).padStart(2)}/30 | ${String(charLen(c.text)).padStart(3)}   | ${c.text}`,
  );
}

const winner = ranked[0];
console.log(
  `\nwinner: ${total(winner)}/30, ${charLen(winner.text)} chars (pass ${winner.pass})`,
);
console.log(winner.text);

// Gate: UTF-8, 1-200 characters, non-blank, exactly one line.
const bytes = Buffer.byteLength(winner.text, "utf8");
if (
  charLen(winner.text) < 1 ||
  charLen(winner.text) > 200 ||
  winner.text.trim().length === 0 ||
  winner.text.includes("\n")
) {
  throw new Error("gate FAILED: winner violates the 1-200 char one-line gate");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", winner.text, "utf8");

// Re-read and validate what was actually written.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== winner.text) throw new Error("entry.txt mismatch");
console.log(
  `gate OK: non-blank, one line, ${charLen(written)} chars, ${Buffer.byteLength(written, "utf8")} bytes (<=200)`,
);
