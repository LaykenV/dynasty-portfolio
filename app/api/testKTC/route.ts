import { fetchKtcRankings } from "../../../utils/fetchKTC";
import { NextResponse } from "next/server";

export async function GET() {
    const ktcData = await fetchKtcRankings();
    return NextResponse.json(ktcData);
}

