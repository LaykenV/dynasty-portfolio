import { integer, pgTable, serial, text, timestamp, uuid, numeric } from 'drizzle-orm/pg-core';

export const ktcRankings = pgTable('ktc_rankings', {
  overall_ranking: serial('overall_ranking').primaryKey(),
  player: text('player').notNull(),
  value: integer('value').notNull(),
});

export const udRankings = pgTable('ud_rankings', {
    id: uuid('id').primaryKey().defaultRandom(),  // UUID as primary key
    first_name: text('first_name').notNull(),
    last_name: text('last_name').notNull(),
    adp: numeric('adp').notNull(),  // ADP as a numeric value
    projected_points: numeric('projected_points').notNull(),
    position_rank: text('position_rank').notNull(),
    slot_name: text('slot_name').notNull(),
    team_name: text('team_name').notNull(),
    lineup_status: text('lineup_status').default(''),  // Default to empty string if not provided
    bye_week: text('bye_week').default('')  // Default to empty string if not provided
  });

export const sleeperPlayerData = pgTable('sleeper_player_data', {
    id: integer('id').notNull(),
    first_name: text('first_name').notNull(),
    last_name: text('last_name').notNull()
  });