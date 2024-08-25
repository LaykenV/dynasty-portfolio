import { db } from '@/drizzle/db';
import { sql } from 'drizzle-orm';
import { playerData } from '@/drizzle/schema';
import { PlayerEntry } from '@/app/api/updateDB/route';


export async function updatePlayerData(playerDataObj: PlayerEntry) {
  await db.execute(sql`TRUNCATE TABLE player_data RESTART IDENTITY`);

  // Save playerDataObj to db
  await db.insert(playerData).values(
    Object.entries(playerDataObj).map(([playerId, playerData]) => ({
      player_id: playerId,
      name: playerData.name,
      ktc_value: playerData.ktc_value,
      ud_adp: playerData.ud_adp,
      ud_projected_points: playerData.ud_projected_points,
      ud_position_rank: playerData.ud_position_rank,
      position: playerData.position,
      trending: playerData.trending,
      ktc_position_rank: playerData.ktc_position_rank,
    }))
  ).onConflictDoUpdate({
    target: playerData.player_id,
    set: {
      name: sql`excluded.name`,
      ktc_value: sql`excluded.ktc_value`,
      ud_adp: sql`excluded.ud_adp`,
      ud_projected_points: sql`excluded.ud_projected_points`,
      ud_position_rank: sql`excluded.ud_position_rank`,
      position: sql`excluded.position`,
      trending: sql`excluded.trending`,
      ktc_position_rank: sql`excluded.ktc_position_rank`,
    },
  });
}