"use client" 
import { UserData, PlayerDataEntry, PickValuesEntry } from "@/app/dashboard/[username]/page";
import Image from "next/image";

interface TeamBreakdownProps {
    userData: UserData
    playerData: PlayerDataEntry[]
    pickValues: PickValuesEntry[]
};

const TeamBreakdown: React.FC<TeamBreakdownProps> = ({userData, playerData, pickValues}) => {
    console.log('userData', userData);
    return (
        <div>
            {userData.userLeagues.map((league) => {
                return (
                    <div key={league.leagueSettings.leagueID} className="flex flex-col items-center justify-center border-2 border-gray-300 rounded-md p-4">
                        <h1>{league.leagueSettings.name} {league.leagueSettings.leagueID}</h1>
                        {league.roster.map((player) => {
                            const thisPlayer = playerData.find((playerDataEntry) => playerDataEntry.player_id === player);
                            return (
                                <div key={league.leagueSettings.leagueID + player}>
                                    <h2>{thisPlayer?.name} {playerData.find((playerDataEntry) => playerDataEntry.player_id === player)?.ktc_value}</h2>
                                </div>
                            )
                        })}
                        {league.picks.map((pick, index) => {
                            return (
                                <div key={index}>
                                    <h2>{pick} {pickValues.find((pickValue) => pickValue.pick_name === pick)?.pick_value}</h2>
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>

        //avatars, split by position, sorted by ktc_value, underdog adp, team grade
    )
};

export default TeamBreakdown;