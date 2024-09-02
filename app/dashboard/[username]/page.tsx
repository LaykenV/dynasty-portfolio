import PortfolioTable from '../../../components/PortfolioTable';
import TeamBreakdown from '../../../components/TeamBreakdown';

export interface UserLeagueSettings {
  leagueID: string;
  name: string;
  leagueSize: number;
  avatar: string;
  rosterPositions: string[];
  teamGrade: number;
}

export interface UserLeagues {
  leagueSettings: UserLeagueSettings;
  roster: string[];
  picks: string[];
}

export interface UserData {
  userLeagues: UserLeagues[];
  userName: string;
  userID: string;
  avatar: string;
  displayName: string;
}

interface rosterResponse {
  starters: string[];
  players: string[];
  owner_id: string;
}

export interface PlayerDataEntry {
  player_id: string;
  rosterPercentage: number;
  name: string;
  position: string;
  team: string;
  ktc_value: string;
  ud_adp: string;
  ud_projected_points: string;
  ud_position_rank: string;
  trending: boolean;
  ktc_position_rank: string;
  avatarUrl: string;
}

export interface PickValuesEntry {
  pick_name: string;
  pick_value: string;
}

export interface Pick {
  season: number;
  round: number;
}


const Dashboard = async ({ params }: { params: { username: string } }) => {
    const { username } = params;
  
    // Step 1: Fetch initial Sleeper user data
    const sleeperUserResponse = await fetch(`https://api.sleeper.app/v1/user/${username}`);
    if (!sleeperUserResponse.ok) {
      throw new Error('Failed to fetch Sleeper user data');
    }
    const sleeperUserData = await sleeperUserResponse.json();

    const userData: UserData = {
      userLeagues: [],
      userName: sleeperUserData.username,
      userID: sleeperUserData.user_id,
      avatar: sleeperUserData.avatar,
      displayName: sleeperUserData.display_name,
    }

    const fetchAvatar = async (avatar: string) => {
      const avatarResponse = await fetch(`https://sleepercdn.com/avatars/thumbs/${avatar}`);
      if (!avatarResponse.ok) {
        throw new Error('Failed to fetch avatar');
      }
      return avatarResponse.url;
    }

    const sleeperLeagueResponse = await fetch(`https://api.sleeper.app/v1/user/${sleeperUserData.user_id}/leagues/nfl/2024`);
    if (!sleeperLeagueResponse.ok) {
      throw new Error('Failed to fetch Sleeper league data');
    }
    const sleeperLeagueData = await sleeperLeagueResponse.json();
    

    if (!Array.isArray(sleeperLeagueData) || sleeperLeagueData.length === 0) {
      console.warn('No leagues found for the user');
      userData.userLeagues = [];
    } else {  
      userData.userLeagues = await Promise.all(sleeperLeagueData.map(async (league: any) => {
        let avatarUrl = '';
        if (league.avatar !== null) {
          avatarUrl = await fetchAvatar(league.avatar);
        }
        return {
          leagueSettings: {
            leagueID: league.league_id,
            name: league.name,
            leagueSize: league.total_rosters,
            avatar: league.avatar ? avatarUrl : '',
            rosterPositions: league.roster_positions,
            teamGrade: 0,
          },
          roster: [],
          picks: []
        };
      }));
    }

    const getUserPick = (tradedAwayPicks: Pick[], acquiredPicks: Pick[]): string[] => {
      console.log('tradedAwayPicks', tradedAwayPicks);
      console.log('acquiredPicks', acquiredPicks);
      // Default picks
      const defaultPicks: Pick[] = [
        { season: 2025, round: 1 },
        { season: 2025, round: 2 },
        { season: 2025, round: 3 },
        { season: 2025, round: 4 },
        { season: 2026, round: 1 },
        { season: 2026, round: 2 },
        { season: 2026, round: 3 },
        { season: 2026, round: 4 },
        { season: 2027, round: 1 },
        { season: 2027, round: 2 },
        { season: 2027, round: 3 },
        { season: 2027, round: 4 }
      ];
    
      // Remove traded away picks
      const remainingPicks = defaultPicks.filter(
        (pick) => !tradedAwayPicks.some(
          (traded) => traded.season === pick.season && traded.round === pick.round
        )
      );
    
      // Add acquired picks
      const adjustedPicks = [...remainingPicks, ...acquiredPicks];
    
      // Sort picks by season and round for consistent output
      adjustedPicks.sort((a, b) => {
        if (a.season !== b.season) {
          return a.season - b.season;
        }
        return a.round - b.round;
      });
    
      // Convert to string format 'YYYY Xst'
      const pickStrings = adjustedPicks.map(pick => `${pick.season} ${ordinalRound(pick.round)}`);

      console.log('pickStrings', pickStrings);
      return pickStrings;
    }

    // Helper function to convert round number to ordinal format (1 -> '1st', 2 -> '2nd', etc.)
    const ordinalRound = (round: number): string => {
      const suffixes = ["th", "st", "nd", "rd"];
      const v = round % 100;
      return round + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    }

    if (userData.userLeagues.length > 0) {
      userData.userLeagues = userData.userLeagues.filter((league: UserLeagues) => league.leagueSettings.rosterPositions.length > 18);

      await Promise.all(userData.userLeagues.map(async (league: UserLeagues) => {
        try {
          const rosterResponse = await fetch(`https://api.sleeper.app/v1/league/${league.leagueSettings.leagueID}/rosters`);
          const tradedPicksResponse = await fetch(`https://api.sleeper.app/v1/league/${league.leagueSettings.leagueID}/traded_picks`);
          if (!rosterResponse.ok || !tradedPicksResponse.ok) {
            throw new Error('Failed to fetch Sleeper roster data');
          }

          const rosterData = await rosterResponse.json();
          const tradedPicksData = await tradedPicksResponse.json();

          let acquiredPicks: Pick[] = [];
          let tradedAwayPicks: Pick[] = [];
          const myRoster = rosterData.find((rosterDataEntry: rosterResponse) => rosterDataEntry.owner_id === userData.userID);

          tradedPicksData.forEach((tradedPickDataEntry: any) => {
            if (parseInt(tradedPickDataEntry.season) > 2024) {
              if (tradedPickDataEntry.owner_id === myRoster.roster_id) {
                acquiredPicks.push( {season: parseInt(tradedPickDataEntry.season), round: tradedPickDataEntry.round});
              }
              if (tradedPickDataEntry.previous_owner_id === myRoster.roster_id) {
                tradedAwayPicks.push( {season: parseInt(tradedPickDataEntry.season), round: tradedPickDataEntry.round});
              }
            }
          });

          league.roster = myRoster.players;
          console.log('calculating picks for', league.leagueSettings.leagueID);
          league.picks = getUserPick(tradedAwayPicks, acquiredPicks);
        } catch (error) {
          console.error(`Error fetching roster for league ${league.leagueSettings.leagueID}:`, error);
          league.roster = [];
        }
      }));
    }

    const playerDataResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/PlayerData`);
  
    if (!playerDataResponse.ok) {
      throw new Error('Failed to fetch Sleeper player data');
    }
  
    const playerData = await playerDataResponse.json();
    const playerDataArray: PlayerDataEntry[] = playerData.playerData;
    const pickValuesArray: PickValuesEntry[] = playerData.pickValues;

    let filteredPickValuesArray: PickValuesEntry[] = [];

    pickValuesArray.forEach((pickValue: PickValuesEntry) => {
      if (pickValue.pick_name.includes('Mid')) {
        const newPickName = pickValue.pick_name.replace('Mid ', '');
        filteredPickValuesArray.push({
          pick_name: newPickName,
          pick_value: pickValue.pick_value,
        });
      }
    }); 

    // Calculate roster percentage for each player
    playerDataArray.forEach((player: PlayerDataEntry) => {
      let rostersCount = 0;
      userData.userLeagues.forEach((league: any) => {
        if (league.roster.includes(player.player_id)) {
          rostersCount++;
        }
      });
      player.rosterPercentage = (rostersCount / userData.userLeagues.length) * 100;
      player.avatarUrl = `https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`;
    });

    // team grade calc
  
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1>User Dashboard: {username}</h1>
        <PortfolioTable userData={userData} playerData={playerDataArray} pickValues={filteredPickValuesArray}></PortfolioTable>
        <TeamBreakdown userData={userData} playerData={playerDataArray} pickValues={filteredPickValuesArray}></TeamBreakdown>
      </main>
    );
  };
  
  export default Dashboard;