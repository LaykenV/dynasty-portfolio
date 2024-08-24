import { NextResponse } from 'next/server';

interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  status: string;
  sport: string;
}

export async function GET() {
  try {
    // Fetch the data from the Sleeper API
    const response = await fetch('https://api.sleeper.app/v1/players/nfl');
    const responseJson = await response.json();

    // Filter the data
    const filteredData = Object.keys(responseJson).reduce((result: Record<string, { first_name: string; last_name: string }>, playerId: string) => {
      const player: Player = responseJson[playerId];
      
      // Only include players who are "Active" and in the "nfl" sport
      if (player.status === 'Active' && player.sport === 'nfl') {
        result[playerId] = {
          first_name: player.first_name,
          last_name: player.last_name,
        };
      }

      return result;
    }, {});

    // Return the filtered data
    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Error fetching player data:', error);
    return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 500 });
  }
}