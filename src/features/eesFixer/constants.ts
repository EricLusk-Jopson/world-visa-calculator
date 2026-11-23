/**
 * EES Record Fixer: dates and deadlines.
 *
 * Every figure here comes from an EU legal text. The links live in
 * SchengenSources (src/data/sources.ts), under the key named in each comment,
 * so the source-check pipeline health-checks them.
 */

/**
 * First day of EES operations: the progressive start began on 12 October
 * 2025. Crossings before this date are not in anyone's EES record.
 * Source: Regulation (EU) 2025/1534, SchengenSources.eesProgressiveStart.
 */
export const EES_START = "2025-10-12";

/**
 * First day of full operation, after the 180-day progressive start ended on
 * 9 April 2026. Between EES_START and this date, member states could still
 * cross travellers without registering them, so a gap in that period is not
 * necessarily an error.
 * Source: Regulation (EU) 2025/1534, SchengenSources.eesProgressiveStart.
 */
export const EES_FULL = "2026-04-10";

/**
 * Days the authority has to reply to a request for access, rectification,
 * completion or erasure, counted from receipt.
 * Source: Regulation (EU) 2017/2226, Art. 52(1), SchengenSources.eesRegulation.
 */
export const REPLY_DEADLINE_DAYS = 45;

/** The calendar file adds a reminder this many days before the reply deadline. */
export const REMINDER_LEAD_DAYS = 7;

/**
 * The 90/180-day rule for short stays.
 * Source: Regulation (EU) 2016/399, Art. 6(1), SchengenSources.bordersCode.
 */
export const SHORT_STAY_DAYS = 90;
export const SHORT_STAY_WINDOW = 180;

/** How many extra EU checker results (probe dates) the fixer asks for, at most. */
export const MAX_PROBES = 2;

/** How far ahead of today a probe date may be. The EU checker accepts future dates. */
export const PROBE_HORIZON_DAYS = 180;

/** The longest late exit the engine tests, in days. */
export const MAX_LATE_EXIT_DAYS = 90;
