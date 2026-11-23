/**
 * EES Record Fixer: legal citations, one constant each, so the letters and
 * the landing page quote them the same way and v2 translations can reuse them.
 *
 * Source: Regulation (EU) 2017/2226 (SchengenSources.eesRegulation), unless
 * noted. TODO(human): before launch, check each summary against the EUR-Lex
 * text (spec open questions "Article 35 details" and "Liability").
 */

export const EES_REGULATION = "Regulation (EU) 2017/2226";
export const EES_REGULATION_LONG =
  "Regulation (EU) 2017/2226 establishing an Entry/Exit System (EES)";

export interface Citation {
  /** How the letter cites it, e.g. "Article 52(1)". */
  ref: string;
  /** What it gives the traveller, in plain English. */
  gives: string;
}

export const ART_52_1: Citation = {
  ref: "Article 52(1)",
  gives:
    "You may ask the authority of any EES country for access to, rectification, completion or erasure of your data. It must reply within 45 days of receiving the request.",
};

export const ART_52_2: Citation = {
  ref: "Article 52(2)",
  gives:
    "If you write to a country that did not enter the data, it checks within 30 days, or contacts the responsible country within 7 days, which then has 30 days to check.",
};

export const ART_52_3: Citation = {
  ref: "Article 52(3)",
  gives:
    "Inaccurate or incomplete data is rectified or completed under Article 35, and you are told in writing without delay.",
};

export const ART_52_4_5: Citation = {
  ref: "Article 52(4) and (5)",
  gives:
    "A refusal comes as a written decision with reasons, and with information on how to challenge it.",
};

export const ART_52_6: Citation = {
  ref: "Article 52(6)",
  gives: "Only the minimum information needed to identify you may be asked for.",
};

export const ART_35: Citation = {
  ref: "Article 35",
  gives: "The responsible country rectifies, completes or erases data in the EES.",
};

export const ART_53: Citation = {
  ref: "Article 53",
  gives: "The national data protection authority must help you on request.",
};

export const ART_54: Citation = {
  ref: "Article 54",
  gives:
    "You can bring an action or complaint if you are refused, or if no reply comes within the Article 52 deadlines.",
};

/** The rights table on the landing page, in order. */
export const RIGHTS_TABLE: Citation[] = [ART_52_1, ART_52_2, ART_52_3, ART_52_4_5, ART_52_6, ART_53, ART_54];
