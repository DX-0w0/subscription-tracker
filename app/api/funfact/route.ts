
import { getFunFact } from "@/utils/funfact";

export async function GET() {
  try {
    const funFact = await getFunFact();
    return Response.json({ funFact });
  } catch (error) {
    console.error('Error fetching fun fact:', error);
    return Response.json(
      { error: 'Failed to fetch fun fact' },
      { status: 500 }
    );
  }
}
