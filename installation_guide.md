# Guia de Instalação Local, Acesso Remoto e Backup por E-mail

Este guia descreve como instalar e rodar o sistema **MeuRestô** localmente na máquina dos seus clientes, como acessar a aplicação pelo celular de qualquer lugar, e como configurar o backup semanal automatizado por e-mail.

---

## 1. Como Distribuir e Instalar nos Clientes (Via Git)

A distribuição via **Git** é a melhor opção porque permite atualizar o sistema nas máquinas dos clientes facilmente com um simples `git pull` quando você fizer melhorias.

### Pré-requisitos na Máquina do Cliente (Servidora)
Antes de rodar o instalador, certifique-se de que a máquina servidora possui:
1. **Python 3.10+** (marcar a opção *"Add Python to PATH"* durante a instalação).
2. **Node.js 18+**.
3. **Git** instalado.

### Passo a Passo da Instalação:
1. **Clonar o Repositório**:
   Abra o terminal na pasta onde deseja instalar o sistema e execute:
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO_GIT> meuresto
   cd meuresto
   ```
2. **Executar o Instalador Automático**:
   Basta dar um duplo clique no arquivo **`instalar.bat`** na raiz do projeto.
   * Este script cria o ambiente virtual Python (`venv`), instala todas as dependências do backend (FastAPI, SQLite, etc.) e do frontend (React, Vite, Tailwind), e gera automaticamente o atalho **MeuRestô** na Área de Trabalho (Desktop) do Windows do cliente.

---

## 2. Inicialização Silenciosa (Acesso Direto pelo Desktop)

Para que o cliente não precise abrir terminais ou digitar comandos para iniciar a aplicação:
* O instalador cria o atalho **MeuRestô** na Área de Trabalho que aponta para o inicializador invisível **`MeuResto.vbs`**.
* Ao clicar duas vezes no ícone **MeuRestô** na Área de Trabalho:
  1. O backend e o frontend iniciam silenciosamente em background (segundo plano).
  2. O navegador de internet padrão do cliente se abre automaticamente apontando para `http://localhost:5173`.
  3. Nenhuma janela preta de terminal (Prompt de Comando) fica aberta poluindo a tela.

---

## 3. Backup de Segurança Semanal por E-mail

O sistema conta com um agendador interno que gera backups automaticamente de 7 em 7 dias a partir do momento em que o servidor é iniciado pela primeira vez.

### Segurança em Ambiente Multi-empresa (Multi-tenant):
* **Admin Master**: Recebe por e-mail um arquivo ZIP contendo a base de dados SQLite (`lira_rh.db`) completa e todos os arquivos/documentos anexados de todos os clientes.
* **Admin Delegado**: Para evitar vazamento de dados confidenciais entre empresas concorrentes, o Admin Delegado recebe um arquivo ZIP contendo um dump de dados estruturado em formato JSON contendo **apenas** as informações pertencentes ao seu respectivo grupo (funcionários, setores, cargos, finanças, fornecedores e documentos anexados dos funcionários dele).

### Como Configurar as Variáveis de E-mail (SMTP):
No diretório `backend`, crie um arquivo `.env` (ou adicione ao existente) e configure os parâmetros do servidor de e-mail que fará o disparo automático:
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-aplicativo-do-gmail
SMTP_FROM=backup@meuresto.com.br
```
* *Nota*: Caso as credenciais SMTP não estejam configuradas, o sistema continuará gerando os backups localmente na pasta `backend/backups` para garantir a integridade dos dados históricos.

---

## 4. Acesso pelo Celular de Qualquer Lugar e Modo Offline

O sistema foi desenhado de forma moderna com foco em usabilidade móvel e resiliência de rede.

### Acesso pelo Celular na Rede Local (Wi-Fi):
Se os smartphones e a máquina servidora estiverem conectados no mesmo roteador/Wi-Fi:
1. Descubra o IP local do servidor (execute `ipconfig` no terminal do Windows, ex: `192.168.1.50`).
2. No celular, digite no navegador: `http://192.168.1.50:5173`.
3. Pronto! O sistema abrirá perfeitamente otimizado para celular.

### Acesso pelo Celular de Qualquer Lugar (Fora da Rede):
Para permitir o acesso à máquina local do cliente a partir de qualquer ponto da internet de forma gratuita e rápida, você pode usar um túnel seguro como o **Ngrok** ou o **Cloudflare Tunnel**:
* **Exemplo com Ngrok**:
  1. Baixe o Ngrok no servidor do cliente.
  2. Inicie o túnel apontando para a porta do frontend:
     ```bash
     ngrok http 5173
     ```
  3. O Ngrok fornecerá uma URL pública (ex: `https://abcd-123.ngrok-free.app`). Acesse essa URL do celular de qualquer lugar do mundo!

### Como Funciona o Trabalho Offline e Sincronização Automática:
A arquitetura de sincronização do MeuRestô opera na camada de rede do navegador (Axios Interceptors):
1. **Leitura Offline (GET)**: Se a internet oscilar ou cair, as requisições de leitura buscarão automaticamente a última resposta salva no cache local (`localStorage`), permitindo visualizar cadastros, funcionários e históricos mesmo sem conexão.
2. **Gravação Offline (POST/PUT/DELETE)**: Qualquer alteração efetuada offline (admitir colaborador, cadastrar receita, demitir, alterar escala) é interceptada, recebe um ID temporário e é colocada em uma **Fila de Sincronização Local**. A interface responde imediatamente que a gravação foi enfileirada com sucesso.
3. **Sincronização Automática (Auto-Sync)**: O sistema monitora a conectividade da internet constantemente em segundo plano (ping a cada 15 segundos). Assim que a internet retornar, o sistema processa toda a fila pendente em ordem cronológica de forma automática, atualiza o banco de dados no servidor e limpa a fila do navegador, sem requerer nenhuma intervenção do usuário.
