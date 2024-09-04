"use client";

import { UserData, PlayerDataEntry, PickValuesEntry } from "@/app/dashboard/[username]/page";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface PortfolioTableProps {
    userData: UserData;
    playerData: PlayerDataEntry[];
    pickValues: PickValuesEntry[];
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ userData, playerData, pickValues }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20; // Adjust this number as needed
    const tableRef = useRef<HTMLTableElement>(null); // Target the table container

    let filteredPlayerData = playerData.filter((player) => player.rosterPercentage > 0);
    let sortedPlayerData = filteredPlayerData.sort((a, b) => b.rosterPercentage - a.rosterPercentage);

    const totalPages = Math.ceil(sortedPlayerData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentPageData = sortedPlayerData.slice(startIndex, endIndex);

    const backupAvatar = 'https://sleepercdn.com/landing/web2021/img/sleeper-app-logo-2.png';

    const howManyLeagues = (playerId: string) => {
        let leagueAvatars: string[] = [];
        userData.userLeagues.forEach((league) => {
            if (league.roster.includes(playerId)) {
                leagueAvatars.push(league.leagueSettings.avatar);
            }
        });
        return leagueAvatars;
    };

    // Scroll to top of the table whenever the page changes
    useEffect(() => {
        if (tableRef.current) {
            // Using scrollIntoView for more precise scrolling
            tableRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [currentPage]);

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <Table ref={tableRef} className="w-full border-2 border-gray-300 rounded-md border-separate">
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
                        {currentPageData.map((player) => (
                            <TableRow key={player.name}>
                                <TableCell>{player.rosterPercentage}%</TableCell>
                                <TableCell>
                                    <Image
                                        src={player.avatarUrl}
                                        alt="player avatar"
                                        width={70}
                                        height={0}
                                        style={{ height: 'auto', width: 'auto' }}
                                    /> {player.name}
                                </TableCell>
                                <TableCell>{player.position}{player.ktc_position_rank}</TableCell>
                                <TableCell>{player.ud_position_rank}</TableCell>
                                <TableCell>{player.ud_projected_points}</TableCell>
                                <TableCell className="flex flex-row items-center justify-center gap-7">
                                    {howManyLeagues(player.player_id).map((avatar, index) => (
                                        <Image
                                            key={index}
                                            src={avatar ? avatar : backupAvatar}
                                            alt="league avatar"
                                            width={40}
                                            height={40}
                                        />
                                    ))}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
            </Table>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            isActive={currentPage !== 1}
                        />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index}>
                            <PaginationLink
                                onClick={() => setCurrentPage(index + 1)}
                                isActive={currentPage === index + 1}
                                className={currentPage === index + 1 ? "border-2 border-gray-300" : ""}
                            >
                                {index + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            isActive={currentPage !== totalPages}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default PortfolioTable;