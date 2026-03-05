import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { alpha } from "@mui/material/styles";
import { tokens } from "@/styles/theme";

interface NavLink {
  label: string;
  href: string;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "The 90/180 Rule", href: "#rules" },
];

interface NavBarProps {
  links?: NavLink[];
  ctaHref?: string;
}

export function NavBar({
  links = DEFAULT_LINKS,
  ctaHref = "https://eurovisacalculator.com/app",
}: NavBarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: alpha(tokens.offWhite, scrolled ? 0.92 : 0.72),
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${scrolled ? tokens.border : "transparent"}`,
        boxShadow: scrolled ? `0 1px 0 ${tokens.border}` : "none",
        transition:
          "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        height: 64,
        justifyContent: "center",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "64px !important",
          px: { xs: "24px", md: "40px" },
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Logo */}
        <Link
          href="#"
          underline="none"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
            fontFamily: tokens.fontDisplay,
            fontWeight: 600,
            fontSize: "1.1rem",
            color: tokens.navy,
          }}
        >
          {/* Green pulse dot */}
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              bgcolor: tokens.green,
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
          EuroVisaCalculator
        </Link>

        {/* Nav links — hidden on mobile */}
        <Box
          component="nav"
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: "28px",
          }}
        >
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              underline="none"
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.875rem",
                fontWeight: 500,
                color: tokens.textSoft,
                transition: "color 0.18s",
                "&:hover": { color: tokens.navy },
              }}
            >
              {label}
            </Link>
          ))}

          {/* CTA pill */}
          <Link
            href={ctaHref}
            underline="none"
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: tokens.white,
              bgcolor: tokens.navy,
              px: "18px",
              py: "7px",
              borderRadius: "8px",
              transition: "background 0.18s",
              "&:hover": { bgcolor: tokens.navyMid },
            }}
          >
            Open calculator →
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
