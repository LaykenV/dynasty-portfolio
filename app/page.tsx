"use client";

import Link from "next/link";
import { useState } from "react";
//import LoginForm from "./loginForm";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [sleeperUsername, setSleeperUsername] = useState<string>("");

  const handleFetchSleeper = (username: string) => {
    setSleeperUsername(username);
    console.log("Fetching data for:", username);
    // Add API call logic here
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/*<LoginForm sleeperUsername={sleeperUsername} fetchSleeper={handleFetchSleeper} />*/}
      <Link href="/dashboard">
        <Button variant="link">Enter your Sleeper Username</Button>
      </Link>
    </main>
  );
}