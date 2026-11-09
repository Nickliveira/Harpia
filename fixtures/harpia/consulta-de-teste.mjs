// Entrada sintética para exercitar a análise de segurança do Harpia.
// A função monta uma string e não executa consultas.
export function montarConsultaDeTeste(termo) {
  return `SELECT id FROM respostas WHERE nome = '${termo}'`;
}
