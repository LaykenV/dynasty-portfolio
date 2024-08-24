import { NextResponse } from 'next/server';
import { db } from '../../../drizzle/db';
import { sql } from 'drizzle-orm';
import { fetchSleeperData } from '@/utils/fetchSleeper';
import { fetchKtcRankings } from '@/utils/fetchKTC';
import { fetchUdRankings } from '@/utils/fetchUD';
import { ktcRankings } from '../../../drizzle/schema';
import { ktcEntry } from '@/utils/fetchKTC';
import { SleeperEntry, SleeperEntryName } from '@/utils/fetchSleeper';
import { udEntry } from '@/utils/fetchUD';
import { log } from 'console';

interface PlayerEntry {
    [playerId: string]: PlayerEntryDetails
}

interface PlayerEntryDetails {
    Name: string,
    ktcValue: string,
    udADP: number,
    udPP: number,
    udPR: string,
    position: string
}

export async function GET() {

    const [sleeperData, ktcData, udData]: [SleeperEntry, ktcEntry[], udEntry[]] = await Promise.all([
        fetchSleeperData(),
        fetchKtcRankings(),
        fetchUdRankings()
    ]);

    const playerDataObj: PlayerEntry = Object.keys(sleeperData).reduce(
        (result: PlayerEntry, playerId: string) => {
            const sleeperPlayerEntry: SleeperEntryName = sleeperData[playerId];

            // find ktc entry by name match

            // find ud entry by name match

            //apply the correct fields 


            return result;
            
    }, {} as PlayerEntry);

    //save playerDataObj to db

    //return success

    //error handling

}