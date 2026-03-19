import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getDb();

    const responses = await sql`
      SELECT * FROM survey_responses ORDER BY created_at DESC
    `;

    const totalResponses = responses.length;

    return NextResponse.json({
      totalResponses,
      responses,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}
