"use client"

import { UserData, PlayerDataEntry, PickValuesEntry } from "@/app/dashboard/[username]/page";
import Image from "next/image";

interface PortfolioTableProps {
    userData: UserData
    playerData: PlayerDataEntry[]
    pickValues: PickValuesEntry[]
};

const PortfolioTable: React.FC<PortfolioTableProps> = ({userData, playerData, pickValues}) => {
    let filteredPlayerData = playerData.filter((player) => player.rosterPercentage > 0);
    let sortedPlayerData = filteredPlayerData.sort((a, b) => b.rosterPercentage - a.rosterPercentage);
    const backupAvatar = 'https://sleepercdn.com/landing/web2021/img/sleeper-app-logo-2.png';

    console.log(pickValues);

    // table with pagination in rosterPercentage descending order 
    // show rosterPercentage, playerName, playerTeam, playerPosition, playerValue, trending?, owned in leagues
    
    const howManyLeagues = (playerId: string) => {
        let leagueAvatars: string[] = [];
        userData.userLeagues.forEach((league) => {
            if (league.roster.includes(playerId)) {
                leagueAvatars.push(league.leagueSettings.avatar);
            }
        });
        return leagueAvatars;
    };
    
    return(
        <div className="flex flex-col items-center justify-center max-w-screen-lg">
            {sortedPlayerData.map((player) => (
                <div key={player.name} className="flex flex-row items-center justify-center">
                    <h1>{player.rosterPercentage}</h1>
                    <Image src={player.avatarUrl} alt="team logo" width={100} height={0} style={{ height: 'auto', width: 'auto' }}/>
                    <h2>{player.name}</h2>
                    {player.trending && <h3>Trending</h3>}  
                    <h3>{howManyLeagues(player.player_id).map((avatar, index) => <Image key={index} src={avatar ? avatar : backupAvatar} alt="league avatar" width={40} height={40}/>)}</h3>
                </div>
            ))}
        </div>
    )
}

export default PortfolioTable;


