"use client"

import { UserData, PlayerDataEntry, PickValuesEntry } from "@/app/dashboard/[username]/page";
import { log } from "console";
import Image from "next/image";

interface PortfolioTableProps {
    userData: UserData
    playerData: PlayerDataEntry[]
    pickValues: PickValuesEntry[]
};

const PortfolioTable: React.FC<PortfolioTableProps> = ({userData, playerData, pickValues}) => {
    console.log('playerData', playerData);
    console.log('pickValues', pickValues);
    console.log('userData', userData); 
    let filteredPlayerData = playerData.filter((player) => player.rosterPercentage > 0);
    let sortedPlayerData = filteredPlayerData.sort((a, b) => b.rosterPercentage - a.rosterPercentage);

    // table with pagination in rosterPercentage descending order 
    // show rosterPercentage, playerName, playerTeam, playerPosition, playerValue, trending?, owned in leagues
    
    const howManyLeagues = (playerId: string) => {
        let leagueAvatars: string[] = [];
        userData.userLeagues.forEach((league) => {
            if (league.roster.includes(playerId)) {
                console.log('leagueavatar', league.leagueSettings.avatar);
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
                    <h2>{player.name}</h2>
                    <h3>{howManyLeagues(player.player_id).map((avatar) =>  avatar ? <Image key={avatar} src={avatar} alt="league avatar" width={20} height={20} /> : null)}</h3>
                </div>
            ))}
        </div>
    )
}

export default PortfolioTable;