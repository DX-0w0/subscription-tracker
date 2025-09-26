
import { getFunFact } from "@/utils/funfact";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const funFact = await getFunFact();
    return NextResponse.json({ funFact });
  } catch (error) {
    console.error("Error fetching fun fact:", error);
    return NextResponse.json(
      { error: "Failed to fetch fun fact" },
      { status: 500 }
    );
  }
}
