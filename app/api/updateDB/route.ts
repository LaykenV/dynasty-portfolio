import { NextResponse } from 'next/server';
import { db } from '../../../drizzle/db';
import { sql } from 'drizzle-orm';
import { fetchSleeperData } from '@/utils/fetchSleeper';
import { fetchKtcRankings } from '@/utils/fetchKTC';
import { fetchUdRankings } from '@/utils/fetchUD';
import { playerData } from '../../../drizzle/schema';
import { SleeperEntry, SleeperEntryName } from '@/utils/fetchSleeper';
import { KTCRankings, ktcEntry } from '@/utils/fetchKTC';
import { udEntry } from '@/utils/fetchUD';
import { updatePlayerData } from '@/utils/updatePlayerData';
import { updatePickValues } from '@/utils/updatePickValues';


export interface PlayerEntry {
  [playerId: string]: PlayerEntryDetails;
}

interface PlayerEntryDetails {
  name: string;
  ktc_value: string;
  ud_adp: string;
  ud_projected_points: string;
  ud_position_rank: string;
  position: string;
  trending: boolean;
  ktc_position_rank: string;
}

export interface PickValues {
  pick_name: string;
  pick_value: string;
}


export async function GET() {
  try {
    const [sleeperData, ktcData, udData]: [SleeperEntry, KTCRankings, udEntry[]] = await Promise.all([
      fetchSleeperData(),
      fetchKtcRankings(),
      fetchUdRankings(),
    ]);

    const playerDataObj: PlayerEntry = Object.keys(sleeperData).reduce(
      (result: PlayerEntry, playerId: string) => {
        const sleeperPlayerEntryName: SleeperEntryName = sleeperData[playerId];

        // Find KTC entry by name match
        const ktcPlayerEntry: ktcEntry | undefined = ktcData.rankings.find(
          (entry) => entry.player === sleeperPlayerEntryName.first_name + ' ' + sleeperPlayerEntryName.last_name
        );
        // Find UD entry by name match
        const udPlayerEntry: udEntry | undefined = udData.find(
          (entry) =>
            entry.first_name === sleeperPlayerEntryName.first_name && entry.last_name === sleeperPlayerEntryName.last_name
        );

        if (ktcPlayerEntry && udPlayerEntry) {
          // Apply the correct fields
          result[playerId] = {
            name: sleeperPlayerEntryName.first_name + ' ' + sleeperPlayerEntryName.last_name,
            ktc_value: ktcPlayerEntry.value,
            ud_adp: udPlayerEntry.adp,
            ud_projected_points: udPlayerEntry.projected_points,
            ud_position_rank: udPlayerEntry.position_rank,
            position: udPlayerEntry.slot_name,  
            ktc_position_rank: ktcPlayerEntry.positionRank,
            trending: ktcData.trending.some(trending => trending.name === sleeperPlayerEntryName.first_name + ' ' + sleeperPlayerEntryName.last_name),
          };
        }

        return result;
      },
      {} as PlayerEntry
    );

    // Update the database with the new player data
    await updatePlayerData(playerDataObj);

    const  pickValues: PickValues[] = ktcData.rankings.filter(ranking => ranking.positionRank === "PICK").map(ranking => ({
      pick_name: ranking.player,
      pick_value: ranking.value,
    }));

    await updatePickValues(pickValues); 

    // Return success and the playerDataObj
    return NextResponse.json({
      success: true,
      message: 'Database updated successfully',
      playerData: playerDataObj,
      pickValues: pickValues,
    }, { status: 200 });
    } catch (error) {
        console.error('Error updating database:', error);
        return NextResponse.json({
        success: false,
        message: 'Error updating database',
        }, { status: 500 });
    }
}