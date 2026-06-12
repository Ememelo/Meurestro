# Guia de Configuração - ADV Lira Melo (Planilha Estilo App)

Este guia orienta na ativação e vinculação do código VBA ao arquivo do Excel. Siga o passo a passo a seguir para criar a barra lateral de navegação e os gráficos modernos automatizados.

---

## Passo 1: Salvar a Planilha como Macro-Habilitada (`.xlsm`)

1. Abra o arquivo **`ADV_Lira_Melo_Base.xlsx`** gerado na pasta do projeto.
2. No Excel, vá em **Arquivo > Salvar Como**.
3. Na caixa de seleção **Tipo**, mude para **"Pasta de Trabalho Habilitada para Macro do Excel (*.xlsm)"**.
4. Salve o arquivo.

---

## Passo 2: Ativar a Guia Desenvolvedor no Excel (Se necessário)

1. Vá em **Arquivo > Opções**.
2. Clique em **Personalizar Faixa de Opções**.
3. Na coluna da direita, marque a caixa **Desenvolvedor** e clique em **OK**.

---

## Passo 3: Importar os Módulos VBA (`.bas`)

1. Pressione **`Alt + F11`** para abrir o Editor do VBA (VBE).
2. No menu superior do Editor, clique em **Arquivo > Importar Arquivo...** (ou clique com o botão direito sobre o nome do projeto no painel esquerdo e selecione *Importar Arquivo*).
3. Navegue até a pasta **`vba_source`** e importe os seguintes arquivos:
   * `Mod_Seguranca.bas`
   * `Mod_Cadastro.bas`
   * `Mod_Helpers.bas`
   * `Mod_Alertas.bas`
   * `Mod_Relatorios.bas`

---

## Passo 4: Configurar os Eventos de Clique nas Abas (Navegação Rápida)

Para que o clique nos botões da barra lateral (Colunas A, B e C) mude de aba instantaneamente:

1. No Editor do VBA, no painel esquerdo, dê dois cliques na primeira planilha (ex: `Plan1 (DASHBOARD)`).
2. Abra o arquivo **`vba_source/Worksheet_Events.txt`**, copie todo o seu código e cole no painel de código dessa planilha.
3. **Repita este procedimento para TODAS as planilhas da lista** (`Plan2 (CAD_FUNC)`, `Plan3 (DOCUMENTACAO)`, etc.).
4. Isso ativará a captura de cliques na barra lateral em qualquer tela do sistema.

---

## Passo 5: Configurar o Código de Inicialização (`ThisWorkbook`)

1. No painel esquerdo, sob **Microsoft Excel Objetos**, dê dois cliques em **`EstaPastaDeTrabalho`** (ou *ThisWorkbook*).
2. Abra o arquivo **`vba_source/ThisWorkbook.cls`**, copie seu conteúdo e cole na janela de código de `EstaPastaDeTrabalho`.
3. Isso garante que as guias padrão do Excel sejam ocultadas ao iniciar, deixando apenas a barra lateral visível, e gera os gráficos no Dashboard.

---

## Passo 6: Criar os Formulários VBA (`UserForms`)

### 1. Formulário de Login (`Form_Login`)
1. No menu superior do Editor do VBA, clique em **Inserir > UserForm**.
2. Na janela de **Propriedades** (inferior esquerdo), mude o **(Name)** para **`Form_Login`**.
3. Mude a propriedade **Caption** para **`ADV Lira Melo - Acesso Restrito`**.
4. Desenhe:
   * **2 Labels**: Mude o Caption de um para `Usuário:` e outro para `Senha:`.
   * **2 TextBoxes**: Nomeie uma para `txtUsuario` e outra para `txtSenha` (defina a propriedade `PasswordChar` para `*`).
   * **2 CommandButtons**: Nomeie um para `btnEntrar` (Caption = `Entrar`) e outro para `btnCancelar` (Caption = `Cancelar`).
5. Dê dois cliques no formulário e cole o código do arquivo **`vba_source/Form_Login.frm`**.

### 2. Formulário de Cadastro (`Form_Cadastro`)
1. Clique em **Inserir > UserForm**.
2. Renomeie o **(Name)** para **`Form_Cadastro`**.
3. Mude o **Caption** para **`ADV Lira Melo - Ficha de Cadastro de Funcionário`**.
4. Aumente o formulário e desenhe:
   * **Um Frame escuro à esquerda** contendo 5 botões verticais: `btnNovo` (`+ NOVO`), `btnPesquisar` (`🔍 PESQUISAR`), `btnUsuarios` (`👥 USUÁRIOS`), `btnSenha` (`🔒 SENHA`) e `btnFechar` (`❌ SAIR`).
   * **Um MultiPage à direita** com 5 abas: `Dados Pessoais`, `Dados Profissionais`, `Acessibilidade`, `Documentos` e `Benefícios`. Desenhe os respectivos campos nomeados no arquivo `Form_Cadastro.frm`.
   * **Um Image control** (`imgFoto`) na aba Acessibilidade, com os botões `btnInserirFoto` ("INSERIR IMAGEM") e `btnDeletarFoto` ("DELETAR IMAGEM") ao lado.
   * **Os botões de ação na base**: `btnSalvar` (ícone de salvar), `btnLimpar` (borracha) e `btnExcluir` (lixeira).
5. Abra a janela de código do formulário e cole o código do arquivo **`vba_source/Form_Cadastro.frm`**.

---

## Passo 7: Vincular Macros aos Botões de Ação

### No Dashboard (Aba `DASHBOARD`)
A barra lateral funciona por clique nas células. No entanto, para abrir o Formulário de Cadastro, você pode criar uma forma retangular ou botão em qualquer lugar na tela (como uma área útil do Dashboard):
1. Desenhe uma forma. Clique com o **botão direito > Atribuir Macro...**
2. Escolha ou crie uma macro que chame o formulário:
   ```vba
   Sub AbrirCadastro()
       Form_Cadastro.Show
   End Sub
   ```

### No Painel de Relatórios (Aba `RELATORIOS`)
Atribua as seguintes macros aos botões retangulares:
* **Exportar Ficha Individual**: `BtnExportarFicha`
* **Relatório de Funcionários Ativos**: `BtnRelatorioAtivos`
* **Relatório de Afastamentos Ativos**: `BtnRelatorioAfastamentos`
* **Relatório de Penalidades**: `BtnRelatorioPenalidades`
* **Relatório de Horas Extras**: `BtnRelatorioHorasExtras`
* **Exportar Pasta Completa**: `BtnExportarTudo`

---

## Credenciais de Acesso Padrão (Login)

| Usuário | Senha | Perfil de Acesso | Permissões |
| :--- | :--- | :--- | :--- |
| `admin` | `admin` | **Administrador** | Acesso total e edição de todas as tabelas |
| `rh` | `rh123` | **RH** | Acesso total a todas as planilhas e cadastros |
| `gestor` | `gestor123` | **Gestor** | Acesso ao Dashboard, Jornada, Horas Extras, Faltas e Relatórios |
| `consulta` | `consulta123` | **Consulta** | Leitura do Dashboard e Relatórios (Abas protegidas) |
