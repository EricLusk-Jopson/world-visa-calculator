import { useParams } from "react-router";

export default function SharedPage() {
  const { token } = useParams();
  return <div>Shared view for token: {token}</div>;
}
