import { NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { playerData, pickValues } from '@/drizzle/schema';

export async function GET() {
  try {
    // Query the database to fetch all player data
    const players = await db.select().from(playerData).execute();

    const pickValuesArray = await db.select().from(pickValues).execute();

    // Return the fetched data as JSON
    return NextResponse.json({
      success: true,
      playerData: players,
      pickValues: pickValuesArray,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching player data:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching player data',
    }, { status: 500 });
  }
}