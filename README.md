# Viabilidade — Simulador de Empreendimentos

Arquivo único (`public/index.html`), sem build e sem servidor. Os dados ficam só no navegador de quem usa
(autosave no `localStorage`); nada é enviado para o Netlify.

## Publicar

**Opção A — GitHub (como nos outros projetos)**
1. Crie um repositório e envie estes arquivos pela interface web do GitHub (`public/index.html`, `netlify.toml`, `README.md`).
2. No Netlify: *Add new site → Import from Git* → escolha o repositório. Não precisa de comando de build.

**Opção B — Netlify Drop (mais rápido)**
Arraste a pasta `public` para https://app.netlify.com/drop

## Assistente de IA (Groq)
Cada pessoa cola a própria chave da Groq no ⚙️ do assistente. A chave fica salva só no navegador dela.

## Observações
- A página usa `noindex` (não aparece no Google), mas **quem tiver o link consegue abrir**. Os dados que você digita
  ficam só no seu navegador; porém o empreendimento de exemplo que já vem preenchido é visível para quem abrir o link.
- Salvar simulações e autosave são por navegador/computador: abrir em outro aparelho começa vazio.
  Para levar uma simulação, use **Config. (JSON)** para baixar e **Importar JSON** para carregar.
