// POST /api/ia — ponte entre o assistente do simulador e a Groq.
// A chave fica na variável de ambiente GROQ_API_KEY (Netlify → Site configuration → Environment variables)
// e NUNCA vai para o navegador.

const MODELO = "openai/gpt-oss-120b"; // fixo aqui: o navegador não escolhe o modelo
const LIMITE_BODY = 60_000;           // bytes
const MAX_MENSAGENS = 30;
const MAX_TOOLS = 15;
const JANELA_MS = 60_000;
const MAX_REQ_POR_JANELA = 20;        // por IP, por minuto (vale por instância da função: proteção "de boa-fé")

const historico = new Map();

const json = (corpo, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

function estourouLimite(ip) {
  const agora = Date.now();
  const recentes = (historico.get(ip) || []).filter((t) => agora - t < JANELA_MS);
  recentes.push(agora);
  historico.set(ip, recentes);
  if (historico.size > 500) for (const [k, v] of historico) if (!v.some((t) => agora - t < JANELA_MS)) historico.delete(k);
  return recentes.length > MAX_REQ_POR_JANELA;
}

export default async (req, context) => {
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  // só aceita chamadas feitas pela própria página do simulador (bloqueia outros sites e curl simples)
  let mesmaOrigem = false;
  try {
    const origem = req.headers.get("origin");
    mesmaOrigem = !!origem && new URL(origem).host === new URL(req.url).host;
  } catch {}
  if (!mesmaOrigem) return json({ error: "Origem não permitida." }, 403);

  const chave = process.env.GROQ_API_KEY;
  if (!chave) return json({ error: "GROQ_API_KEY não está configurada no Netlify (Environment variables)." }, 500);

  const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "desconhecido";
  if (estourouLimite(ip)) return json({ error: "Muitas mensagens em pouco tempo. Aguarde um minuto." }, 429);

  const texto = await req.text();
  if (texto.length > LIMITE_BODY) return json({ error: "Conversa grande demais." }, 413);

  let corpo;
  try {
    corpo = JSON.parse(texto);
  } catch {
    return json({ error: "Requisição inválida." }, 400);
  }
  if (!Array.isArray(corpo.messages) || corpo.messages.length === 0 || corpo.messages.length > MAX_MENSAGENS)
    return json({ error: "Mensagens inválidas." }, 400);

  const payload = {
    model: MODELO,
    messages: corpo.messages,
    temperature: Math.min(1, Math.max(0, Number(corpo.temperature) || 0.2)),
    max_completion_tokens: 4096,
  };
  if (Array.isArray(corpo.tools) && corpo.tools.length) {
    if (corpo.tools.length > MAX_TOOLS) return json({ error: "Ferramentas demais." }, 400);
    payload.tools = corpo.tools;
    payload.tool_choice = "auto";
  }

  let resp;
  try {
    resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${chave}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    return json({ error: "A Groq demorou demais para responder. Tente novamente." }, 504);
  }

  const bruto = await resp.text();
  if (!resp.ok) {
    let detalhe = "";
    try {
      detalhe = JSON.parse(bruto)?.error?.message || "";
    } catch {}
    const dica = resp.status === 401 ? " (confira a chave GROQ_API_KEY no Netlify)" : resp.status === 429 ? " (limite da Groq atingido)" : "";
    return json({ error: `Groq respondeu ${resp.status}${dica}. ${detalhe}`.trim().slice(0, 300) }, resp.status === 401 ? 502 : resp.status);
  }
  return new Response(bruto, { status: 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
};

export const config = { path: "/api/ia" };
