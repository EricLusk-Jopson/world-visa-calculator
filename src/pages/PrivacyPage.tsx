import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

export function PrivacyPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Privacy Policy
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={4}>
        Last updated: March 2026
      </Typography>

      <Section title="What this tool does">
        EuroVisaCalculator is a client-side web application. Your trip dates,
        traveler names, and travel history are stored in your browser only —
        in your URL and in your browser&apos;s local storage. This data never
        leaves your device to our servers.
      </Section>

      <Section title="What we collect">
        We collect anonymous usage events to understand how the tool is used
        and to improve it. These events include actions like &ldquo;trip added&rdquo; or
        &ldquo;link copied&rdquo;, along with your approximate screen size and browser
        type. We do not collect your name, email address, IP address, or any
        actual travel dates.
      </Section>

      <Section title="What we don't do">
        <ul>
          <li>We do not sell data to anyone</li>
          <li>We do not share data with third parties</li>
          <li>We do not run advertising</li>
          <li>We do not store your travel history on our servers</li>
          <li>We do not use cookies for tracking</li>
        </ul>
      </Section>

      <Section title="Local storage">
        Your trip data is saved in your browser&apos;s local storage so it persists
        between visits. You can clear this at any time by clearing your browser
        data, or by using the &ldquo;Reset all data&rdquo; option in the app. You can also
        share your data with others via the shareable URL — only people you
        share that URL with can see your trips.
      </Section>

      <Section title="Analytics">
        We use a lightweight, self-hosted analytics setup. No third-party
        analytics platforms (such as Google Analytics) are used. The anonymous
        event data we collect is used solely to understand feature usage and
        fix bugs.
      </Section>

      <Section title="Legal disclaimer">
        EuroVisaCalculator is an informational tool only. Results should not be
        relied upon as legal advice or as a guarantee of entry into the Schengen
        Area. Always verify your travel dates against official records, including
        your passport stamps. We recommend leaving a buffer of at least 2 days
        below your maximum allowance to account for unexpected travel disruptions.
        Border decisions are made at the discretion of individual member state
        authorities.
      </Section>

      <Section title="Contact">
        Questions? Reach us at{" "}
        <Link href="mailto:hello@eurovisacalculator.com">
          hello@eurovisacalculator.com
        </Link>
        .
      </Section>
    </Container>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" component="div">
        {children}
      </Typography>
    </Box>
  );
}
