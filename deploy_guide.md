# Guia de Deploy em Produção na Nuvem (DigitalOcean)

Este guia descreve como hospedar o **MeuRestô** em um servidor em nuvem da DigitalOcean com servidor localizado no Brasil (São Paulo) para garantir a melhor performance, velocidade e confiabilidade para o seu cliente.

---

## 1. Criar o Servidor na DigitalOcean

1. Crie uma conta em [digitalocean.com](https://www.digitalocean.com).
2. No painel, clique em **Create** (no canto superior direito) e selecione **Droplets**.
3. Configure o Droplet com os seguintes parâmetros:
   * **Region**: Escolha **São Paulo** (para ter a menor latência e resposta instantânea no Brasil).
   * **Choose an image**: Selecione **Ubuntu 22.04 LTS (x64)**.
   * **Droplet Type**: Basic.
   * **CPU Options**: Regular (com SSD) -> Escolha a opção de **$6/month** (1 GB RAM, 1 CPU, 255 GB SSD, 1000 GB Bandwidth).
   * **Authentication**: Escolha **Password** e defina uma senha segura para o usuário `root` (guarde bem essa senha!).
4. Clique em **Create Droplet** na parte inferior e aguarde alguns segundos até o servidor iniciar e mostrar o **IP Público** (ex: `200.120.45.10`).

---

## 2. Acessar o Servidor e Clonar o Código

No seu computador (Windows ou Mac), abra o terminal (Prompt de Comando ou PowerShell) e conecte-se ao servidor recém-criado usando o protocolo SSH:

```bash
ssh root@<IP_DO_SEU_SERVIDOR>
```
*Digite `yes` se perguntado sobre a chave de segurança e informe a senha que você configurou ao criar o Droplet.*

Uma vez dentro do servidor Linux:
1. Navegue para a pasta de hospedagem padrão:
   ```bash
   cd /var/www
   ```
2. Clone o repositório do projeto do seu GitHub:
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO_GIT> meuresto
   cd meuresto
   ```

---

## 3. Executar o Script de Deploy Automático

Para facilitar o processo, criamos o script `deploy_ubuntu.sh` na raiz do projeto. Ele se encarrega de instalar o Python, Node.js, NPM, Nginx, o gerenciador de processos PM2 e configurar o servidor de arquivos automaticamente:

1. Dê permissão de execução ao script:
   ```bash
   chmod +x deploy_ubuntu.sh
   ```
2. Execute o instalador:
   ```bash
   ./deploy_ubuntu.sh
   ```

Aguarde a finalização. O script irá configurar tudo e deixar o sistema rodando.

---

## 4. Configurar SMTP (Disparo de Backups por E-mail)

Após o término da instalação, você precisará editar o arquivo `.env` para que o servidor consiga disparar o e-mail de backup de segurança semanalmente:

1. Abra o arquivo `.env` para edição:
   ```bash
   nano backend/.env
   ```
2. Altere as credenciais para o seu e-mail de envio (ex: Gmail):
   ```env
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=seu-email@gmail.com
   SMTP_PASSWORD=sua-senha-de-aplicativo
   SMTP_FROM=backup@meuresto.com.br
   ```
3. Salve o arquivo apertando `Ctrl + O`, depois `Enter`, e saia com `Ctrl + X`.
4. Reinicie o backend para aplicar as novas configurações de e-mail:
   ```bash
   pm2 restart meuresto-backend
   ```

---

## 5. Como o Cliente Acessa e Instala (PWA)

O sistema agora está online!
* **Acesso Web**: O cliente e seus funcionários podem acessar de qualquer navegador digitando o **IP do servidor** (ex: `http://200.120.45.10`) ou um domínio personalizado que você aponte para esse IP (ex: `http://meuresto.com.br`).
* **Download no Desktop**: Ao acessar pelo computador (Chrome/Edge), um ícone de instalação aparecerá na barra de navegação para baixar o app diretamente no Desktop.
* **Download no Celular**: Ao acessar de smartphones (Chrome no Android ou Safari no iOS), o cliente poderá adicionar à tela de início para ter o aplicativo com ícone nativo e funcionando offline.
