/*import { NextResponse } from 'next/server';
import { db } from '../../../drizzle/db';
import { eq } from 'drizzle-orm';

// Define the type for the ranking object
interface Ranking {
  player: string;
  value: number;
}

// Function to fetch KTC rankings from the database
async function fetchKtcRankings(): Promise<Ranking[]> {
  const rankings = await db
    .select()
    .from(ktcRankings)
    .execute(); 

  return rankings.map((ranking: any) => ({
    player: ranking.player,
    value: ranking.value,
  }));
}

export async function GET() {
  try {
    const rankings = await fetchKtcRankings();
    return NextResponse.json({ rankings });
  } catch (error) {
    console.error('Fetching error:', error);
    return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
  }
}*/