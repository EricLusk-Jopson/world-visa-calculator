import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

interface Props {
  daysRemaining: number;
}

export function DisclaimerBanner({ daysRemaining }: Props) {
  const isAtBuffer = daysRemaining === 2;
  const isApproaching = daysRemaining <= 5 && daysRemaining > 2;
  const isAtLimit = daysRemaining === 0;

  if (!isAtBuffer && !isApproaching && !isAtLimit) return null;

  if (isAtBuffer) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <AlertTitle>Practical limit reached</AlertTitle>
        You have 2 days remaining — this is our recommended minimum buffer.
        Consider this your practical limit.
      </Alert>
    );
  }

  return (
    <Alert severity="warning" sx={{ mt: 2 }}>
      <AlertTitle>Plan for buffer days</AlertTitle>
      We recommend not using your full 90-day allowance. Leave at least 2 days
      unused to account for travel delays, missed connections, or unexpected
      disruptions. Overstaying — even by one day — can result in fines, entry
      bans, and complications with future visa applications.
    </Alert>
  );
}
