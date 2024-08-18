import { NextResponse } from 'next/server';
import { db } from '../../../drizzle/db';
import { udRankings } from '../../../drizzle/schema';

// Define the type for the UD ranking object
interface UD_Ranking {
  first_name: string;
  last_name: string;
  adp: number;
  projected_points: number;
  position_rank: string;
  slot_name: string;
  team_name: string;
  lineup_status: string;
  bye_week: string;
}

// Function to fetch UD rankings from the database
async function fetchUdRankings(): Promise<UD_Ranking[]> {
  const rankings = await db
    .select()
    .from(udRankings)
    .execute(); 

  return rankings.map((ranking: any) => ({
    first_name: ranking.first_name,
    last_name: ranking.last_name,
    adp: ranking.adp,
    projected_points: ranking.projected_points,
    position_rank: ranking.position_rank,
    slot_name: ranking.slot_name,
    team_name: ranking.team_name,
    lineup_status: ranking.lineup_status,
    bye_week: ranking.bye_week,
  }));
}

export async function GET() {
  try {
    const rankings = await fetchUdRankings();
    return NextResponse.json({ rankings });
  } catch (error) {
    console.error('Fetching error:', error);
    return NextResponse.json({ error: 'Failed to fetch UD rankings' }, { status: 500 });
  }
}