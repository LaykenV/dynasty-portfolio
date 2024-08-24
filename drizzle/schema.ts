import { pgTable, text, numeric, integer } from 'drizzle-orm/pg-core';

export const playerData = pgTable('player_data', {
  player_id: text('player_id').primaryKey(), // Player ID as the primary key
  name: text('name').notNull(), // Full name of the player
  ktc_value: text('ktc_value').notNull(), // KTC value as a string
  ud_adp: text('ud_adp').notNull(), // Underdog ADP as a string
  ud_projected_points: text('ud_projected_points').notNull(), // Underdog projected points as a string
  ud_position_rank: text('ud_position_rank').notNull(), // Underdog position rank as a string
  position: text('position').notNull() // Player position
});

export type PlayerData = typeof playerData.$inferSelect; // This infers the type of a selected row