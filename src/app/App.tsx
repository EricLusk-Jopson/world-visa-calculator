import { useState } from "react";
import Button from "@mui/material/Button";
import "./App.css";

interface Trip {
  traveler: string;
  entry: string;
  exit: string;
}

function App() {
  // need to add and remove trips
  const [trips, setTrips] = useState<Trip[]>([]);
  return (
    <>
      {trips.map((trip) => (
        <Button sx={{ backgroundColor: "yellow" }}>{trip.traveler}</Button>
      ))}
    </>
  );
}

export default App;
