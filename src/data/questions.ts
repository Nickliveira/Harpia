export interface Question {
  id: number;
  text: string;
  description?: string;
  section?: string;
  type: "single" | "multiple" | "scale" | "email";
  required: boolean;
  options: string[];
  scaleLabels?: { low: string; high: string };
}

export const questions: Question[] = [
  // ── SEÇÃO 1 — Perfil do Respondente ──
  {
    id: 1,
    section: "Perfil do Respondente",
    text: "Qual é a sua principal área de atuação?",
    type: "single",
    required: true,
    options: [
      "Desenvolvimento de Software (Dev)",
      "Segurança da Informação (SecOps/AppSec)",
      "Operações / DevOps / SRE",
      "Liderança Técnica (Tech Lead / Arquiteto)",
      "Gestão de TI (CTO / Gerente / Coordenador)",
      "Outro",
    ],
  },
  {
    id: 2,
    section: "Perfil do Respondente",
    text: "Qual é o porte da empresa onde você atua?",
    type: "single",
    required: true,
    options: [
      "Startup (até 50 colaboradores)",
      "Empresa de médio porte (51–500 colaboradores)",
      "Grande empresa (501–5.000 colaboradores)",
      "Corporação (mais de 5.000 colaboradores)",
    ],
  },
  {
    id: 3,
    section: "Perfil do Respondente",
    text: "Como você avalia a maturidade da segurança integrada à esteira CI/CD da sua empresa?",
    type: "scale",
    required: true,
    options: ["1", "2", "3", "4", "5"],
    scaleLabels: {
      low: "Inexistente ou totalmente manual",
      high: "DevSecOps maduro e automatizado",
    },
  },

  // ── SEÇÃO 2 — Dores e Problemas Atuais ──
  {
    id: 4,
    section: "Dores e Problemas",
    text: "Com que frequência os alertas de segurança da sua esteira CI/CD geram falsos positivos ou ruído operacional que a equipe acaba ignorando?",
    type: "scale",
    required: true,
    options: ["1", "2", "3", "4", "5"],
    scaleLabels: { low: "Nunca", high: "Constantemente" },
  },
  {
    id: 5,
    section: "Dores e Problemas",
    text: "O processo atual de triagem e correção de vulnerabilidades atrasa o ritmo das entregas ágeis da sua equipe?",
    type: "single",
    required: true,
    options: [
      "Sim, atrasa significativamente",
      "Sim, mas de forma tolerável",
      "Raramente interfere",
      "Não atrasa",
    ],
  },
  {
    id: 6,
    section: "Dores e Problemas",
    text: "Qual é o maior gargalo ao lidar com vulnerabilidades apontadas pelas ferramentas tradicionais (SAST/DAST/SCA)?",
    description: "Selecione até 2 opções.",
    type: "multiple",
    required: true,
    options: [
      "Volume excessivo de alertas sem priorização clara",
      "Falta de contexto sobre o impacto real no negócio",
      "Demora na triagem e definição de responsáveis",
      "Dificuldade em sugerir ou implementar correções",
      "Integração precária entre as ferramentas",
    ],
  },
  {
    id: 7,
    section: "Dores e Problemas",
    text: "Quais ferramentas de segurança sua empresa já utiliza nas esteiras CI/CD?",
    description: "Selecione todas que se aplicam.",
    type: "multiple",
    required: true,
    options: [
      "SAST (ex: SonarQube, Semgrep, Checkmarx)",
      "DAST (ex: OWASP ZAP, Burp Suite)",
      "SCA / Dependências (ex: Snyk, Dependabot, OWASP Dependency-Check)",
      "CSPM / Infraestrutura (ex: Checkov, Trivy)",
      "Não utilizamos nenhuma ferramenta de segurança automatizada",
      "Outro",
    ],
  },

  // ── SEÇÃO 3 — Avaliação da Solução Proposta ──
  {
    id: 8,
    section: "Avaliação da Solução",
    text: "Qual seria o impacto na sua rotina se, em vez de apenas listar vulnerabilidades, um Agente Inteligente priorizasse automaticamente os riscos com base no contexto do seu código e explicasse o impacto real de cada um para o negócio?",
    type: "scale",
    required: true,
    options: ["1", "2", "3", "4", "5"],
    scaleLabels: {
      low: "Nenhum impacto, já conseguimos fazer isso",
      high: "Revolucionaria nosso processo",
    },
  },
  {
    id: 9,
    section: "Avaliação da Solução",
    text: "Você confiaria em uma IA que adapta e orquestra automaticamente os testes de segurança na esteira (priorizando ou pulando testes com base no contexto do código) para acelerar o build?",
    type: "single",
    required: true,
    options: [
      "Sim, confiaria completamente desde o início",
      "Sim, mas com supervisão humana nas primeiras execuções",
      "Talvez, dependendo de evidências e métricas comprovadas",
      "Não confiaria, prefiro controle manual",
    ],
  },
  {
    id: 10,
    section: "Avaliação da Solução",
    text: "Quais funcionalidades você consideraria mais valiosas em uma plataforma assim?",
    description: "Selecione até 3 opções.",
    type: "multiple",
    required: true,
    options: [
      "Priorização automática de vulnerabilidades por criticidade e contexto",
      "Correlação do risco com impacto direto no negócio",
      "Dashboard de maturidade de segurança do projeto",
      "Orquestração dinâmica dos testes (skip inteligente)",
      "Relatórios de conformidade (LGPD, ISO 27001, OWASP Top 10)",
    ],
  },

  // ── SEÇÃO 4 — Intenção e Viabilidade ──
  {
    id: 11,
    section: "Intenção e Viabilidade",
    text: "Se uma plataforma resolvesse exatamente esses gargalos de ruído e lentidão, você estaria disposto a utilizá-la ou recomendá-la para a sua empresa?",
    type: "single",
    required: true,
    options: [
      "Sim, com certeza",
      "Provavelmente sim",
      "Precisaria avaliar mais antes de decidir",
      "Provavelmente não",
    ],
  },
  {
    id: 12,
    section: "Intenção e Viabilidade",
    text: "Qual modelo de acesso/precificação seria mais adequado para sua realidade?",
    type: "single",
    required: true,
    options: [
      "SaaS com assinatura mensal por número de pipelines",
      "SaaS com assinatura por número de usuários",
      "Solução on-premise (instalada na infraestrutura da empresa)",
      "Modelo freemium com plano pago para recursos avançados",
    ],
  },
  {
    id: 13,
    section: "Intenção e Viabilidade",
    text: "Gostaria de ter acesso antecipado ao MVP e participar dos testes?",
    description:
      "Opcional — deixe seu e-mail para ter acesso antecipado.",
    type: "email",
    required: false,
    options: [],
  },
];

export const formConfig = {
  title: "Segurança inteligente\nem pipelines CI/CD",
  subtitle: "powered by",
  description:
    "Estamos pesquisando como agentes inteligentes podem eliminar o ruído de ferramentas de segurança e acelerar entregas. Sua visão é essencial — leva menos de 3 minutos.",
  successTitle: "Resposta registrada.",
  successMessage:
    "Obrigado por contribuir com esta pesquisa. Cada resposta nos aproxima de uma esteira DevSecOps mais inteligente e menos ruidosa.",
};
