import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { alpha } from "@mui/material/styles";

import { NavBar } from "./components/NavBar";
import { HeroCalculatorCard } from "./components/HeroCalculatorCard";
import { AllowanceBar } from "./components/AllowanceBar";
import { tokens } from "../../styles/theme";

// ─── Shared section layout helpers ───────────────────────────────────────────

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: tokens.fontBody,
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: tokens.green,
        mb: 2,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 7,
          height: 7,
          bgcolor: tokens.green,
          borderRadius: "50%",
          flexShrink: 0,
        }}
      />
      {children}
    </Box>
  );
}

function SectionHeading({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <Typography
      variant="h2"
      sx={{
        fontFamily: tokens.fontDisplay,
        fontSize: "clamp(2rem, 3vw, 2.8rem)",
        fontWeight: 400,
        color: light ? tokens.white : tokens.navy,
        lineHeight: 1.2,
        mb: 2,
        letterSpacing: "-0.01em",
        "& em": { fontStyle: "italic", color: tokens.green },
      }}
    >
      {children}
    </Typography>
  );
}

function SectionSub({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <Typography
      sx={{
        fontFamily: tokens.fontBody,
        fontSize: "1rem",
        color: light ? "rgba(255,255,255,0.6)" : tokens.textSoft,
        lineHeight: 1.7,
        maxWidth: 520,
      }}
    >
      {children}
    </Typography>
  );
}

// ─── Proof item (hero) ────────────────────────────────────────────────────────

function ProofItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontFamily: tokens.fontBody,
        fontSize: "0.82rem",
        color: tokens.textSoft,
        fontWeight: 500,
      }}
    >
      <Box sx={{ color: tokens.green, flexShrink: 0, display: "flex" }}>
        {icon}
      </Box>
      {children}
    </Box>
  );
}

// ─── Feature item (features section) ─────────────────────────────────────────

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Box sx={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          bgcolor: alpha(tokens.green, 0.12),
          border: `1px solid ${alpha(tokens.green, 0.2)}`,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.green,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1rem",
            fontWeight: 400,
            fontStyle: "italic",
            color: tokens.white,
            mb: "4px",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
          }}
        >
          {desc}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Step card (how it works) ─────────────────────────────────────────────────

function StepCard({
  num,
  icon,
  title,
  desc,
  borderLeft = false,
}: {
  num: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  borderLeft?: boolean;
}) {
  return (
    <Box
      sx={{
        bgcolor: tokens.white,
        p: "40px 36px",
        borderLeft: borderLeft ? `1px solid ${tokens.border}` : "none",
        transition: "background 0.2s",
        "&:hover": { bgcolor: "#FAFBFD" },
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.fontDisplay,
          fontSize: "3.5rem",
          fontWeight: 300,
          fontStyle: "italic",
          color: tokens.mist,
          lineHeight: 1,
          mb: 2,
        }}
      >
        {num}
      </Typography>
      <Box
        sx={{
          width: 44,
          height: 44,
          bgcolor: tokens.greenBg,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.green,
          mb: "20px",
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontFamily: tokens.fontDisplay,
          fontSize: "1.25rem",
          fontWeight: 400,
          fontStyle: "italic",
          color: tokens.navy,
          mb: "10px",
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.875rem",
          color: tokens.textSoft,
          lineHeight: 1.7,
        }}
      >
        {desc}
      </Typography>
    </Box>
  );
}

// ─── Trust stat ───────────────────────────────────────────────────────────────

function TrustStat({ num, label }: { num: string; label: React.ReactNode }) {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        sx={{
          fontFamily: tokens.fontDisplay,
          fontSize: "2.4rem",
          fontWeight: 600,
          color: tokens.navy,
          lineHeight: 1,
          mb: "6px",
        }}
      >
        {num}
      </Typography>
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.8rem",
          color: tokens.textSoft,
          lineHeight: 1.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ─── Rule pill ────────────────────────────────────────────────────────────────

function RulePill({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        fontFamily: tokens.fontBody,
        fontSize: "0.68rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        px: "10px",
        py: "4px",
        borderRadius: "100px",
        bgcolor: tokens.mist,
        color: tokens.textSoft,
      }}
    >
      {children}
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <Box sx={{ bgcolor: tokens.offWhite, overflowX: "hidden" }}>
      <NavBar />

      {/* ── HERO ── */}
      <Box
        component="section"
        sx={{
          minHeight: "100vh",
          pt: "64px",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "stretch",
        }}
      >
        {/* Left */}
        <Box
          sx={{
            px: { xs: 3, md: "80px" },
            py: { xs: "60px", md: "80px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "28px",
          }}
        >
          {/* Eyebrow */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: tokens.fontBody,
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: tokens.green,
              bgcolor: tokens.greenBg,
              px: "14px",
              py: "5px",
              borderRadius: "100px",
              width: "fit-content",
              border: `1px solid ${alpha(tokens.green, 0.2)}`,
              animation: "fadeUp 0.5s 0.1s both ease-out",
              "@keyframes fadeUp": {
                from: { opacity: 0, transform: "translateY(24px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Box
              component="span"
              sx={{
                width: 7,
                height: 7,
                bgcolor: tokens.green,
                borderRadius: "50%",
              }}
            />
            Free · No account required
          </Box>

          {/* Heading */}
          <Typography
            component="h1"
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "clamp(2.6rem, 4.5vw, 3.8rem)",
              fontWeight: 400,
              lineHeight: 1.12,
              color: tokens.navy,
              letterSpacing: "-0.01em",
              animation: "fadeUp 0.6s 0.2s both ease-out",
              "& em": { fontStyle: "italic", color: tokens.green },
            }}
          >
            Know exactly how long
            <br />
            you can <em>stay in Europe.</em>
          </Typography>

          {/* Sub */}
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "1.05rem",
              lineHeight: 1.7,
              color: tokens.textSoft,
              maxWidth: 440,
              animation: "fadeUp 0.6s 0.3s both ease-out",
            }}
          >
            Track your 90-day Schengen allowance across multiple travelers. Add
            trips, see remaining days, and plan without guessing.
          </Typography>

          {/* Proof items */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
              pt: 1,
              animation: "fadeUp 0.6s 0.4s both ease-out",
            }}
          >
            <ProofItem
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 1L9.8 5.8L15 6.2L11.2 9.6L12.4 15L8 12.4L3.6 15L4.8 9.6L1 6.2L6.2 5.8L8 1Z" />
                </svg>
              }
            >
              Official EU rolling-window algorithm
            </ProofItem>
            <ProofItem
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 8C2 4.686 4.686 2 8 2s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M5.5 8l2 2L11 5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              Multiple travelers, one view
            </ProofItem>
            <ProofItem
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2v4l3 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M2 8C2 4.686 4.686 2 8 2s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              }
            >
              URL-shareable results
            </ProofItem>
          </Box>
        </Box>

        {/* Right — calculator card */}
        <Box
          sx={{
            bgcolor: tokens.white,
            borderLeft: { xs: "none", md: `1px solid ${tokens.border}` },
            borderTop: { xs: `1px solid ${tokens.border}`, md: "none" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 3, md: "60px" },
            py: { xs: "40px", md: "80px" },
          }}
        >
          <HeroCalculatorCard />
        </Box>
      </Box>

      {/* ── TRUST STRIP ── */}
      <Box
        sx={{
          bgcolor: tokens.white,
          borderBottom: `1px solid ${tokens.border}`,
          px: { xs: 3, md: "80px" },
          py: { xs: "48px", md: "60px" },
        }}
      >
        <Box
          sx={{
            maxWidth: 1100,
            mx: "auto",
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: { xs: "32px", md: 0 },
            alignItems: "center",
          }}
        >
          <TrustStat
            num="90"
            label={
              <>
                days allowed
                <br />
                in any 180-day window
              </>
            }
          />
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              width: 1,
              height: 50,
              bgcolor: tokens.border,
              mx: "auto",
            }}
          />
          <TrustStat
            num="4+"
            label={
              <>
                travelers tracked
                <br />
                simultaneously
              </>
            }
          />
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              width: 1,
              height: 50,
              bgcolor: tokens.border,
              mx: "auto",
            }}
          />
          <TrustStat
            num="26"
            label={
              <>
                Schengen countries
                <br />
                using the same rule
              </>
            }
          />
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              width: 1,
              height: 50,
              bgcolor: tokens.border,
              mx: "auto",
            }}
          />
          <TrustStat
            num="0"
            label={
              <>
                accounts required
                <br />
                to get started
              </>
            }
          />
        </Box>
      </Box>

      {/* ── HOW IT WORKS ── */}
      <Box
        component="section"
        id="how"
        sx={{ px: { xs: 3, md: "80px" }, py: { xs: "60px", md: "100px" } }}
      >
        <Box sx={{ maxWidth: 1100, mx: "auto" }}>
          <SectionTag>How it works</SectionTag>
          <SectionHeading>
            Simple enough to use
            <br />
            in <em>thirty seconds.</em>
          </SectionHeading>
          <SectionSub>
            No spreadsheets. No manual math. Just add your trips and get a clear
            answer.
          </SectionSub>

          {/* Steps grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              mt: "60px",
              borderRadius: "16px",
              overflow: "hidden",
              border: `1px solid ${tokens.border}`,
              gap: "2px",
              bgcolor: tokens.border, // gap colour
            }}
          >
            <StepCard
              num="01"
              title="Add your travelers"
              desc="Enter names for everyone you want to track — yourself, a partner, family members. Each person gets their own column."
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="7"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
            <StepCard
              num="02"
              title="Log entry & exit dates"
              desc="Add each Schengen trip with entry and exit dates. Mark ongoing trips with no exit date yet. Planned future trips show up too."
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="3"
                    y="4"
                    width="14"
                    height="13"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path d="M3 9h14" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M7 2v4M13 2v4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
              borderLeft
            />
            <StepCard
              num="03"
              title="See remaining days instantly"
              desc="Color-coded statuses update live. Green means safe, yellow means caution, red means at risk. Share the link with your travel partner."
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="10"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M10 6v4l3 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
              borderLeft
            />
          </Box>
        </Box>
      </Box>

      {/* ── FEATURES ── */}
      <Box
        component="section"
        id="features"
        sx={{
          bgcolor: tokens.navy,
          px: { xs: 3, md: "80px" },
          py: { xs: "60px", md: "100px" },
          position: "relative",
          overflow: "hidden",
          // Subtle radial glow top-right
          "&::before": {
            content: '""',
            position: "absolute",
            top: -80,
            right: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(tokens.green, 0.08)} 0%, transparent 70%)`,
            pointerEvents: "none",
          },
        }}
      >
        <Box
          sx={{
            maxWidth: 1100,
            mx: "auto",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: "48px", md: "60px" },
            alignItems: "start",
            position: "relative",
          }}
        >
          {/* Left */}
          <Box>
            <SectionTag>Features</SectionTag>
            <SectionHeading light>
              Built for people with
              <br />
              <em>complex travel patterns.</em>
            </SectionHeading>
            <SectionSub light>
              Most Schengen calculators only handle a single traveler on a
              single trip. We built this because we needed something better.
            </SectionSub>
            <Box sx={{ mt: "36px" }}>
              <Link
                href="https://eurovisacalculator.com/app"
                underline="none"
                sx={{
                  display: "inline-flex",
                  px: "32px",
                  py: "14px",
                  bgcolor: tokens.green,
                  color: tokens.white,
                  fontFamily: tokens.fontBody,
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  borderRadius: "12px",
                  transition: "background 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    bgcolor: "#00A05C",
                    boxShadow: `0 6px 24px ${alpha(tokens.green, 0.35)}`,
                  },
                }}
              >
                Try it free →
              </Link>
            </Box>
          </Box>

          {/* Right — feature list */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              pt: { md: "20px" },
            }}
          >
            <FeatureItem
              title="Official rolling-window algorithm"
              desc="We implement the exact EU calculation: any 180-day lookback window, counting both entry and exit days. Verified against the official EU calculator."
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M2 9C2 5.134 5.134 2 9 2s7 3.134 7 7-3.134 7-7 7-7-3.134-7-7z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M5.5 9l2.5 2.5L13 6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <FeatureItem
              title="Multiple travelers, one dashboard"
              desc="Track couples, families, or groups with different schedules in a single shared view. Columns per traveler, shareable via URL."
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="6"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <rect
                    x="10"
                    y="2"
                    width="6"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <rect
                    x="2"
                    y="10"
                    width="6"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <rect
                    x="10"
                    y="10"
                    width="6"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              }
            />
            <FeatureItem
              title="Earliest return date calculator"
              desc="After leaving, see the earliest date you can return for a given number of days. Stops you booking flights that will get rejected at the border."
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 2v4M9 12v4M2 9h4M12 9h4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="9"
                    cy="9"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              }
            />
            <FeatureItem
              title="Date picker with live feedback"
              desc="Calendar cells are color-coded as you pick dates — green for safe, yellow for caution, red for overstay. No surprises after you click confirm."
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3 15l4-4 3 3 5-7"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <FeatureItem
              title="Trip validation & overstay warnings"
              desc="Alerts fire before you save a trip that would push you over the limit. Overlapping dates are caught automatically."
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M2 9.5l5-5 3 4 3-3 3 4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          </Box>
        </Box>
      </Box>

      {/* ── RULES EXPLAINER ── */}
      <Box
        component="section"
        id="rules"
        sx={{
          bgcolor: tokens.mist,
          borderTop: `1px solid ${tokens.border}`,
          borderBottom: `1px solid ${tokens.border}`,
          px: { xs: 3, md: "80px" },
          py: { xs: "60px", md: "100px" },
        }}
      >
        <Box
          sx={{
            maxWidth: 1100,
            mx: "auto",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1.4fr" },
            gap: { xs: "48px", md: "80px" },
            alignItems: "center",
          }}
        >
          {/* Left: text */}
          <Box>
            <SectionTag>The 90/180 Rule</SectionTag>
            <SectionHeading>
              It's not "90 days
              <br />
              then leave for 90." <em>It's more complex.</em>
            </SectionHeading>
            <SectionSub>
              The rule applies to a <strong>rolling 180-day window</strong> —
              not fixed half-years. At any given moment, look back 180 days. If
              you've spent 90 or more days in Schengen during that window, you
              cannot enter.
            </SectionSub>
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "1rem",
                color: tokens.textSoft,
                lineHeight: 1.7,
                maxWidth: 520,
                mt: 2,
              }}
            >
              This means days "roll off" your count as time passes, which can
              free up allowance earlier than most travelers expect — but also
              means miscalculations happen easily.
            </Typography>
            <Box sx={{ mt: "32px" }}>
              <Link
                href="https://eurovisacalculator.com/app"
                underline="none"
                sx={{
                  display: "inline-flex",
                  px: "28px",
                  py: "13px",
                  bgcolor: tokens.green,
                  color: tokens.white,
                  fontFamily: tokens.fontBody,
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  borderRadius: "12px",
                  transition: "background 0.2s, transform 0.15s",
                  "&:hover": {
                    bgcolor: "#00A05C",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Calculate my days →
              </Link>
            </Box>
          </Box>

          {/* Right: AllowanceBar demo card */}
          <Box
            sx={{
              bgcolor: tokens.white,
              borderRadius: "16px",
              border: `1px solid ${tokens.border}`,
              overflow: "hidden",
              boxShadow: `0 2px 24px ${alpha(tokens.navy, 0.06)}`,
            }}
          >
            {/* Card header — mimics a browser chrome / app header */}
            <Box
              sx={{
                bgcolor: tokens.navy,
                px: "20px",
                py: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: tokens.red,
                }}
              />
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: tokens.amber,
                }}
              />
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: tokens.green,
                }}
              />
              <Typography
                sx={{
                  fontFamily: tokens.fontDisplay,
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.6)",
                  ml: "6px",
                }}
              >
                Traveler status · today
              </Typography>
            </Box>

            {/* Bars */}
            <Box
              sx={{
                p: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <AllowanceBar
                name="Emma"
                daysUsed={43}
                daysRemaining={47}
                variant="safe"
              />
              <AllowanceBar
                name="Liam"
                daysUsed={76}
                daysRemaining={14}
                variant="caution"
              />
              <AllowanceBar
                name="Sofia"
                daysUsed={88}
                daysRemaining={2}
                variant="danger"
              />
            </Box>

            {/* Rule pills */}
            <Box
              sx={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                px: "20px",
                pb: "20px",
                pt: "12px",
                borderTop: `1px solid ${tokens.mist}`,
              }}
            >
              {[
                "Rolling 180-day window",
                "26 Schengen countries",
                "Entry + exit days count",
                "No fixed reset date",
              ].map((label) => (
                <RulePill key={label}>{label}</RulePill>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── FINAL CTA BAND ── */}
      <Box
        component="section"
        sx={{
          background: `linear-gradient(135deg, ${tokens.navy} 0%, ${tokens.navyMid} 100%)`,
          px: { xs: 3, md: "80px" },
          py: { xs: "60px", md: "100px" },
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -60,
            right: -60,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(tokens.green, 0.12)} 0%, transparent 70%)`,
            pointerEvents: "none",
          },
        }}
      >
        <Box
          sx={{
            maxWidth: 680,
            mx: "auto",
            textAlign: "center",
            position: "relative",
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 400,
              color: tokens.white,
              lineHeight: 1.2,
              mb: 2,
              letterSpacing: "-0.01em",
              "& em": { fontStyle: "italic", color: tokens.green },
            }}
          >
            Stop guessing.
            <br />
            Start tracking <em>in seconds.</em>
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "1rem",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              mb: "36px",
            }}
          >
            Free, no account required. Add travelers, enter your trips, and
            share a link with your travel partner immediately.
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="https://eurovisacalculator.com/app"
              underline="none"
              sx={{
                px: "32px",
                py: "14px",
                bgcolor: tokens.green,
                color: tokens.white,
                fontFamily: tokens.fontBody,
                fontSize: "0.95rem",
                fontWeight: 600,
                borderRadius: "12px",
                letterSpacing: "-0.01em",
                transition: "background 0.2s, box-shadow 0.2s",
                "&:hover": {
                  bgcolor: "#00A05C",
                  boxShadow: `0 6px 24px ${alpha(tokens.green, 0.35)}`,
                },
              }}
            >
              Open the calculator →
            </Link>
            <Link
              href="#how"
              underline="none"
              sx={{
                px: "32px",
                py: "14px",
                bgcolor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
                fontFamily: tokens.fontBody,
                fontSize: "0.95rem",
                fontWeight: 500,
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.15)",
                transition: "background 0.2s, color 0.2s",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.14)",
                  color: tokens.white,
                },
              }}
            >
              How does it work?
            </Link>
          </Box>
        </Box>
      </Box>

      {/* ── FOOTER ── */}
      <Box
        component="footer"
        sx={{
          bgcolor: tokens.navy,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          px: { xs: 3, md: "80px" },
          py: "40px",
        }}
      >
        <Box
          sx={{
            maxWidth: 1100,
            mx: "auto",
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: "20px",
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontDisplay,
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            EuroVisaCalculator
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.3)",
              lineHeight: 1.5,
              textAlign: { xs: "left", md: "center" },
            }}
          >
            For informational use only. Always verify with official EU sources
            before making travel decisions.
            <br />
            Not legal advice. Schengen rules apply to all non-EU/EEA nationals.
          </Typography>
          <Box sx={{ display: "flex", gap: "24px" }}>
            {["Privacy", "How it works", "Calculator"].map((label, i) => (
              <Link
                key={label}
                href={i === 2 ? "https://eurovisacalculator.com/app" : "#"}
                underline="none"
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.4)",
                  transition: "color 0.2s",
                  "&:hover": { color: "rgba(255,255,255,0.8)" },
                }}
              >
                {label}
              </Link>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
