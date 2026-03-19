"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

/* ── Types ── */
interface SurveyResponse {
  id: number;
  q1_area_atuacao: string | null;
  q2_porte_empresa: string | null;
  q3_maturidade_seguranca: string | null;
  q4_falsos_positivos: string | null;
  q5_atraso_entregas: string | null;
  q6_maior_gargalo: string[] | null;
  q7_ferramentas_seguranca: string[] | null;
  q8_impacto_agente: string | null;
  q9_confianca_ia: string | null;
  q10_funcionalidades: string[] | null;
  q11_disposicao_uso: string | null;
  q12_modelo_precificacao: string | null;
  q13_email: string | null;
  created_at: string;
}

interface ApiData {
  totalResponses: number;
  responses: SurveyResponse[];
}

/* ── Colors ── */
const COLORS = [
  "#5E6AD2",
  "#7C85E2",
  "#45d483",
  "#F5A623",
  "#E05252",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#F97316",
  "#14B8A6",
];

const ACCENT = "#5E6AD2";

/* ── Helpers ── */
function countField(responses: SurveyResponse[], field: keyof SurveyResponse) {
  const counts: Record<string, number> = {};
  for (const r of responses) {
    const val = r[field];
    if (!val) continue;
    if (Array.isArray(val)) {
      for (const item of val) {
        counts[item] = (counts[item] || 0) + 1;
      }
    } else {
      counts[val as string] = (counts[val as string] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function scaleAvg(responses: SurveyResponse[], field: keyof SurveyResponse) {
  let sum = 0;
  let count = 0;
  for (const r of responses) {
    const val = r[field];
    if (val) {
      sum += parseInt(val as string, 10);
      count++;
    }
  }
  return count > 0 ? (sum / count).toFixed(1) : "—";
}

function scaleDist(responses: SurveyResponse[], field: keyof SurveyResponse) {
  const dist: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  for (const r of responses) {
    const val = r[field] as string;
    if (val && dist[val] !== undefined) dist[val]++;
  }
  return Object.entries(dist).map(([name, value]) => ({ name, value }));
}

function truncateLabel(text: string, max = 30) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

/* ── Chart components ── */
function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 ${className}`}
    >
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[12px] text-[var(--text-tertiary)] mb-4">
          {subtitle}
        </p>
      )}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 flex flex-col">
      <span className="text-[12px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider mb-2">
        {label}
      </span>
      <span className="text-[32px] sm:text-[40px] font-bold tracking-tight text-[var(--text-primary)] leading-none">
        {value}
      </span>
      {sub && (
        <span className="text-[12px] text-[var(--text-tertiary)] mt-1.5">
          {sub}
        </span>
      )}
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[12px] text-[var(--text-secondary)] mb-0.5">{label}</p>
      <p className="text-[14px] font-semibold text-[var(--text-primary)]">
        {payload[0].value} respostas
      </p>
    </div>
  );
};

/* ── Main Component ── */
export default function AnalyticsDashboard() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao carregar dados");
        return r.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const charts = useMemo(() => {
    if (!data) return null;
    const r = data.responses;
    return {
      areaAtuacao: countField(r, "q1_area_atuacao"),
      porteEmpresa: countField(r, "q2_porte_empresa"),
      maturidadeDist: scaleDist(r, "q3_maturidade_seguranca"),
      maturidadeAvg: scaleAvg(r, "q3_maturidade_seguranca"),
      falsosPositivosDist: scaleDist(r, "q4_falsos_positivos"),
      falsosPositivosAvg: scaleAvg(r, "q4_falsos_positivos"),
      atrasoEntregas: countField(r, "q5_atraso_entregas"),
      maiorGargalo: countField(r, "q6_maior_gargalo"),
      ferramentas: countField(r, "q7_ferramentas_seguranca"),
      impactoDist: scaleDist(r, "q8_impacto_agente"),
      impactoAvg: scaleAvg(r, "q8_impacto_agente"),
      confiancaIA: countField(r, "q9_confianca_ia"),
      funcionalidades: countField(r, "q10_funcionalidades"),
      disposicaoUso: countField(r, "q11_disposicao_uso"),
      modeloPreco: countField(r, "q12_modelo_precificacao"),
      emailsCount: r.filter((x) => x.q13_email).length,
      radarData: [
        { metric: "Maturidade", value: parseFloat(scaleAvg(r, "q3_maturidade_seguranca")) || 0 },
        { metric: "Falsos Positivos", value: parseFloat(scaleAvg(r, "q4_falsos_positivos")) || 0 },
        { metric: "Impacto Agente", value: parseFloat(scaleAvg(r, "q8_impacto_agente")) || 0 },
      ],
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] text-[var(--text-tertiary)]">
            Carregando dados…
          </span>
        </div>
      </div>
    );
  }

  if (error || !data || !charts) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[16px] text-[var(--text-primary)] mb-2">
            Erro ao carregar analytics
          </p>
          <p className="text-[13px] text-[var(--text-tertiary)]">
            {error || "Sem dados disponíveis"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      <div className="bg-atmosphere" />
      <div className="bg-grid" />

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/harpia-logo.svg"
              alt="Harpia"
              width={32}
              height={32}
              className="rounded-md"
            />
            <div className="w-px h-4 bg-[var(--border-subtle)]" />
            <span className="text-[13px] font-semibold text-[var(--text-primary)]">
              Analytics
            </span>
          </div>
          <a
            href="/"
            className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            ← Voltar ao formulário
          </a>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-[24px] sm:text-[32px] font-bold tracking-[-0.03em] text-[var(--text-primary)] mb-1">
            Dashboard de Respostas
          </h1>
          <p className="text-[14px] text-[var(--text-tertiary)]">
            Segurança Inteligente em Pipelines CI/CD — Pesquisa TCC
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <StatCard
            label="Total de Respostas"
            value={data.totalResponses}
          />
          <StatCard
            label="Maturidade Média"
            value={charts.maturidadeAvg}
            sub="Escala 1–5"
          />
          <StatCard
            label="Ruído Médio"
            value={charts.falsosPositivosAvg}
            sub="Falsos positivos (1–5)"
          />
          <StatCard
            label="E-mails coletados"
            value={charts.emailsCount}
            sub="Interessados no MVP"
          />
        </div>

        {/* ── Section 1: Perfil ── */}
        <SectionTitle title="Seção 1 — Perfil do Respondente" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <ChartCard
            title="Q1 — Área de Atuação"
            subtitle="Distribuição dos respondentes por área"
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.areaAtuacao}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    strokeWidth={0}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${truncateLabel(name || "", 20)} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {charts.areaAtuacao.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Q2 — Porte da Empresa"
            subtitle="Distribuição por tamanho de empresa"
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.porteEmpresa} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "#8b8b9e", fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={180}
                    tick={{ fill: "#8b8b9e", fontSize: 11 }}
                    tickFormatter={(v) => truncateLabel(v, 28)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={ACCENT} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <ChartCard
          title="Q3 — Maturidade DevSecOps"
          subtitle={`Média: ${charts.maturidadeAvg} / 5 — 1 = Inexistente, 5 = Maduro e automatizado`}
          className="mb-8"
        >
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.maturidadeDist}>
                <XAxis dataKey="name" tick={{ fill: "#8b8b9e", fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#8b8b9e", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={ACCENT} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* ── Section 2: Dores ── */}
        <SectionTitle title="Seção 2 — Dores e Problemas Atuais" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <ChartCard
            title="Q4 — Falsos Positivos / Ruído"
            subtitle={`Média: ${charts.falsosPositivosAvg} / 5 — 1 = Nunca, 5 = Constantemente`}
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.falsosPositivosDist}>
                  <XAxis dataKey="name" tick={{ fill: "#8b8b9e", fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#8b8b9e", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#F5A623" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Q5 — Atraso nas Entregas"
            subtitle="Impacto da triagem de vulnerabilidades"
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.atrasoEntregas}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    strokeWidth={0}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${truncateLabel(name || "", 18)} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {charts.atrasoEntregas.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <ChartCard
            title="Q6 — Maior Gargalo"
            subtitle="Múltipla escolha — até 2 opções"
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.maiorGargalo} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "#8b8b9e", fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={200}
                    tick={{ fill: "#8b8b9e", fontSize: 10 }}
                    tickFormatter={(v) => truncateLabel(v, 35)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#E05252" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Q7 — Ferramentas Utilizadas"
            subtitle="Múltipla escolha"
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.ferramentas} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "#8b8b9e", fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={200}
                    tick={{ fill: "#8b8b9e", fontSize: 10 }}
                    tickFormatter={(v) => truncateLabel(v, 35)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#06B6D4" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* ── Section 3: Avaliação da Solução ── */}
        <SectionTitle title="Seção 3 — Avaliação da Solução Proposta" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <ChartCard
            title="Q8 — Impacto do Agente Inteligente"
            subtitle={`Média: ${charts.impactoAvg} / 5 — 1 = Nenhum, 5 = Revolucionário`}
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.impactoDist}>
                  <XAxis dataKey="name" tick={{ fill: "#8b8b9e", fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#8b8b9e", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#45d483" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Q9 — Confiança na IA"
            subtitle="Orquestração automática de testes"
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.confiancaIA}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    strokeWidth={0}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${truncateLabel(name || "", 18)} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {charts.confiancaIA.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <ChartCard
          title="Q10 — Funcionalidades Mais Valiosas"
          subtitle="Múltipla escolha — até 3 opções"
          className="mb-8"
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.funcionalidades} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fill: "#8b8b9e", fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={260}
                  tick={{ fill: "#8b8b9e", fontSize: 10 }}
                  tickFormatter={(v) => truncateLabel(v, 45)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* ── Section 4: Intenção ── */}
        <SectionTitle title="Seção 4 — Intenção e Viabilidade" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <ChartCard
            title="Q11 — Disposição de Uso"
            subtitle="Utilizaria ou recomendaria a plataforma?"
          >
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.disposicaoUso}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    strokeWidth={0}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${truncateLabel(name || "", 22)} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {charts.disposicaoUso.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Q12 — Modelo de Precificação"
            subtitle="Preferência de acesso/cobrança"
          >
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.modeloPreco} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "#8b8b9e", fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={200}
                    tick={{ fill: "#8b8b9e", fontSize: 10 }}
                    tickFormatter={(v) => truncateLabel(v, 35)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#EC4899" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* ── Radar Overview ── */}
        <ChartCard
          title="Visão Geral — Médias das Escalas"
          subtitle="Radar comparativo das 3 perguntas em escala 1–5"
          className="mb-8"
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={charts.radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "#8b8b9e", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  domain={[0, 5]}
                  tick={{ fill: "#4e4e5c", fontSize: 10 }}
                />
                <Radar
                  dataKey="value"
                  stroke={ACCENT}
                  fill={ACCENT}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* ── Response table ── */}
        <ChartCard
          title="Respostas Recentes"
          subtitle={`Mostrando as últimas ${Math.min(data.responses.length, 20)} respostas`}
          className="mb-8 overflow-x-auto"
        >
          <div className="min-w-[600px]">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-2 text-[var(--text-tertiary)] font-medium">
                    #
                  </th>
                  <th className="text-left py-2 px-2 text-[var(--text-tertiary)] font-medium">
                    Área
                  </th>
                  <th className="text-left py-2 px-2 text-[var(--text-tertiary)] font-medium">
                    Porte
                  </th>
                  <th className="text-center py-2 px-2 text-[var(--text-tertiary)] font-medium">
                    Maturidade
                  </th>
                  <th className="text-center py-2 px-2 text-[var(--text-tertiary)] font-medium">
                    Impacto
                  </th>
                  <th className="text-left py-2 px-2 text-[var(--text-tertiary)] font-medium">
                    Disposição
                  </th>
                  <th className="text-left py-2 px-2 text-[var(--text-tertiary)] font-medium">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.responses.slice(0, 20).map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <td className="py-2.5 px-2 text-[var(--text-tertiary)]">
                      {i + 1}
                    </td>
                    <td className="py-2.5 px-2 text-[var(--text-secondary)]">
                      {truncateLabel(r.q1_area_atuacao || "—", 25)}
                    </td>
                    <td className="py-2.5 px-2 text-[var(--text-secondary)]">
                      {truncateLabel(r.q2_porte_empresa || "—", 20)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[var(--accent-muted)] text-[var(--text-accent)] font-semibold text-[13px]">
                        {r.q3_maturidade_seguranca || "—"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[var(--success-muted)] text-[var(--success)] font-semibold text-[13px]">
                        {r.q8_impacto_agente || "—"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-[var(--text-secondary)]">
                      {truncateLabel(r.q11_disposicao_uso || "—", 22)}
                    </td>
                    <td className="py-2.5 px-2 text-[var(--text-tertiary)]">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-4 border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2">
          <Image
            src="/harpia-logo.svg"
            alt="Harpia"
            width={20}
            height={20}
            className="rounded-sm"
          />
          <span className="text-[11px] text-[var(--text-tertiary)] font-medium lowercase">
            powered by
          </span>
          <Image
            src="/raposa_tipografia.svg"
            alt="Raposa"
            width={55}
            height={16}
            className="opacity-70"
          />
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-4">
      <h2 className="text-[16px] sm:text-[18px] font-semibold text-[var(--text-primary)] tracking-[-0.02em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--border-subtle)]" />
    </div>
  );
}
