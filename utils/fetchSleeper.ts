// Interface representing each player's detailed data
interface PlayerData {
    player_id: string;
    first_name: string;
    last_name: string;
    status: string;
    sport: string;
  }
  
  // Interface representing the filtered data for a player
 export interface SleeperEntryName {
    first_name: string;
    last_name: string;
  }
  
  // Interface representing the entire filtered dataset
 export interface SleeperEntry {
    [playerId: string]: SleeperEntryName;
  }
  
  // This function fetches and filters Sleeper player data
  export async function fetchSleeperData(): Promise<SleeperEntry> {
    try {
      // Fetch the data from the Sleeper API
      const response = await fetch('https://api.sleeper.app/v1/players/nfl');
      const responseJson = await response.json();
  
      // Filter the data
      const filteredData: SleeperEntry = Object.keys(responseJson).reduce(
        (result: SleeperEntry, playerId: string) => {
          const playerData: PlayerData = responseJson[playerId];
  
          // Only include players who are "Active" and in the "nfl" sport
          if (playerData.status === 'Active' && playerData.sport === 'nfl') {
            result[playerId] = {
              first_name: playerData.first_name,
              last_name: playerData.last_name,
            };
          }
  
          return result;
        },
        {} as SleeperEntry
      );
  
      return filteredData;
    } catch (error) {
      console.error('Error fetching player data:', error);
      throw new Error('Failed to fetch Sleeper player data');
    }
  }