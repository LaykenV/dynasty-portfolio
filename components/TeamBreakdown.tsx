"use client";
import { UserData, PlayerDataEntry, PickValuesEntry } from "@/app/dashboard/[username]/page";
import Image from "next/image";

interface TeamBreakdownProps {
    userData: UserData;
    playerData: PlayerDataEntry[];
    pickValues: PickValuesEntry[];
}

const TeamBreakdown: React.FC<TeamBreakdownProps> = ({ userData, playerData, pickValues }) => {

    const splitByPosition = (roster: string[]) => {
        // Initialize an accumulator for storing players by position
        const acc: Record<string, string[]> = {};
    
        // Group players by their position
        const sortedRoster = roster.reduce((acc, player) => {
            const playerDataEntry = playerData.find((entry) => entry.player_id === player);
            const position = playerDataEntry?.position;
            if (position) {
                if (!acc[position]) {
                    acc[position] = [];
                }
                acc[position].push(player);
            }
            return acc;
        }, {} as Record<string, string[]>);
    
        // Sort each position array by ud_position_rank (extract the number from 'QB1', 'WR80', etc.)
        for (const position in sortedRoster) {
            sortedRoster[position].sort((a, b) => {
                const playerA = playerData.find((entry) => entry.player_id === a);
                const playerB = playerData.find((entry) => entry.player_id === b);
    
                // Extract the numeric rank from the 'ud_position_rank' string
                const rankA = playerA?.ud_position_rank ? parseInt(playerA.ud_position_rank.replace(/^\D+/g, '')) : Infinity;
                const rankB = playerB?.ud_position_rank ? parseInt(playerB.ud_position_rank.replace(/^\D+/g, '')) : Infinity;
    
                return rankA - rankB; // Sort in ascending order based on rank
            });
        }
    
        return sortedRoster;
    };

    const positionOrder = ["QB", "RB", "WR", "TE"];

    return (
        <div>
            {userData.userLeagues.map((league) => {
                const rosterSplitByPosition = splitByPosition(league.roster);
                
                return (
                    <div
                        key={league.leagueSettings.leagueID}
                        className="flex flex-col items-center justify-center border-2 border-gray-300 rounded-md p-4"
                    >
                        <h1>
                            {league.leagueSettings.name} {league.leagueSettings.leagueID}
                        </h1>
                        {positionOrder.map((position) => (
                            rosterSplitByPosition[position]?.length > 0 && (
                                <div key={position}>
                                    <h2>{position}</h2>
                                    {rosterSplitByPosition[position].map((player) => {
                                        const thisPlayer = playerData.find(
                                            (entry) => entry.player_id === player
                                        );
                                        console.log(thisPlayer);
                                        return (
                                            <div key={league.leagueSettings.leagueID + player}>
                                                <h2>
                                                    {thisPlayer?.name}{" "}
                                                    {thisPlayer?.ktc_value}
                                                </h2>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ))}
                        {league.picks.map((pick, index) => (
                            <div key={index}>
                                <h2>
                                    {pick}{" "}
                                    {pickValues.find(
                                        (pickValue) => pickValue.pick_name === pick
                                    )?.pick_value}
                                </h2>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>

        //avatars, split by position, sorted by ktc_value, underdog adp, team grade
    );
};

export default TeamBreakdown;