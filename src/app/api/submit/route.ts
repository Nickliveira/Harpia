import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const answers: Record<string, string | string[]> = body.answers;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Respostas inválidas" },
        { status: 400 }
      );
    }

    const sql = getDb();

    const toText = (id: number) => (answers[id] as string) || null;
    const toArray = (id: number) => {
      const val = answers[id];
      return Array.isArray(val) && val.length > 0 ? val : null;
    };

    await sql`
      INSERT INTO survey_responses (
        q1_area_atuacao,
        q2_porte_empresa,
        q3_maturidade_seguranca,
        q4_falsos_positivos,
        q5_atraso_entregas,
        q6_maior_gargalo,
        q7_ferramentas_seguranca,
        q8_impacto_agente,
        q9_confianca_ia,
        q10_funcionalidades,
        q11_disposicao_uso,
        q12_modelo_precificacao,
        q13_email
      ) VALUES (
        ${toText(1)},
        ${toText(2)},
        ${toText(3)},
        ${toText(4)},
        ${toText(5)},
        ${toArray(6)},
        ${toArray(7)},
        ${toText(8)},
        ${toText(9)},
        ${toArray(10)},
        ${toText(11)},
        ${toText(12)},
        ${toText(13)}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving survey response:", error);
    return NextResponse.json(
      { error: "Erro ao salvar resposta" },
      { status: 500 }
    );
  }
}
