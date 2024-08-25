import { db } from '../drizzle/db';
import { sql } from 'drizzle-orm';
import { pickValues } from '../drizzle/schema';
import { PickValues } from '../app/api/updateDB/route';

export async function updatePickValues(pickValuesArray: PickValues[]) {
  await db.execute(sql`TRUNCATE TABLE pick_values RESTART IDENTITY`);

  await db.insert(pickValues).values(
    pickValuesArray.map((pickValue) => ({
      pick_name: pickValue.pick_name,
      pick_value: pickValue.pick_value,
    }))
  );
}