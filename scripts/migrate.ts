import { neon } from "@neondatabase/serverless";

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log("Running migration...");

  await sql`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id SERIAL PRIMARY KEY,
      q1_area_atuacao TEXT,
      q2_porte_empresa TEXT,
      q3_maturidade_seguranca TEXT,
      q4_falsos_positivos TEXT,
      q5_atraso_entregas TEXT,
      q6_maior_gargalo TEXT[],
      q7_ferramentas_seguranca TEXT[],
      q8_impacto_agente TEXT,
      q9_confianca_ia TEXT,
      q10_funcionalidades TEXT[],
      q11_disposicao_uso TEXT,
      q12_modelo_precificacao TEXT,
      q13_email TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Migration completed successfully!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
