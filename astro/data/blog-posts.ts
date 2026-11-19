/**
 * Blog post catalogue: the single list the /blog index renders from.
 *
 * Each post's page lives at astro/pages/blog/<slug>.astro. When you add a
 * post, add it here too (blog-posts.test.ts fails if a page has no entry, or
 * an entry has no page), pick its topic, and set `featured` if it belongs in
 * "Start here" at the top of the index.
 */

export type BlogTopicId = "rule-basics" | "planning" | "accuracy";

export interface BlogTopic {
  id: BlogTopicId;
  /** Heading on the index, and the label of the topic's jump link. */
  label: string;
  /** One line under the heading saying what the topic's posts cover. */
  blurb: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** Publication date, YYYY-MM-DD. Matches the date on the post's page. */
  date: string;
  readMinutes: number;
  topic: BlogTopicId;
  /** Shown in "Start here" at the top of the index (keep it to two or three). */
  featured?: boolean;
}

/** Topics in the order they appear on the index. */
export const BLOG_TOPICS: BlogTopic[] = [
  {
    id: "rule-basics",
    label: "How the 90/180 rule works",
    blurb: "The rolling window, which days count, and when days come back.",
  },
  {
    id: "planning",
    label: "Planning your trips",
    blurb:
      "Travelling as a couple, other countries' 90/180 counters, and what happens if you get it wrong.",
  },
  {
    id: "accuracy",
    label: "Calculators & accuracy",
    blurb:
      "Why tools disagree, what to do when the EES disagrees with you, whether chatbots can do the maths, and where our data comes from.",
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "the-schengen-90-180-rolling-window",
    title: "The Schengen 90/180 Rolling Window",
    excerpt:
      "The Schengen rule uses a rolling, often-misunderstood 180-day window. We walk through five scenarios, from simple to complex, to show how it works.",
    date: "2026-06-08",
    readMinutes: 10,
    topic: "rule-basics",
    featured: true,
  },
  {
    slug: "when-does-schengen-reset",
    title: "When Does Your Schengen Allowance Reset?",
    excerpt:
      "The rule isn't a reset, it's a rolling window. Here's what that actually means for when you can go back.",
    date: "2026-09-09",
    readMinutes: 5,
    topic: "rule-basics",
  },
  {
    slug: "does-your-entry-day-count-as-a-schengen-day",
    title: "Does Your Entry Day Count as a Schengen Day? Yes, yes it does.",
    excerpt:
      "Both your entry day and your exit day count as full Schengen days, regardless of what time you cross the border. Here's what that means for your allowance.",
    date: "2026-04-21",
    readMinutes: 3,
    topic: "rule-basics",
  },
  {
    slug: "schengen-overstay-consequences",
    title: "What Actually Happens If You Overstay Your Schengen Allowance",
    excerpt:
      "A one-day overstay and a one-month overstay are not treated the same. Here's what the rules allow, what the EES records, and what to do if you've miscounted.",
    date: "2026-11-03",
    readMinutes: 9,
    topic: "planning",
    featured: true,
  },
  {
    slug: "which-countries-use-the-90-180-rule",
    title: "Which Countries Use the 90/180 Rule? (It's Not Just Schengen)",
    excerpt:
      "Leaving the Schengen Area stops your Schengen clock, but the country you go to may start one of its own. Here's which European countries run a separate 90/180 counter.",
    date: "2026-10-21",
    readMinutes: 7,
    topic: "planning",
    featured: true,
  },
  {
    slug: "schengen-calculator-couples",
    title:
      "How to Track Schengen Days When You and Your Partner Have Different Dates of Travel",
    excerpt:
      "Most Schengen calculators assume one traveler. Here's how to track two people with different entry and exit dates, and why it matters more than you think.",
    date: "2026-08-26",
    readMinutes: 8,
    topic: "planning",
  },
  {
    slug: "ees-says-your-trip-is-not-ok",
    title:
      "EES Says Your Trip Is NOT OK. You Disagree. Here's How to Find Out Who's Right.",
    excerpt:
      "The EU's official stay check can be wrong. Here's how to work out whose count is off, what proof to gather, and how to get your EES record corrected.",
    date: "2026-11-19",
    readMinutes: 8,
    topic: "accuracy",
  },
  {
    slug: "can-you-trust-ai-chatbots-with-schengen-math",
    title: "Can You Trust an AI Chatbot With Schengen Math?",
    excerpt:
      "We asked the free versions of Claude, ChatGPT, and Gemini 20 Schengen questions. Claude got all 20 right. The other two missed 21 of 40.",
    date: "2026-10-07",
    readMinutes: 6,
    topic: "accuracy",
  },
  {
    slug: "how-we-source-and-verify-visa-data",
    title: "How We Source and Verify Our Visa Data",
    excerpt:
      "Every stay-limit rule traces back to a specific government regulation. Here's how we source it, verify it, and watch for regime changes.",
    date: "2026-09-10",
    readMinutes: 4,
    topic: "accuracy",
  },
  {
    slug: "why-schengen-calculators-give-different-results",
    title:
      "Why Schengen Calculators Give Different Results And How to Know Which One Is Right",
    excerpt:
      "Different calculators, different answers. Here's why Schengen tools disagree, what algorithmic choices cause the gaps, and which source to trust when results conflict.",
    date: "2026-04-07",
    readMinutes: 5,
    topic: "accuracy",
  },
];

/** Newest first. */
export function byNewest(a: BlogPost, b: BlogPost): number {
  return b.date.localeCompare(a.date);
}

/** "November 3, 2026", matching the dates printed on the post pages. */
export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
