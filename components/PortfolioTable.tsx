"use client"

import { UserData, PlayerDataEntry, PickValuesEntry } from "@/app/dashboard/[username]/page";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
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
        <div className="flex flex-col items-center justify-center w-full">
            <Table className="w-full border-2 border-gray-300 rounded-md">
                <TableHeader>
                    <TableRow>
                        <TableHead>%</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead>Dynasty Rank</TableHead>
                        <TableHead>Redraft Rank</TableHead>
                        <TableHead>Projected Points</TableHead>
                        <TableHead>Owned in Leagues</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedPlayerData.map((player) => (
                        <TableRow key={player.name}>
                            <TableCell>{player.rosterPercentage}%</TableCell>
                            <TableCell> <Image src={player.avatarUrl} alt="player avatar" width={70} height={0} style={{ height: 'auto', width: 'auto' }}/> {player.name}</TableCell>
                            <TableCell>{player.position}{player.ktc_position_rank}</TableCell>
                            <TableCell>{player.ud_position_rank}</TableCell>
                            <TableCell>{player.ud_projected_points}</TableCell>
                            <TableCell className="flex flex-row items-center justify-center gap-7">{howManyLeagues(player.player_id).map((avatar, index) => <Image key={index} src={avatar ? avatar : backupAvatar} alt="league avatar" width={40} height={40}/>)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default PortfolioTable;


