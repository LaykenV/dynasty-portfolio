import PortfolioTable from '../../../components/PortfolioTable';

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
      console.log('avatar', avatar);
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
          roster: []
        };
      }));
    }

    if (userData.userLeagues.length > 0) {
      userData.userLeagues = userData.userLeagues.filter((league: UserLeagues) => league.leagueSettings.rosterPositions.length > 18);
      console.log('Filtered leagues:', userData.userLeagues);

      await Promise.all(userData.userLeagues.map(async (league: UserLeagues) => {
        try {
          const rosterResponse = await fetch(`https://api.sleeper.app/v1/league/${league.leagueSettings.leagueID}/rosters`);
          if (!rosterResponse.ok) {
            throw new Error('Failed to fetch Sleeper roster data');
          }
          const rosterData = await rosterResponse.json();
          let roster: string[] = [];
          rosterData.forEach((rosterDataEntry: rosterResponse) => {
            if (rosterDataEntry.owner_id === userData.userID) {
              roster = [...rosterDataEntry.starters, ...rosterDataEntry.players];
            }
          });
          league.roster = roster;
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

    console.log('sleeper user data', sleeperUserData);
    console.log('sleeper league data', sleeperLeagueData);
    console.log('player data', playerData);
    console.log('user data', userData);

    // team grade calc
  
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1>User Dashboard: {username}</h1>
        <PortfolioTable userData={userData} playerData={playerDataArray} pickValues={pickValuesArray}></PortfolioTable>
      </main>
    );
  };
  
  export default Dashboard;