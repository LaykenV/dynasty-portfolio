import { pgTable, text, numeric, integer, boolean } from 'drizzle-orm/pg-core';

export const playerData = pgTable('player_data', {
  player_id: text('player_id').primaryKey(), // Player ID as the primary key
  name: text('name').notNull(), // Full name of the player
  ktc_value: text('ktc_value').notNull(), // KTC value as a string
  ud_adp: text('ud_adp').notNull(), // Underdog ADP as a string
  ud_projected_points: text('ud_projected_points').notNull(), // Underdog projected points as a string
  ud_position_rank: text('ud_position_rank').notNull(), // Underdog position rank as a string
  position: text('position').notNull(), // Player position
  trending: boolean('trending').notNull(), // Trending player
  ktc_position_rank: text('ktc_position_rank').notNull(),
});

export const pickValues = pgTable('pick_values', {
  pick_name: text('pick_name').notNull(), // Player name
  pick_value: text('pick_value').notNull(), // KTC value as a string
});

export type PlayerData = typeof playerData.$inferSelect; // This infers the type of a selected row
export type PickValues = typeof pickValues.$inferSelect; // This infers the type of a selected row