# Viabilidade — Simulador de Empreendimentos

Página única (`public/index.html`) + uma função do Netlify (`netlify/functions/ia.mjs`) que liga o
Assistente de IA à Groq. Os dados do simulador ficam só no navegador de quem usa (autosave no `localStorage`).

## Publicar (precisa ser pelo GitHub)
O Netlify Drop (arrastar pasta) **não publica funções**, então agora use o GitHub:
1. Crie um repositório e envie, mantendo as pastas: `public/index.html`, `netlify/functions/ia.mjs`, `netlify.toml`, `README.md`.
2. No Netlify: *Add new site → Import from Git* → escolha o repositório. Não precisa de comando de build.

## Chave da Groq (Assistente de IA)
1. Crie a chave em https://console.groq.com/keys
2. No Netlify: **Site configuration → Environment variables → Add a variable**
   - Key: `GROQ_API_KEY`
   - Value: a chave (começa com `gsk_`)
3. **Faça um novo deploy** (Deploys → Trigger deploy → Deploy site). Variável nova só vale depois disso.

A chave fica só no servidor do Netlify: não aparece no código da página nem no navegador de ninguém.

## Proteções da função `/api/ia`
- Só aceita chamadas vindas da própria página (bloqueia outros sites).
- Modelo fixo (`openai/gpt-oss-120b`); limite de tamanho da conversa e de saída; 20 mensagens/minuto por IP.
- Esse limite é "de boa-fé" (vale por instância da função). Para teto de verdade, defina limite de gasto/uso
  na sua conta da Groq e, se desconfiar de abuso, gere uma chave nova e troque no Netlify.

## Observações
- A página usa `noindex` (não aparece no Google), mas **quem tiver o link abre** e pode usar o Assistente
  (consumindo a sua cota da Groq). Compartilhe o link só com quem deve usar.
- O empreendimento de exemplo que já vem preenchido é visível para quem abrir o link.
- Simulações salvas e autosave são por navegador. Para levar a outro computador: **Config. (JSON)** e **Importar JSON**.
