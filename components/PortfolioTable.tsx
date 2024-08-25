"use client"

import { UserData, PlayerDataEntry, PickValuesEntry } from "@/app/dashboard/[username]/page";

interface PortfolioTableProps {
    userData: UserData
    playerData: PlayerDataEntry[]
    pickValues: PickValuesEntry[]
};

const PortfolioTable: React.FC<PortfolioTableProps> = ({userData, playerData, pickValues}) => {
    console.log(playerData);
    console.log(pickValues);
    console.log(userData);
    
    
    return(
        <div>{JSON.stringify(userData.userLeagues)}BREAAK {JSON.stringify(playerData[0])} BREAK {JSON.stringify(pickValues[0])}</div>
    )
}

export default PortfolioTable;