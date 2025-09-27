// "use client";

import { getFunFact } from '@/utils/funfact'

// import { useEffect, useState } from "react";

export default async function FunFact() {
  // const [funFact, setFunFact] = useState("");

  // useEffect(() => {
  //   async function fetchFunFact() {
  //     try {
  //       const response = await fetch("/api/funfact");
  //       const data = await response.json();
  //       setFunFact(data.funFact);
  //     } catch (error) {
  //       console.error("Error fetching fun fact:", error);
  //       setFunFact("Failed to load fun fact.");
  //     }
  //   }

  //   fetchFunFact();
  // }, []);
  const funFact = await getFunFact()

  return <div className='text-center p-6'>{funFact}</div>
}
