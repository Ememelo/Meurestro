const ExcelJS = require('exceljs');
const path = require('path');

async function createWorkbook() {
    console.log("Iniciando a criação da planilha ADV Lira Melo (Estilo App)...");
    const workbook = new ExcelJS.Workbook();
    
    // Configurações Globais de Estilo
    const fontName = 'Segoe UI';
    const primaryColor = '1B365D'; // Navy Blue
    const accentColor = '4A777A';  // Steel Blue
    const lightGray = 'F2F4F7';    // Zebra Striping
    const borderGray = 'D9D9D9';   // Grid borders
    const white = 'FFFFFF';
    
    const borderStyle = {
        top: { style: 'thin', color: { argb: borderGray } },
        left: { style: 'thin', color: { argb: borderGray } },
        bottom: { style: 'thin', color: { argb: borderGray } },
        right: { style: 'thin', color: { argb: borderGray } }
    };
    
    const headerFill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: primaryColor }
    };
    
    const headerFont = {
        name: fontName,
        size: 11,
        bold: true,
        color: { argb: white }
    };

    const dataFont = {
        name: fontName,
        size: 10
    };

    // Helper para desenhar a Barra Lateral de Navegação
    function createSidebar(ws, activeItemName) {
        // Larguras de colunas da Sidebar
        ws.getColumn(1).width = 3;
        ws.getColumn(2).width = 20;
        ws.getColumn(3).width = 3;
        ws.getColumn(4).width = 4; // Coluna D: Espaçador entre a sidebar e os dados
        
        // Fundo Escuro da Sidebar (linhas 1 a 35, colunas A a C)
        for (let r = 1; r <= 35; r++) {
            for (let c = 1; c <= 3; c++) {
                const cell = ws.getCell(r, c);
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '0F172A' } // Slate 900
                };
            }
        }
        
        // Logotipo / Título do Sistema
        ws.mergeCells('A2:C2');
        const title = ws.getCell('A2');
        title.value = 'ADV LIRA MELO';
        title.font = { name: fontName, size: 12, bold: true, color: { argb: white } };
        title.alignment = { horizontal: 'center', vertical: 'middle' };
        
        // Divisor de seção
        ws.mergeCells('A3:C3');
        ws.getCell('A3').border = { bottom: { style: 'thin', color: { argb: '334155' } } };

        const menuItems = [
            { name: 'Dashboard', label: '🏠 Dashboard', row: 5 },
            { name: 'Funcionários', label: '👥 Funcionários', row: 7 },
            { name: 'Documentos', label: '📂 Documentos', row: 9 },
            { name: 'Contratação', label: '📝 Contratação', row: 11 },
            { name: 'Afastamentos', label: '🩹 Afastamentos', row: 13 },
            { name: 'Disciplinar', label: '⚠️ Disciplinar', row: 15 },
            { name: 'Horas Extras', label: '🕒 Horas Extras', row: 17 },
            { name: 'Relatórios', label: '📊 Relatórios', row: 19 },
            { name: 'Sair', label: '🚪 Sair (Logoff)', row: 22 }
        ];
        
        menuItems.forEach(item => {
            ws.mergeCells(`A${item.row}:C${item.row}`);
            const cell = ws.getCell(`A${item.row}`);
            cell.value = item.label;
            cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
            
            const isActive = (item.name === activeItemName);
            cell.font = {
                name: fontName,
                size: 10,
                bold: isActive,
                color: { argb: isActive ? white : '94A3B8' } // Texto ativo: Branco, Inativo: Cinza
            };
            
            if (isActive) {
                // Pintar linha do item ativo
                for (let c = 1; c <= 3; c++) {
                    ws.getCell(item.row, c).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: '1E293B' } // Slate 800
                    };
                }
                // Adiciona uma borda esquerda em azul para destacar o ativo
                ws.getCell(item.row, 1).border = { left: { style: 'medium', color: { argb: '3B82F6' } } };
            }
        });
        
        // Congelar painéis para manter o menu lateral fixo ao rolar horizontalmente
        ws.views = [
            { state: 'frozen', xSplit: 4, ySplit: 0, activeCell: 'E2' }
        ];
    }

    // Helper para formatar cabeçalhos e linhas de dados (iniciando em E)
    function styleDataRow(row, isHeader = false, isZebra = false) {
        row.eachCell({ includeEmpty: true }, (cell) => {
            // Ignora colunas da barra lateral (A-D)
            if (cell.col >= 5) {
                cell.font = isHeader ? headerFont : dataFont;
                if (isHeader) {
                    cell.fill = headerFill;
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                } else {
                    cell.border = borderStyle;
                    if (isZebra) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: lightGray }
                        };
                    }
                }
            }
        });
    }

    // Dados base de funcionários para popular as tabelas
    const mockEmployees = [
        { id: 'F0001', nome: 'Lucas de Melo Silva', rg: '12.345.678-9', cpf: '123.456.789-00', nascimento: new Date(1992, 4, 15), civil: 'Solteiro(a)', email: 'lucas.melo@email.com', fone: '(11) 98765-4321', end: 'Rua das Flores', num: '123', comp: 'Ap 42', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', cep: '01310-000', mae: 'Maria de Melo Silva', pai: 'José da Silva', dep: 'João de Melo Silva (Filho, 12/04/2018)', def: 'Não', defTipo: '', foto: '', obs: 'Nenhuma observação.', pis: '123.45678.90-1', ctps: '123456', serie: '001-0', ctpsUf: 'SP', emissao: new Date(2010, 5, 20), admissao: new Date(2021, 2, 10), cargo: 'Desenvolvedor Pleno', area: 'Tecnologia', dep_emp: 'Desenvolvimento', gestor: 'Felipe Santos', atividades: 'Desenvolvimento de software em Node.js.', salIni: 4500.0, salAtu: 6500.0, vt: 'Não', vr: 'Sim', va: 'Sim', ps: 'Sim', po: 'Sim', sv: 'Sim', status: 'Ativo' },
        { id: 'F0002', nome: 'Camila Lira Santos', rg: '98.765.432-1', cpf: '987.654.321-00', nascimento: new Date(1995, 8, 22), civil: 'Casado(a)', email: 'camila.lira@email.com', fone: '(11) 99876-5432', end: 'Av. Paulista', num: '1500', comp: 'Bloco A', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP', cep: '01311-200', mae: 'Ana Lira Santos', pai: 'Carlos Santos', dep: 'Sofia Lira (Filha, 20/09/2021)', def: 'Não', defTipo: '', foto: '', obs: '', pis: '987.65432.10-2', ctps: '654321', serie: '002-0', ctpsUf: 'SP', emissao: new Date(2015, 9, 10), admissao: new Date(2022, 5, 15), cargo: 'Analista de RH', area: 'Recursos Humanos', dep_emp: 'R&S', gestor: 'Mariana Rocha', atividades: 'Recrutamento e seleção.', salIni: 3200.0, salAtu: 4100.0, vt: 'Sim', vr: 'Sim', va: 'Sim', ps: 'Sim', po: 'Não', sv: 'Sim', status: 'Ativo' },
        { id: 'F0003', nome: 'Felipe Santos Oliveira', rg: '34.567.890-1', cpf: '345.678.901-22', nascimento: new Date(1985, 11, 5), civil: 'Casado(a)', email: 'felipe.santos@email.com', fone: '(11) 97654-3210', end: 'Rua Augusta', num: '800', comp: '', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP', cep: '01304-001', mae: 'Julia Santos', pai: 'Marcos Oliveira', dep: '', def: 'Não', defTipo: '', foto: '', obs: 'Gerente geral do setor de TI.', pis: '345.67890.12-3', ctps: '789012', serie: '003-0', ctpsUf: 'SP', emissao: new Date(2005, 3, 12), admissao: new Date(2020, 0, 5), cargo: 'Gerente de Tecnologia', area: 'Tecnologia', dep_emp: 'TI', gestor: 'Diretoria', atividades: 'Gestão da equipe de tecnologia.', salIni: 10000.0, salAtu: 12500.0, vt: 'Não', vr: 'Sim', va: 'Sim', ps: 'Sim', po: 'Sim', sv: 'Sim', status: 'Ativo' },
        { id: 'F0004', nome: 'Juliana Ribeiro Costa', rg: '45.678.901-2', cpf: '456.789.012-33', nascimento: new Date(1990, 1, 28), civil: 'Divorciado(a)', email: 'juliana.ribeiro@email.com', fone: '(11) 96543-2109', end: 'Rua Vergueiro', num: '2000', comp: 'Ap 101', bairro: 'Vila Mariana', cidade: 'São Paulo', estado: 'SP', cep: '04102-000', mae: 'Sonia Ribeiro', pai: 'Ricardo Costa', dep: 'Gabriel Ribeiro (Filho, 05/11/2014)', def: 'Não', defTipo: '', foto: '', obs: '', pis: '456.78901.23-4', ctps: '890123', serie: '004-0', ctpsUf: 'SP', emissao: new Date(2011, 2, 18), admissao: new Date(2023, 1, 10), cargo: 'Designer UI/UX', area: 'Design', dep_emp: 'Criação', gestor: 'Felipe Santos', atividades: 'Prototipação de interfaces.', salIni: 4800.0, salAtu: 5500.0, vt: 'Sim', vr: 'Sim', va: 'Não', ps: 'Sim', po: 'Sim', sv: 'Sim', status: 'Ativo' },
        { id: 'F0005', nome: 'Bruno Souza Lima', rg: '56.789.012-3', cpf: '567.890.123-44', nascimento: new Date(1998, 7, 10), civil: 'Solteiro(a)', email: 'bruno.souza@email.com', fone: '(11) 95432-1098', end: 'Rua Pamplona', num: '450', comp: 'Casa', bairro: 'Jardim Paulista', cidade: 'São Paulo', estado: 'SP', cep: '01405-000', mae: 'Teresa Souza', pai: 'Walter Lima', dep: '', def: 'Sim', defTipo: 'Auditiva', foto: '', obs: 'Necessita apoio de acessibilidade física.', pis: '567.89012.34-5', ctps: '901234', serie: '005-0', ctpsUf: 'SP', emissao: new Date(2016, 6, 22), admissao: new Date(2024, 3, 1), cargo: 'Analista de Suporte', area: 'Tecnologia', dep_emp: 'Infraestrutura', gestor: 'Felipe Santos', atividades: 'Suporte técnico.', salIni: 2800.0, salAtu: 2800.0, vt: 'Sim', vr: 'Sim', va: 'Sim', ps: 'Não', po: 'Não', sv: 'Sim', status: 'Afastado' },
        { id: 'F0006', nome: 'Amanda Oliveira Mello', rg: '67.890.123-4', cpf: '689.012.345-55', nascimento: new Date(1993, 10, 12), civil: 'Casado(a)', email: 'amanda.mello@email.com', fone: '(21) 98765-4321', end: 'Av. Atlântica', num: '500', comp: 'Ap 901', bairro: 'Copacabana', cidade: 'Rio de Janeiro', estado: 'RJ', cep: '22020-000', mae: 'Paula Oliveira', pai: 'Afonso Mello', dep: '', def: 'Não', defTipo: '', foto: '', obs: '', pis: '678.90123.45-6', ctps: '012345', serie: '006-0', ctpsUf: 'RJ', emissao: new Date(2012, 10, 5), admissao: new Date(2023, 7, 20), cargo: 'Executiva de Contas', area: 'Comercial', dep_emp: 'Vendas', gestor: 'Gustavo Lima', atividades: 'Vendas corporativas.', salIni: 5000.0, salAtu: 5800.0, vt: 'Não', vr: 'Sim', va: 'Sim', ps: 'Sim', po: 'Sim', sv: 'Sim', status: 'Ativo' },
        { id: 'F0007', nome: 'Rafael Costa Rocha', rg: '78.901.234-5', cpf: '789.012.345-66', nascimento: new Date(1989, 5, 30), civil: 'Casado(a)', email: 'rafael.costa@email.com', fone: '(11) 94321-0987', end: 'Rua Domingos de Morais', num: '1500', comp: 'Ap 21', bairro: 'Vila Mariana', cidade: 'São Paulo', estado: 'SP', cep: '04010-200', mae: 'Beatriz Costa', pai: 'Flavio Rocha', dep: 'Julia Rocha (Filha, 10/10/2016)', def: 'Não', defTipo: '', foto: '', obs: '', pis: '789.01234.56-7', ctps: '1234567', serie: '007-0', ctpsUf: 'SP', emissao: new Date(2008, 6, 15), admissao: new Date(2021, 6, 1), cargo: 'Desenvolvedor Sênior', area: 'Tecnologia', dep_emp: 'Desenvolvimento', gestor: 'Felipe Santos', atividades: 'Arquitetura de sistemas.', salIni: 8000.0, salAtu: 9500.0, vt: 'Não', vr: 'Sim', va: 'Sim', ps: 'Sim', po: 'Sim', sv: 'Sim', status: 'Ativo' },
        { id: 'F0008', nome: 'Mariana Rocha Rezende', rg: '89.012.345-6', cpf: '890.123.456-77', nascimento: new Date(1987, 2, 8), civil: 'Casado(a)', email: 'mariana.rocha@email.com', fone: '(11) 93210-9876', end: 'Rua Bela Cintra', num: '1000', comp: 'Ap 122', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP', cep: '01415-001', mae: 'Clarice Rocha', pai: 'Renato Rezende', dep: 'Alice Rezende (Filha, 05/05/2019)', def: 'Não', defTipo: '', foto: '', obs: 'Gestora da área de recursos humanos.', pis: '890.12345.67-8', ctps: '2345678', serie: '008-0', ctpsUf: 'SP', emissao: new Date(2009, 8, 20), admissao: new Date(2019, 5, 1), cargo: 'Gerente de RH', area: 'Recursos Humanos', dep_emp: 'DP', gestor: 'Diretoria', atividades: 'Planejamento e DP.', salIni: 8500.0, salAtu: 11000.0, vt: 'Não', vr: 'Sim', va: 'Sim', ps: 'Sim', po: 'Sim', sv: 'Sim', status: 'Ativo' },
        { id: 'F0009', nome: 'Gustavo Lima Nogueira', rg: '90.123.456-7', cpf: '901.234.567-88', nascimento: new Date(1980, 0, 15), civil: 'Casado(a)', email: 'gustavo.lima@email.com', fone: '(11) 92109-8765', end: 'Rua Haddock Lobo', num: '1200', comp: 'Ap 304', bairro: 'Cerqueira César', cidade: 'São Paulo', estado: 'SP', cep: '01414-002', mae: 'Regina Lima', pai: 'Milton Nogueira', dep: '', def: 'Não', defTipo: '', foto: '', obs: 'Desligado amigavelmente.', pis: '901.23456.78-9', ctps: '3456789', serie: '009-0', ctpsUf: 'SP', emissao: new Date(2000, 1, 10), admissao: new Date(2020, 2, 1), cargo: 'Coordenador Comercial', area: 'Comercial', dep_emp: 'Vendas', gestor: 'Diretoria', atividades: 'Coordenar vendas.', salIni: 6500.0, salAtu: 7500.0, vt: 'Não', vr: 'Sim', va: 'Sim', ps: 'Sim', po: 'Não', sv: 'Sim', status: 'Desligado' },
        { id: 'F0010', nome: 'Beatriz Almeida Silveira', rg: '01.234.567-8', cpf: '012.345.678-99', nascimento: new Date(1996, 6, 18), civil: 'Solteiro(a)', email: 'beatriz.silveira@email.com', fone: '(11) 91098-7654', end: 'Rua Oscar Freire', num: '500', comp: 'Ap 12', bairro: 'Pinheiros', cidade: 'São Paulo', estado: 'SP', cep: '05409-010', mae: 'Estela Almeida', pai: 'Luiz Silveira', dep: 'Arthur Silveira (Filho, 03/03/2026)', def: 'Não', defTipo: '', foto: '', obs: '', pis: '012.34567.89-0', ctps: '4567890', serie: '010-0', ctpsUf: 'SP', emissao: new Date(2018, 5, 2), admissao: new Date(2024, 0, 15), cargo: 'Analista de Marketing', area: 'Marketing', dep_emp: 'Digital', gestor: 'Mariana Rocha', atividades: 'Gestão de tráfego pago.', salIni: 3800.0, salAtu: 3800.0, vt: 'Sim', vr: 'Sim', va: 'Sim', ps: 'Sim', po: 'Sim', sv: 'Sim', status: 'Afastado' }
    ];

    const mockHistory = [
        { id: 'F0001', nome: 'Lucas de Melo Silva', data: new Date(2023, 5, 1), tipo: 'Evolução Salarial', v_ant: 4500.0, v_nov: 6500.0, formula: '=(J2-I2)/I2', obs: 'Promoção por mérito e desempenho.' },
        { id: 'F0002', nome: 'Camila Lira Santos', data: new Date(2024, 0, 15), tipo: 'Evolução Salarial', v_ant: 3200.0, v_nov: 4100.0, formula: '=(J3-I3)/I3', obs: 'Reajuste anual de dissídio + mérito.' },
        { id: 'F0007', nome: 'Rafael Costa Rocha', data: new Date(2023, 10, 1), tipo: 'Evolução Salarial', v_ant: 8000.0, v_nov: 9500.0, formula: '=(J4-I4)/I4', obs: 'Promoção a cargo Sênior.' },
        { id: 'F0008', nome: 'Mariana Rocha Rezende', data: new Date(2022, 7, 20), tipo: 'Evolução Salarial', v_ant: 8500.0, v_nov: 11000.0, formula: '=(J5-I5)/I5', obs: 'Ajuste salarial por promoção.' },
        { id: 'F0001', nome: 'Lucas de Melo Silva', data: new Date(2023, 5, 1), tipo: 'Mudança de Cargo', v_ant: 'Desenvolvedor Júnior', v_nov: 'Desenvolvedor Pleno', formula: '', obs: 'Promoção interna.' }
    ];

    const mockJor = [
        { id: 'F0001', nome: 'Lucas de Melo Silva', escala: '5x2 - Administrativa', entrada: '09:00', saida: '18:00', intervalo: '01:00', banco: 4.5 },
        { id: 'F0002', nome: 'Camila Lira Santos', escala: '5x2 - Administrativa', entrada: '09:00', saida: '18:00', intervalo: '01:00', banco: -1.2 },
        { id: 'F0003', nome: 'Felipe Santos Oliveira', escala: '5x2 - Flexível', entrada: '08:30', saida: '17:30', intervalo: '01:00', banco: 12.0 },
        { id: 'F0004', nome: 'Juliana Ribeiro Costa', escala: '5x2 - Administrativa', entrada: '09:00', saida: '18:00', intervalo: '01:00', banco: 0.0 },
        { id: 'F0005', nome: 'Bruno Souza Lima', escala: '5x2 - Suporte', entrada: '08:00', saida: '17:00', intervalo: '01:00', banco: -3.5 },
        { id: 'F0006', nome: 'Amanda Oliveira Mello', escala: 'Comercial Livre', entrada: 'Flexível', saida: 'Flexível', intervalo: '01:00', banco: 0.0 },
        { id: 'F0007', nome: 'Rafael Costa Rocha', escala: '5x2 - Administrativa', entrada: '09:00', saida: '18:00', intervalo: '01:00', banco: 8.2 },
        { id: 'F0008', nome: 'Mariana Rocha Rezende', escala: '5x2 - Administrativa', entrada: '09:00', saida: '18:00', intervalo: '01:00', banco: 2.0 },
        { id: 'F0009', nome: 'Gustavo Lima Nogueira', escala: '5x2 - Administrativa', entrada: '09:00', saida: '18:00', intervalo: '01:00', banco: 0.0 },
        { id: 'F0010', nome: 'Beatriz Almeida Silveira', escala: '5x2 - Administrativa', entrada: '09:00', saida: '18:00', intervalo: '01:00', banco: 0.0 }
    ];

    const mockAfast = [
        { id: 'F0005', nome: 'Bruno Souza Lima', tipo: 'Médico', inicio: new Date(2026, 5, 5), retorno: new Date(2026, 5, 20), formula: '=I2-H2', motivo: 'Recuperação pós-cirúrgica de apendicite.', cid: 'K35.8' },
        { id: 'F0010', nome: 'Beatriz Almeida Silveira', tipo: 'Licença Maternidade', inicio: new Date(2026, 2, 1), retorno: new Date(2026, 8, 1), formula: '=I3-H3', motivo: 'Licença maternidade estatutária.', cid: '' }
    ];

    const mockDisc = [
        { id: 'F0005', nome: 'Bruno Souza Lima', data: new Date(2025, 4, 15), tipo: 'Advertência', motivo: 'Atrasos recorrentes na entrada.', resp: 'Felipe Santos', dias: '', desligamento: '' },
        { id: 'F0005', nome: 'Bruno Souza Lima', data: new Date(2025, 5, 2), tipo: 'Suspensão', motivo: 'Falta injustificada em reunião.', resp: 'Felipe Santos', dias: 2, desligamento: '' },
        { id: 'F0009', nome: 'Gustavo Lima Nogueira', data: new Date(2026, 4, 10), tipo: 'Demissão', motivo: 'Reestruturação de quadro comercial.', resp: 'Mariana Rocha', dias: '', desligamento: 'Sem Justa Causa' }
    ];

    const mockFaltas = [
        { id: 'F0001', nome: 'Lucas de Melo Silva', data: new Date(2026, 5, 2), tipo: 'Atraso', justificada: 'Sim', previsto: '09:00', realizado: '09:45', formula: '=ROUND((K2-J2)*1440, 0)', motivo: 'Problemas no transporte coletivo.' },
        { id: 'F0005', nome: 'Bruno Souza Lima', data: new Date(2026, 5, 3), tipo: 'Falta', justificada: 'Não', previsto: '', realizado: '', formula: '', motivo: 'Não justificou ausência.' },
        { id: 'F0002', nome: 'Camila Lira Santos', data: new Date(2026, 5, 4), tipo: 'Atraso', justificada: 'Não', previsto: '09:00', realizado: '09:25', formula: '=ROUND((K4-J4)*1440, 0)', motivo: 'Trânsito intense.' },
        { id: 'F0004', nome: 'Juliana Ribeiro Costa', data: new Date(2026, 5, 8), tipo: 'Falta', justificada: 'Sim', previsto: '', realizado: '', formula: '', motivo: 'Consulta médica (Apresentou atestado).' }
    ];

    const mockHe = [
        { id: 'F0001', nome: 'Lucas de Melo Silva', data: new Date(2026, 5, 5), horas: 2.5, tipo: '50%', f_sal: '=VLOOKUP(E2, CONTRATACAO!E:U, 10, FALSE)', f_val: '=ROUND(((J2/220) * H2 * 1.5), 2)' },
        { id: 'F0001', nome: 'Lucas de Melo Silva', data: new Date(2026, 5, 6), horas: 4.0, tipo: '100%', f_sal: '=VLOOKUP(E3, CONTRATACAO!E:U, 10, FALSE)', f_val: '=ROUND(((J3/220) * H3 * 2.0), 2)' },
        { id: 'F0007', nome: 'Rafael Costa Rocha', data: new Date(2026, 5, 5), horas: 3.0, tipo: '50%', f_sal: '=VLOOKUP(E4, CONTRATACAO!E:U, 10, FALSE)', f_val: '=ROUND(((J4/220) * H4 * 1.5), 2)' },
        { id: 'F0007', nome: 'Rafael Costa Rocha', data: new Date(2026, 5, 12), horas: 2.0, tipo: 'Noturna', f_sal: '=VLOOKUP(E5, CONTRATACAO!E:U, 10, FALSE)', f_val: '=ROUND(((J5/220) * H5 * 1.2), 2)' }
    ];

    const areas = ['Tecnologia', 'Recursos Humanos', 'Comercial', 'Marketing', 'Design'];
    const statuses = ['Ativo', 'Afastado', 'Desligado'];

    // ==========================================
    // 1. ABA DASHBOARD EXECUTIVO
    // ==========================================
    const wsDash = workbook.addWorksheet('DASHBOARD', { views: [{ showGridLines: false }] });
    createSidebar(wsDash, 'Dashboard');
    
    // Título do Dashboard (inicia em E2)
    wsDash.mergeCells('E2:O2');
    const titleCell = wsDash.getCell('E2');
    titleCell.value = 'ADV LIRA MELO - DASHBOARD DE GESTÃO DE PESSOAS';
    titleCell.font = { name: fontName, size: 14, bold: true, color: { argb: white } };
    titleCell.fill = headerFill;
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wsDash.getRow(2).height = 40;

    // Cartões KPI - Layout Lado a Lado (E a O)
    const kpiCards = [
        { title: 'Funcionários Ativos', formula: '=COUNTIF(CONTRATACAO!U:U, "Ativo")', valCell: 'E4:F4', lblCell: 'E5:F5', color: '1B365D' },
        { title: 'Afastados', formula: '=COUNTIF(CONTRATACAO!U:U, "Afastado")', valCell: 'H4:I4', lblCell: 'H5:I5', color: 'E67E22' },
        { title: 'Admissões (Ano)', formula: '=COUNTIFS(CONTRATACAO!G:G, ">=01/01/2026", CONTRATACAO!G:G, "<=31/12/2026")', valCell: 'K4:L4', lblCell: 'K5:L5', color: '2ECC71' },
        { title: 'Desligamentos (Ano)', formula: '=COUNTIFS(CONTRATACAO!U:U, "Desligado", DISCIPLINAR!G:G, ">=01/01/2026")', valCell: 'N4:O4', lblCell: 'N5:O5', color: 'E74C3C' },
        
        { title: 'Advertências', formula: '=COUNTIF(DISCIPLINAR!H:H, "Advertência")', valCell: 'E8:F8', lblCell: 'E9:F9', color: 'F1C40F' },
        { title: 'Suspensões', formula: '=COUNTIF(DISCIPLINAR!H:H, "Suspensão")', valCell: 'H8:I8', lblCell: 'H9:I9', color: 'D35400' },
        { title: 'Faltas Registradas', formula: '=COUNTIF(FALTAS_ATRASOS!H:H, "Falta")', valCell: 'K8:L8', lblCell: 'K9:L9', color: '95A5A6' },
        { title: 'Atrasos Registrados', formula: '=COUNTIF(FALTAS_ATRASOS!H:H, "Atraso")', valCell: 'N8:O8', lblCell: 'N9:O9', color: '7F8C8D' },
        
        { title: 'Total Horas Extras', formula: '=SUM(HORAS_EXTRAS!H:H)', valCell: 'E12:G12', lblCell: 'E13:G13', color: '4A777A', format: '#,##0.00' },
        { title: 'Média Salarial (Ativos)', formula: '=AVERAGEIF(CONTRATACAO!U:U, "Ativo", CONTRATACAO!N:N)', valCell: 'I12:K12', lblCell: 'I13:K13', color: '2C3E50', format: 'R$ #,##0.00' },
        { title: 'Status Documentos Pendentes', formula: '=COUNTIF(DOCUMENTACAO!L:L, "Pendente")', valCell: 'M12:O12', lblCell: 'M13:O13', color: 'C0392B' }
    ];

    kpiCards.forEach(card => {
        wsDash.mergeCells(card.valCell);
        wsDash.mergeCells(card.lblCell);
        
        const cellVal = wsDash.getCell(card.valCell.split(':')[0]);
        cellVal.value = { formula: card.formula };
        cellVal.font = { name: fontName, size: 18, bold: true, color: { argb: card.color } };
        cellVal.alignment = { horizontal: 'center', vertical: 'middle' };
        if (card.format) cellVal.numFmt = card.format;

        const cellLbl = wsDash.getCell(card.lblCell.split(':')[0]);
        cellLbl.value = card.title.toUpperCase();
        cellLbl.font = { name: fontName, size: 8, bold: true, color: { argb: '7F8C8D' } };
        cellLbl.alignment = { horizontal: 'center', vertical: 'middle' };

        // Aplicar borda do cartão
        const startCol = wsDash.getCell(card.valCell.split(':')[0]).col;
        const endCol = wsDash.getCell(card.valCell.split(':')[1]).col;
        const startRow = wsDash.getCell(card.valCell.split(':')[0]).row;
        const endRow = wsDash.getCell(card.lblCell.split(':')[1]).row;

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const cell = wsDash.getCell(r, c);
                cell.border = borderStyle;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FAFAFA' } };
            }
        }
    });

    // Seção Reservada para os Gráficos do Excel (Linhas 16 a 28, Colunas E a O)
    wsDash.mergeCells('E16:O16');
    const chartHeader = wsDash.getCell('E16');
    chartHeader.value = 'INDICADORES GRÁFICOS (RENDERIZADOS PELO MOTOR EXCEL VBA)';
    chartHeader.font = { name: fontName, size: 11, bold: true, color: { argb: white } };
    chartHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentColor } };
    chartHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    wsDash.getRow(16).height = 25;

    // Colocar células de instruções no meio do painel do gráfico
    wsDash.mergeCells('E18:O20');
    const chartInstruction = wsDash.getCell('E18');
    chartInstruction.value = 'Os gráficos modernos de "Funcionários por Área" e "Status de Colaboradores" serão desenhados e atualizados dinamicamente neste espaço pelo VBA (Mod_Relatorios.CriarGraficosDashboard) quando as macros forem importadas e ativadas.';
    chartInstruction.font = { name: fontName, size: 10, italic: true, color: { argb: '555555' } };
    chartInstruction.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    // Tabela Oculta de Suporte para Alimentação dos Gráficos (Colunas P, Q e R)
    wsDash.getCell('Q1').value = 'Suporte Gráficos';
    wsDash.getCell('Q1').font = { name: fontName, size: 9, bold: true, color: { argb: '7F8C8D' } };

    // Gráfico 1: Funcionários por Área
    wsDash.getCell('Q3').value = 'Área';
    wsDash.getCell('R3').value = 'Qtd';
    areas.forEach((area, idx) => {
        const rowIdx = idx + 4;
        wsDash.getCell(`Q${rowIdx}`).value = area;
        wsDash.getCell(`R${rowIdx}`).value = { formula: `=COUNTIF(CONTRATACAO!I:I, Q${rowIdx})` };
    });

    // Gráfico 2: Status
    wsDash.getCell('Q10').value = 'Status';
    wsDash.getCell('R10').value = 'Qtd';
    statuses.forEach((status, idx) => {
        const rowIdx = idx + 11;
        wsDash.getCell(`Q${rowIdx}`).value = status;
        wsDash.getCell(`R${rowIdx}`).value = { formula: `=COUNTIF(CONTRATACAO!U:U, Q${rowIdx})` };
    });

    // Pintar fundo de branco nas colunas Q e R para "esconder" os dados de suporte de forma elegante
    for (let r = 1; r <= 20; r++) {
        wsDash.getCell(r, 17).font = { color: { argb: 'FFFFFF' } }; // Branco
        wsDash.getCell(r, 18).font = { color: { argb: 'FFFFFF' } };
    }

    // Configuração de largura de colunas de conteúdo do Dashboard
    for (let c = 5; c <= 15; c++) {
        wsDash.getColumn(c).width = 13;
    }

    // ==========================================
    // 2. ABA CADASTRO DE FUNCIONÁRIOS (CAD_FUNC)
    // ==========================================
    const wsCad = workbook.addWorksheet('CAD_FUNC');
    createSidebar(wsCad, 'Funcionários');
    
    wsCad.columns = [
        { header: '', key: 'sb1', width: 3 },
        { header: '', key: 'sb2', width: 20 },
        { header: '', key: 'sb3', width: 3 },
        { header: '', key: 'sp', width: 4 },
        { header: 'CÓDIGO', key: 'id', width: 12 },
        { header: 'NOME COMPLETO', key: 'nome', width: 28 },
        { header: 'RG', key: 'rg', width: 15 },
        { header: 'CPF', key: 'cpf', width: 16 },
        { header: 'DATA NASCIMENTO', key: 'nascimento', width: 18 },
        { header: 'ESTADO CIVIL', key: 'civil', width: 15 },
        { header: 'E-MAIL', key: 'email', width: 25 },
        { header: 'TELEFONE', key: 'fone', width: 18 },
        { header: 'ENDEREÇO', key: 'end', width: 25 },
        { header: 'NÚMERO', key: 'num', width: 10 },
        { header: 'COMPLEMENTO', key: 'comp', width: 15 },
        { header: 'BAIRRO', key: 'bairro', width: 18 },
        { header: 'CIDADE', key: 'cidade', width: 18 },
        { header: 'ESTADO', key: 'estado', width: 10 },
        { header: 'CEP', key: 'cep', width: 12 },
        { header: 'NOME DA MÃE', key: 'mae', width: 25 },
        { header: 'NOME DO PAI', key: 'pai', width: 25 },
        { header: 'DEPENDENTES', key: 'dep', width: 40 },
        { header: 'DEFICIÊNCIA', key: 'def', width: 15 },
        { header: 'TIPO DE DEF.', key: 'defTipo', width: 18 },
        { header: 'FOTO (CAMINHO)', key: 'foto', width: 20 },
        { header: 'OBSERVAÇÕES', key: 'obs', width: 35 }
    ];

    styleDataRow(wsCad.getRow(1), true);
    wsCad.getRow(1).height = 28;

    mockEmployees.forEach((emp, i) => {
        const row = wsCad.addRow(emp);
        row.getCell('nascimento').numFmt = 'dd/mm/yyyy';
        styleDataRow(row, false, i % 2 === 1);
    });

    // ==========================================
    // 3. ABA DOCUMENTAÇÃO
    // ==========================================
    const wsDoc = workbook.addWorksheet('DOCUMENTACAO');
    createSidebar(wsDoc, 'Documentos');
    
    wsDoc.columns = [
        { header: '', key: 'sb1', width: 3 },
        { header: '', key: 'sb2', width: 20 },
        { header: '', key: 'sb3', width: 3 },
        { header: '', key: 'sp', width: 4 },
        { header: 'CÓDIGO', key: 'id', width: 12 },
        { header: 'NOME COMPLETO', key: 'nome', width: 28 },
        { header: 'PIS', key: 'pis', width: 18 },
        { header: 'CTPS NÚMERO', key: 'ctps', width: 15 },
        { header: 'SÉRIE', key: 'serie', width: 12 },
        { header: 'UF CTPS', key: 'ctpsUf', width: 10 },
        { header: 'DATA EMISSÃO CTPS', key: 'emissao', width: 20 },
        { header: 'STATUS DOCUMENTOS', key: 'status_doc', width: 22 }
    ];

    styleDataRow(wsDoc.getRow(1), true);
    wsDoc.getRow(1).height = 28;

    mockEmployees.forEach((emp, i) => {
        const rowIndex = i + 2;
        const row = wsDoc.addRow({
            id: emp.id,
            nome: emp.nome,
            pis: emp.pis,
            ctps: emp.ctps,
            serie: emp.serie,
            ctpsUf: emp.ctpsUf,
            emissao: emp.emissao,
            status_doc: { formula: `=IF(OR(ISBLANK(G${rowIndex}), ISBLANK(H${rowIndex}), ISBLANK(I${rowIndex}), ISBLANK(J${rowIndex}), ISBLANK(K${rowIndex})), "Pendente", "Completo")` }
        });
        row.getCell('emissao').numFmt = 'dd/mm/yyyy';
        styleDataRow(row, false, i % 2 === 1);
        row.getCell('status_doc').font = { name: fontName, size: 10, bold: true, color: { argb: '27AE60' } };
        row.getCell('status_doc').alignment = { horizontal: 'center' };
    });

    // Simular Pendência do Bruno (F0005)
    wsDoc.getCell('G6').value = '';
    wsDoc.getCell('H6').value = '';
    wsDoc.getCell('L6').font = { name: fontName, size: 10, bold: true, color: { argb: 'C0392B' } };

    // ==========================================
    // 4. ABA CONTRATAÇÃO
    // ==========================================
    const wsCont = workbook.addWorksheet('CONTRATACAO');
    createSidebar(wsCont, 'Contratação');
    
    wsCont.columns = [
        { header: '', key: 'sb1', width: 3 },
        { header: '', key: 'sb2', width: 20 },
        { header: '', key: 'sb3', width: 3 },
        { header: '', key: 'sp', width: 4 },
        { header: 'CÓDIGO', key: 'id', width: 12 },
        { header: 'NOME COMPLETO', key: 'nome', width: 28 },
        { header: 'DATA ADMISSÃO', key: 'admissao', width: 18 },
        { header: 'CARGO', key: 'cargo', width: 22 },
        { header: 'ÁREA DE ATUAÇÃO', key: 'area', width: 18 },
        { header: 'DEPARTAMENTO', key: 'dep_emp', width: 18 },
        { header: 'GESTOR RESPONSÁVEL', key: 'gestor', width: 22 },
        { header: 'ATIVIDADES EXERCIDAS', key: 'atividades', width: 30 },
        { header: 'SALÁRIO INICIAL', key: 'salIni', width: 18 },
        { header: 'SALÁRIO ATUAL', key: 'salAtu', width: 18 },
        { header: 'VALE TRANSPORTE', key: 'vt', width: 18 },
        { header: 'VALE REFEIÇÃO', key: 'vr', width: 18 },
        { header: 'VALE ALIMENTAÇÃO', key: 'va', width: 18 },
        { header: 'PLANO DE SAÚDE', key: 'ps', width: 18 },
        { header: 'PLANO ODONTOLÓGICO', key: 'po', width: 20 },
        { header: 'SEGURO DE VIDA', key: 'sv', width: 18 },
        { header: 'STATUS', key: 'status', width: 15 }
    ];

    styleDataRow(wsCont.getRow(1), true);
    wsCont.getRow(1).height = 28;

    mockEmployees.forEach((emp, i) => {
        const row = wsCont.addRow(emp);
        row.getCell('admissao').numFmt = 'dd/mm/yyyy';
        row.getCell('salIni').numFmt = 'R$ #,##0.00';
        row.getCell('salAtu').numFmt = 'R$ #,##0.00';
        styleDataRow(row, false, i % 2 === 1);
        row.getCell('status').alignment = { horizontal: 'center' };
        row.getCell('status').font = { name: fontName, size: 10, bold: true };
    });

    // ==========================================
    // 5. ABA HISTÓRICO FUNCIONAL
    // ==========================================
    const wsHist = workbook.addWorksheet('HIST_FUNC');
    createSidebar(wsHist, 'Funcionários');
    
    wsHist.columns = [
        { header: '', key: 'sb1', width: 3 },
        { header: '', key: 'sb2', width: 20 },
        { header: '', key: 'sb3', width: 3 },
        { header: '', key: 'sp', width: 4 },
        { header: 'CÓDIGO', key: 'id', width: 12 },
        { header: 'NOME COMPLETO', key: 'nome', width: 28 },
        { header: 'DATA EVENTO', key: 'data', width: 15 },
        { header: 'TIPO DE EVENTO', key: 'tipo', width: 22 },
        { header: 'VALOR ANTERIOR', key: 'v_ant', width: 20 },
        { header: 'NOVO VALOR', key: 'v_nov', width: 20 },
        { header: '% REAJUSTE', key: 'reajuste', width: 15 },
        { header: 'OBSERVAÇÕES', key: 'obs', width: 35 }
    ];

    styleDataRow(wsHist.getRow(1), true);
    wsHist.getRow(1).height = 28;

    mockHistory.forEach((hist, i) => {
        const row = wsHist.addRow({
            id: hist.id,
            nome: hist.nome,
            data: hist.data,
            tipo: hist.tipo,
            v_ant: hist.v_ant,
            v_nov: hist.v_nov,
            reajuste: hist.formula ? { formula: hist.formula } : '',
            obs: hist.obs
        });
        row.getCell('data').numFmt = 'dd/mm/yyyy';
        if (hist.tipo === 'Evolução Salarial') {
            row.getCell('v_ant').numFmt = 'R$ #,##0.00';
            row.getCell('v_nov').numFmt = 'R$ #,##0.00';
            row.getCell('reajuste').numFmt = '0.0%';
        }
        styleDataRow(row, false, i % 2 === 1);
    });

    // ==========================================
    // 6. ABA AFASTAMENTOS
    // ==========================================
    const wsAfast = workbook.addWorksheet('AFASTAMENTOS');
    createSidebar(wsAfast, 'Afastamentos');
    
    wsAfast.columns = [
        { header: '', key: 'sb1', width: 3 },
        { header: '', key: 'sb2', width: 20 },
        { header: '', key: 'sb3', width: 3 },
        { header: '', key: 'sp', width: 4 },
        { header: 'CÓDIGO', key: 'id', width: 12 },
        { header: 'NOME COMPLETO', key: 'nome', width: 28 },
        { header: 'TIPO AFASTAMENTO', key: 'tipo', width: 22 },
        { header: 'DATA INÍCIO', key: 'inicio', width: 15 },
        { header: 'DATA RETORNO', key: 'retorno', width: 15 },
        { header: 'QUANTIDADE DIAS', key: 'dias', width: 18 },
        { header: 'MOTIVO', key: 'motivo', width: 35 },
        { header: 'CID (OPCIONAL)', key: 'cid', width: 15 }
    ];

    styleDataRow(wsAfast.getRow(1), true);
    wsAfast.getRow(1).height = 28;

    mockAfast.forEach((af, i) => {
        const row = wsAfast.addRow({
            id: af.id,
            nome: af.nome,
            tipo: af.tipo,
            inicio: af.inicio,
            retorno: af.retorno,
            dias: { formula: af.formula },
            motivo: af.motivo,
            cid: af.cid
        });
        row.getCell('inicio').numFmt = 'dd/mm/yyyy';
        row.getCell('retorno').numFmt = 'dd/mm/yyyy';
        row.getCell('dias').alignment = { horizontal: 'right' };
        styleDataRow(row, false, i % 2 === 1);
    });

    // ==========================================
    // 7. ABA CONTROLE DISCIPLINAR
    // ==========================================
    const wsDisc = workbook.addWorksheet('DISCIPLINAR');
    createSidebar(wsDisc, 'Disciplinar');
    
    wsDisc.columns = [
        { header: '', key: 'sb1', width: 3 },
        { header: '', key: 'sb2', width: 20 },
        { header: '', key: 'sb3', width: 3 },
        { header: '', key: 'sp', width: 4 },
        { header: 'CÓDIGO', key: 'id', width: 12 },
        { header: 'NOME COMPLETO', key: 'nome', width: 28 },
        { header: 'DATA OCORRÊNCIA', key: 'data', width: 18 },
        { header: 'TIPO PENALIDADE', key: 'tipo', width: 20 },
        { header: 'MOTIVO', key: 'motivo', width: 35 },
        { header: 'RESPONSÁVEL', key: 'resp', width: 22 },
        { header: 'DIAS SUSPENSÃO', key: 'dias', width: 18 },
        { header: 'TIPO DESLIGAMENTO', key: 'desligamento', width: 22 }
    ];

    styleDataRow(wsDisc.getRow(1), true);
    wsDisc.getRow(1).height = 28;

    mockDisc.forEach((d, i) => {
        const row = wsDisc.addRow(d);
        row.getCell('data').numFmt = 'dd/mm/yyyy';
        styleDataRow(row, false, i % 2 === 1);
    });

    // ==========================================
    // 8. ABA FALTAS E ATRASOS
    // ==========================================
    const wsFaltas = workbook.addWorksheet('FALTAS_ATRASOS');
    createSidebar(wsFaltas, 'Disciplinar');
    
    wsFaltas.columns = [
        { header: '', key: 'sb1', width: 3 },
        { header: '', key: 'sb2', width: 20 },
        { header: '', key: 'sb3', width: 3 },
        { header: '', key: 'sp', width: 4 },
        { header: 'CÓDIGO', key: 'id', width: 12 },
        { header: 'NOME COMPLETO', key: 'nome', width: 28 },
        { header: 'DATA', key: 'data', width: 15 },
        { header: 'TIPO', key: 'tipo', width: 12 },
        { header: 'JUSTIFICADA', key: 'justificada', width: 15 },
        { header: 'H. PREVISTA', key: 'previsto', width: 15 },
        { header: 'H. REALIZADA', key: 'realizado', width: 15 },
        { header: 'MINUTOS ATRASO', key: 'minutos', width: 18 },
        { header: 'MOTIVO', key: 'motivo', width: 35 }
    ];

    styleDataRow(wsFaltas.getRow(1), true);
    wsFaltas.getRow(1).height = 28;

    mockFaltas.forEach((f, i) => {
        const row = wsFaltas.addRow({
            id: f.id,
            nome: f.nome,
            data: f.data,
            tipo: f.tipo,
            justificada: f.justificada,
            previsto: f.previsto,
            realizado: f.realizado,
            minutos: f.formula ? { formula: f.formula } : '',
            motivo: f.motivo
        });
        row.getCell('data').numFmt = 'dd/mm/yyyy';
        if (f.tipo === 'Atraso') {
            row.getCell('previsto').alignment = { horizontal: 'center' };
            row.getCell('realizado').alignment = { horizontal: 'center' };
            row.getCell('minutos').numFmt = '#,##0';
        }
        styleDataRow(row, false, i % 2 === 1);
    });

    // ==========================================
    // 9. ABA CONTROLE DE JORNADA
    // ==========================================
    const wsJor = workbook.addWorksheet('JORNADA');
    createSidebar(wsJor, 'Horas Extras');
    
    wsJor.columns = [
        { header: '', key: 'sb1', width: 3 },
        { header: '', key: 'sb2', width: 20 },
        { header: '', key: 'sb3', width: 3 },
        { header: '', key: 'sp', width: 4 },
        { header: 'CÓDIGO', key: 'id', width: 12 },
        { header: 'NOME COMPLETO', key: 'nome', width: 28 },
        { header: 'ESCALA TRABALHO', key: 'escala', width: 20 },
        { header: 'HORÁRIO ENTRADA', key: 'entrada', width: 18 },
        { header: 'HORÁRIO SAÍDA', key: 'saida', width: 18 },
        { header: 'INTERVALO', key: 'intervalo', width: 15 },
        { header: 'BANCO DE HORAS (SALDO)', key: 'banco', width: 25 }
    ];

    styleDataRow(wsJor.getRow(1), true);
    wsJor.getRow(1).height = 28;

    mockJor.forEach((j, i) => {
        const row = wsJor.addRow(j);
        row.getCell('banco').numFmt = '+#,##0.0;-#,##0.0;0.0';
        styleDataRow(row, false, i % 2 === 1);
    });

    // ==========================================
    // 10. ABA HORAS EXTRAS
    // ==========================================
    const wsHe = workbook.addWorksheet('HORAS_EXTRAS');
    createSidebar(wsHe, 'Horas Extras');
    
    wsHe.columns = [
        { header: '', key: 'sb1', width: 3 },
        { header: '', key: 'sb2', width: 20 },
        { header: '', key: 'sb3', width: 3 },
        { header: '', key: 'sp', width: 4 },
        { header: 'CÓDIGO', key: 'id', width: 12 },
        { header: 'NOME COMPLETO', key: 'nome', width: 28 },
        { header: 'DATA', key: 'data', width: 15 },
        { header: 'QUANTIDADE HORAS', key: 'horas', width: 20 },
        { header: 'TIPO H.E.', key: 'tipo', width: 15 },
        { header: 'SALÁRIO ATUAL', key: 'salario', width: 20 },
        { header: 'VALOR CALCULADO', key: 'valor', width: 22 }
    ];

    styleDataRow(wsHe.getRow(1), true);
    wsHe.getRow(1).height = 28;

    mockHe.forEach((he, i) => {
        const row = wsHe.addRow({
            id: he.id,
            nome: he.nome,
            data: he.data,
            horas: he.horas,
            tipo: he.tipo,
            salario: { formula: he.f_sal },
            valor: { formula: he.f_val }
        });
        row.getCell('data').numFmt = 'dd/mm/yyyy';
        row.getCell('horas').numFmt = '#,##0.00';
        row.getCell('salario').numFmt = 'R$ #,##0.00';
        row.getCell('valor').numFmt = 'R$ #,##0.00';
        styleDataRow(row, false, i % 2 === 1);
    });

    // ==========================================
    // 11. ABA RELATÓRIOS
    // ==========================================
    const wsRep = workbook.addWorksheet('RELATORIOS', { views: [{ showGridLines: false }] });
    createSidebar(wsRep, 'Relatórios');
    
    // Título do Painel (E2)
    wsRep.mergeCells('E2:M2');
    const repTitle = wsRep.getCell('E2');
    repTitle.value = 'PAINEL DE EMISSÃO DE RELATÓRIOS E FICHA INDIVIDUAL';
    repTitle.font = { name: fontName, size: 14, bold: true, color: { argb: white } };
    repTitle.fill = headerFill;
    repTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    wsRep.getRow(2).height = 35;

    // Área de Busca
    wsRep.mergeCells('E4:F4');
    const searchLbl = wsRep.getCell('E4');
    searchLbl.value = 'CÓDIGO DO FUNCIONÁRIO:';
    searchLbl.font = { name: fontName, size: 10, bold: true, color: { argb: primaryColor } };
    searchLbl.alignment = { horizontal: 'right', vertical: 'middle' };

    wsRep.mergeCells('H4:I4');
    const searchVal = wsRep.getCell('H4');
    searchVal.value = 'F0001';
    searchVal.font = { name: fontName, size: 11, bold: true };
    searchVal.alignment = { horizontal: 'center', vertical: 'middle' };
    searchVal.border = borderStyle;
    searchVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC' } };

    const reportFields = [
        { label: 'Nome Completo', formula: '=VLOOKUP(H4, CAD_FUNC!E:Z, 2, FALSE)', cell: 'H7:N7' },
        { label: 'CPF', formula: '=VLOOKUP(H4, CAD_FUNC!E:Z, 4, FALSE)', cell: 'H9:I9' },
        { label: 'RG', formula: '=VLOOKUP(H4, CAD_FUNC!E:Z, 3, FALSE)', cell: 'K9:L9' },
        { label: 'Data de Nascimento', formula: '=VLOOKUP(H4, CAD_FUNC!E:Z, 5, FALSE)', cell: 'N9', isDate: true },
        { label: 'E-mail', formula: '=VLOOKUP(H4, CAD_FUNC!E:Z, 7, FALSE)', cell: 'H11:K11' },
        { label: 'Telefone', formula: '=VLOOKUP(H4, CAD_FUNC!E:Z, 8, FALSE)', cell: 'M11:N11' },
        { label: 'Cargo', formula: '=VLOOKUP(H4, CONTRATACAO!E:U, 4, FALSE)', cell: 'H13:J13' },
        { label: 'Área / Depto', formula: '=VLOOKUP(H4, CONTRATACAO!E:U, 5, FALSE) & " / " & VLOOKUP(H4, CONTRATACAO!E:U, 6, FALSE)', cell: 'L13:N13' },
        { label: 'Salário Atual', formula: '=VLOOKUP(H4, CONTRATACAO!E:U, 10, FALSE)', cell: 'H15:I15', isCurrency: true },
        { label: 'Data Admissão', formula: '=VLOOKUP(H4, CONTRATACAO!E:U, 3, FALSE)', cell: 'K15:L15', isDate: true },
        { label: 'Status Atual', formula: '=VLOOKUP(H4, CONTRATACAO!E:U, 17, FALSE)', cell: 'N15', isStatus: true }
    ];

    wsRep.mergeCells('E6:N6');
    const fichaHeader = wsRep.getCell('E6');
    fichaHeader.value = 'FICHA FUNCIONAL INDIVIDUAL';
    fichaHeader.font = { name: fontName, size: 11, bold: true, color: { argb: 'FFFFFF' } };
    fichaHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentColor } };
    fichaHeader.alignment = { horizontal: 'left', vertical: 'middle' };
    wsRep.getRow(6).height = 20;

    const labelCells = [
        { val: 'Nome Completo:', cell: 'E7:G7' },
        { val: 'CPF:', cell: 'E9:G9' },
        { val: 'RG:', cell: 'J9' },
        { val: 'Nascimento:', cell: 'M9' },
        { val: 'E-mail:', cell: 'E11:G11' },
        { val: 'Telefone:', cell: 'L11' },
        { val: 'Cargo:', cell: 'E13:G13' },
        { val: 'Área / Depto:', cell: 'K13' },
        { val: 'Salário Atual:', cell: 'E15:G15' },
        { val: 'Data Admissão:', cell: 'J15' },
        { val: 'Status:', cell: 'M15' }
    ];

    labelCells.forEach(lbl => {
        wsRep.mergeCells(lbl.cell);
        const cell = wsRep.getCell(lbl.cell.split(':')[0]);
        cell.value = lbl.val;
        cell.font = { name: fontName, size: 9, bold: true, color: { argb: '555555' } };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
    });

    reportFields.forEach(field => {
        wsRep.mergeCells(field.cell);
        const cell = wsRep.getCell(field.cell.split(':')[0]);
        cell.value = { formula: field.formula };
        cell.font = { name: fontName, size: 10, bold: field.isStatus };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.border = borderStyle;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FAFAFA' } };

        if (field.isDate) {
            cell.numFmt = 'dd/mm/yyyy';
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (field.isCurrency) {
            cell.numFmt = 'R$ #,##0.00';
        } else if (field.isStatus) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.font = { name: fontName, size: 10, bold: true, color: { argb: '27AE60' } };
        }
    });

    // Ações de Exportação
    wsRep.mergeCells('E18:N18');
    const actionsHeader = wsRep.getCell('E18');
    actionsHeader.value = 'EXPORTAÇÃO E RELATÓRIOS ADICIONAIS (AUTOMATIZADO VIA VBA)';
    actionsHeader.font = { name: fontName, size: 11, bold: true, color: { argb: 'FFFFFF' } };
    actionsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentColor } };
    actionsHeader.alignment = { horizontal: 'left', vertical: 'middle' };
    wsRep.getRow(18).height = 20;

    const repActions = [
        { label: 'Exportar Ficha Individual (PDF)', cell: 'E20:G20' },
        { label: 'Relatório de Ativos (PDF)', cell: 'H20:J20' },
        { label: 'Relatório de Afastamentos (PDF)', cell: 'K20:N20' },
        { label: 'Relatório de Penalidades (PDF)', cell: 'E22:G22' },
        { label: 'Relatório de Horas Extras (PDF)', cell: 'H22:J22' },
        { label: 'Exportar Pasta Completa (PDF)', cell: 'K22:N22' }
    ];

    repActions.forEach(act => {
        wsRep.mergeCells(act.cell);
        const cell = wsRep.getCell(act.cell.split(':')[0]);
        cell.value = act.label;
        cell.font = { name: fontName, size: 9, bold: true, color: { argb: primaryColor } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F6F9' } };
        
        const startCol = wsRep.getCell(act.cell.split(':')[0]).col;
        const endCol = wsRep.getCell(act.cell.split(':')[1]).col;
        const startRow = wsRep.getCell(act.cell.split(':')[0]).row;
        const endRow = wsRep.getCell(act.cell.split(':')[1]).row;

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                wsRep.getCell(r, c).border = {
                    top: { style: 'thin', color: { argb: 'B0C4DE' } },
                    left: { style: 'thin', color: { argb: 'B0C4DE' } },
                    bottom: { style: 'medium', color: { argb: primaryColor } },
                    right: { style: 'thin', color: { argb: 'B0C4DE' } }
                };
            }
        }
    });

    for (let c = 5; c <= 14; c++) {
        wsRep.getColumn(c).width = 13;
    }

    const outputPath = path.join(__dirname, 'ADV_Lira_Melo_Base.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Planilha base estilo App regerada com sucesso em: ${outputPath}`);
}

createWorkbook().catch(err => {
    console.error("Erro ao gerar planilha:", err);
    process.exit(1);
});
