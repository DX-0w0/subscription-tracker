"use client";

import { useEffect, useState } from "react";

export default function FunFact() {
  const [funFact, setFunFact] = useState("");

  useEffect(() => {
    async function fetchFunFact() {
      try {
        const response = await fetch("/api/funfact");
        const data = await response.json();
        setFunFact(data.funFact);
      } catch (error) {
        console.error("Error fetching fun fact:", error);
        setFunFact("Failed to load fun fact.");
      }
    }

    fetchFunFact();
  }, []);

  return <div className="text-center p-6">{funFact}</div>;
}
