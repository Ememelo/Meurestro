// Node.js script using exceljs to create a modern system-styled base workbook for ADV Lira Melo (v2)

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const projectDir = "c:\\Users\\esantame\\OneDrive - NTT DATA EMEAL\\Escritorio\\Projetos Qualidade de Software (indicadores)\\ADV Lira Melo (Planilha)";
const finalFile = path.join(projectDir, "ADV_Lira_Melo_Base.xlsx");

console.log("Generating styled ADV Lira Melo base Excel workbook (v2)...");

const workbook = new ExcelJS.Workbook();

// Palette colors
const DARK_SLATE = '1E293B'; // #1E293B
const MENU_TEXT = 'F8FAFC';  // #F8FAFC
const ACTIVE_BG = '334155';  // #334155 (Selected menu item highlight)
const HEADER_BLUE = '1B365D'; // #1B365D (Top header card)
const CARD_BG = 'F1F5F9';     // #F1F5F9 (KPI Card background)
const FIELD_BORDER = 'CBD5E1'; // #CBD5E1 (Light grey border for input fields)

// Menu list
const menuItems = [
  { text: "   🏠 Dashboard", row: 5 },
  { text: "   👥 Cadastro", row: 7 },
  { text: "   🩹 Afastamentos", row: 9 },
  { text: "   ⚠️ Disciplinar", row: 11 },
  { text: "   🕒 Horas Extras", row: 13 },
  { text: "   📊 Relatorios", row: 15 },
  { text: "   🚪 Sair (Logoff)", row: 22 }
];

// Helper to apply the dark sidebar to a worksheet
function applySidebar(ws, activeIndex) {
  // Column widths: A=6, B=12, C=6
  ws.getColumn(1).width = 6;
  ws.getColumn(2).width = 12;
  ws.getColumn(3).width = 6;
  ws.getColumn(4).width = 3; // Spacer column

  // Paint columns A-C dark slate
  for (let r = 1; r <= 45; r++) {
    for (let c = 1; c <= 3; c++) {
      const cell = ws.getCell(r, c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: DARK_SLATE }
      };
    }
  }

  // Draw Sidebar Logo/Title
  ws.mergeCells(2, 1, 3, 3);
  const logo = ws.getCell(2, 1);
  logo.value = "ADV LIRA";
  logo.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFF' } };
  logo.alignment = { vertical: 'middle', horizontal: 'center' };

  // Draw Menu Options
  menuItems.forEach((item, index) => {
    ws.mergeCells(item.row, 1, item.row, 3);
    const cell = ws.getCell(item.row, 1);
    cell.value = item.text;
    
    // Highlight active sheet
    if (index === activeIndex) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: ACTIVE_BG }
      };
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '38BDF8' } }; // Light blue text for active
    } else {
      cell.font = { name: 'Segoe UI', size: 10, color: { argb: MENU_TEXT } };
    }
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });
}

// Helper to draw top banner
function drawTopBanner(ws, title) {
  ws.mergeCells(2, 5, 3, 15);
  const header = ws.getCell(2, 5);
  header.value = title;
  header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: HEADER_BLUE }
  };
  header.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  header.alignment = { vertical: 'middle', horizontal: 'center' };
}

// Create DASHBOARD
const wsDash = workbook.addWorksheet('DASHBOARD');
applySidebar(wsDash, 0);
drawTopBanner(wsDash, "PAINEL DE INDICADORES DE RECURSOS HUMANOS");

// KPIs Cards (Columns E to L, Rows 5 to 8)
const kpis = [
  { title: "Ativos", formula: "=COUNTIF(DB_FUNCIONARIOS!AZ2:AZ5000, \"Ativo\")", colStart: 5, colEnd: 6 },
  { title: "Afastados", formula: "=COUNTIF(DB_FUNCIONARIOS!AZ2:AZ5000, \"Afastado\")", colStart: 8, colEnd: 9 },
  { title: "Admissoes Ano", formula: "=COUNTIF(DB_FUNCIONARIOS!AL2:AL5000, \">=01/01/2026\")", colStart: 11, colEnd: 12 },
  { title: "Desligados Ano", formula: "=COUNTIF(DB_FUNCIONARIOS!AZ2:AZ5000, \"Desligado\")", colStart: 14, colEnd: 15 }
];

kpis.forEach(kpi => {
  wsDash.mergeCells(5, kpi.colStart, 5, kpi.colEnd);
  const titleCell = wsDash.getCell(5, kpi.colStart);
  titleCell.value = kpi.title;
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
  titleCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '64748B' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  wsDash.mergeCells(6, kpi.colStart, 8, kpi.colEnd);
  const valCell = wsDash.getCell(6, kpi.colStart);
  valCell.value = { formula: kpi.formula };
  valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CARD_BG } };
  valCell.font = { name: 'Segoe UI', size: 20, bold: true, color: { argb: HEADER_BLUE } };
  valCell.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Outer Border for KPI Card
  for (let r = 5; r <= 8; r++) {
    for (let c = kpi.colStart; c <= kpi.colEnd; c++) {
      const cell = wsDash.getCell(r, c);
      cell.border = {
        top: { style: 'thin', color: { argb: 'CBD5E1' } },
        left: { style: 'thin', color: { argb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
        right: { style: 'thin', color: { argb: 'CBD5E1' } }
      };
    }
  }
});

// Hidden Chart Data tables on columns Q-R (for support)
wsDash.getCell('Q2').value = "Area";
wsDash.getCell('R2').value = "Quantidade";
wsDash.getCell('Q3').value = "Diretoria";
wsDash.getCell('R3').value = { formula: '=COUNTIF(DB_FUNCIONARIOS!AN2:AN5000, "Diretoria")' };
wsDash.getCell('Q4').value = "Recursos Humanos";
wsDash.getCell('R4').value = { formula: '=COUNTIF(DB_FUNCIONARIOS!AN2:AN5000, "Recursos Humanos")' };
wsDash.getCell('Q5').value = "Juridico";
wsDash.getCell('R5').value = { formula: '=COUNTIF(DB_FUNCIONARIOS!AN2:AN5000, "Juridico")' };
wsDash.getCell('Q6').value = "Operacional";
wsDash.getCell('R6').value = { formula: '=COUNTIF(DB_FUNCIONARIOS!AN2:AN5000, "Operacional")' };
wsDash.getCell('Q7').value = "Financeiro";
wsDash.getCell('R7').value = { formula: '=COUNTIF(DB_FUNCIONARIOS!AN2:AN5000, "Financeiro")' };
wsDash.getCell('Q8').value = "Tecnologia";
wsDash.getCell('R8').value = { formula: '=COUNTIF(DB_FUNCIONARIOS!AN2:AN5000, "Tecnologia")' };

wsDash.getCell('Q10').value = "Status";
wsDash.getCell('R10').value = "Qtd";
wsDash.getCell('Q11').value = "Ativo";
wsDash.getCell('R11').value = { formula: '=COUNTIF(DB_FUNCIONARIOS!AZ2:AZ5000, "Ativo")' };
wsDash.getCell('Q12').value = "Afastado";
wsDash.getCell('R12').value = { formula: '=COUNTIF(DB_FUNCIONARIOS!AZ2:AZ5000, "Afastado")' };
wsDash.getCell('Q13').value = "Desligado";
wsDash.getCell('R13').value = { formula: '=COUNTIF(DB_FUNCIONARIOS!AZ2:AZ5000, "Desligado")' };

// Hide support columns Q & R visual settings (will be hidden by script or manual, let's format them small)
wsDash.getColumn(17).width = 2;
wsDash.getColumn(18).width = 2;

// Create CADASTRO
const wsCad = workbook.addWorksheet('CADASTRO');
applySidebar(wsCad, 1);
drawTopBanner(wsCad, "FICHA REGISTRO DE COLABORADOR");

// Search bar and status
wsCad.getCell('E5').value = "Buscar CPF ou Codigo:";
wsCad.getCell('E5').font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '334155' } };
wsCad.getCell('E5').alignment = { vertical: 'middle', horizontal: 'left' };

const searchCell = wsCad.getCell('F5');
searchCell.value = "";
searchCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
searchCell.border = {
  top: { style: 'thin', color: { argb: '0284C7' } },
  left: { style: 'thin', color: { argb: '0284C7' } },
  bottom: { style: 'thin', color: { argb: '0284C7' } },
  right: { style: 'thin', color: { argb: '0284C7' } }
};
wsCad.mergeCells(5, 6, 5, 8); // Merge search cell F5:H5

wsCad.mergeCells(5, 10, 5, 15);
const statusCell = wsCad.getCell(5, 10);
statusCell.value = "Aguardando busca ou novo cadastro...";
statusCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: '64748B' } };
statusCell.alignment = { vertical: 'middle', horizontal: 'left' };

// Fields layout for CADASTRO
const fieldsLayout = [
  // Left Column
  { row: 8, label: "Codigo:", colName: "F8:H8", cell: "F8" },
  { row: 9, label: "Nome Completo:", colName: "F9:H9", cell: "F9" },
  { row: 10, label: "RG:", colName: "F10:H10", cell: "F10" },
  { row: 11, label: "CPF:", colName: "F11:H11", cell: "F11" },
  { row: 12, label: "Nascimento:", colName: "F12:H12", cell: "F12" },
  { row: 13, label: "Estado Civil:", colName: "F13:H13", cell: "F13" },
  { row: 14, label: "Sexo:", colName: "F14:H14", cell: "F14" },
  { row: 15, label: "Telefone:", colName: "F15:H15", cell: "F15" },
  { row: 16, label: "E-mail:", colName: "F16:H16", cell: "F16" },
  { row: 17, label: "CEP:", colName: "F17:H17", cell: "F17" },
  { row: 18, label: "Endereco:", colName: "F18:H18", cell: "F18" },
  { row: 19, label: "Numero / Compl:", colName: "F19:H19", cell: "F19" },
  { row: 20, label: "Bairro:", colName: "F20:H20", cell: "F20" },
  { row: 21, label: "Cidade:", colName: "F21:H21", cell: "F21" },
  { row: 22, label: "Estado / Pais:", colName: "F22:H22", cell: "F22" },
  { row: 23, label: "Nome da Mae:", colName: "F23:H23", cell: "F23" },
  { row: 24, label: "Nome do Pai:", colName: "F24:H24", cell: "F24" },
  { row: 25, label: "Dependentes:", colName: "F25:H25", cell: "F25" },

  // Right Column
  { row: 16, label: "Possui Deficiencia?", colName: "L16:O16", cell: "L16" },
  { row: 17, label: "Tipo Deficiencia:", colName: "L17:O17", cell: "L17" },
  { row: 18, label: "Escolaridade:", colName: "L18:O18", cell: "L18" },
  { row: 19, label: "Cargo / Funcao:", colName: "L19:O19", cell: "L19" },
  { row: 20, label: "Area / Depto:", colName: "L20:O20", cell: "L20" },
  { row: 21, label: "Gestor Imediato:", colName: "L21:O21", cell: "L21" },
  { row: 22, label: "Data Admissao:", colName: "L22:O22", cell: "L22" },
  { row: 23, label: "Salario Inicial:", colName: "L23:O23", cell: "L23" },
  { row: 24, label: "Salario Atual:", colName: "L24:O24", cell: "L24" },
  { row: 25, label: "PIS / PASEP:", colName: "L25:O25", cell: "L25" },
  { row: 26, label: "CTPS / Serie / UF:", colName: "L26:O26", cell: "L26" },
  { row: 27, label: "Status:", colName: "L27:O27", cell: "L27" }
];

// Formatting columns width
wsCad.getColumn(5).width = 16;  // Left labels
wsCad.getColumn(6).width = 10;  // Input cells
wsCad.getColumn(7).width = 10;
wsCad.getColumn(8).width = 10;
wsCad.getColumn(9).width = 3;   // Gap
wsCad.getColumn(10).width = 3;
wsCad.getColumn(11).width = 18; // Right labels
wsCad.getColumn(12).width = 10; // Right inputs
wsCad.getColumn(13).width = 10;
wsCad.getColumn(14).width = 10;
wsCad.getColumn(15).width = 10;

fieldsLayout.forEach(field => {
  // Write label
  const labelCellCol = field.colName.startsWith("F") ? 5 : 11;
  const labelCell = wsCad.getCell(field.row, labelCellCol);
  labelCell.value = field.label;
  labelCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '475569' } };
  labelCell.alignment = { vertical: 'middle', horizontal: 'right' };

  // Format merged input cells
  wsCad.mergeCells(field.row, labelCellCol + 1, field.row, labelCellCol + (field.colName.startsWith("F") ? 3 : 4));
  const inpCell = wsCad.getCell(field.row, labelCellCol + 1);
  inpCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
  inpCell.font = { name: 'Segoe UI', size: 10, color: { argb: '1E293B' } };
  inpCell.alignment = { vertical: 'middle', horizontal: 'left' };
  
  // Thin border around input box
  const startCol = labelCellCol + 1;
  const endCol = labelCellCol + (field.colName.startsWith("F") ? 3 : 4);
  for (let c = startCol; c <= endCol; c++) {
    const cCell = wsCad.getCell(field.row, c);
    cCell.border = {
      top: { style: 'thin', color: { argb: FIELD_BORDER } },
      left: { style: 'thin', color: { argb: FIELD_BORDER } },
      bottom: { style: 'thin', color: { argb: FIELD_BORDER } },
      right: { style: 'thin', color: { argb: FIELD_BORDER } }
    };
  }
});

// Section 3: Benefits & Observations
wsCad.mergeCells(29, 5, 29, 15);
const subSec = wsCad.getCell(29, 5);
subSec.value = "BENEFICIOS E INFORMACOES COMPLEMENTARES";
subSec.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
subSec.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '334155' } };
subSec.alignment = { vertical: 'middle', horizontal: 'center' };

// Benefits Checkboxes (represented as cells with Dropdowns Yes/No)
const benefits = [
  { row: 31, label: "Vale Transporte:", cell: "F31" },
  { row: 32, label: "Vale Refeicao:", cell: "F32" },
  { row: 33, label: "Vale Alimentacao:", cell: "F33" },
  { row: 34, label: "Plano de Saude:", cell: "F34" },
  { row: 35, label: "Plano Odonto:", cell: "F35" },
  { row: 36, label: "Seguro de Vida:", cell: "F36" }
];

benefits.forEach(b => {
  const lbl = wsCad.getCell(b.row, 5);
  lbl.value = b.label;
  lbl.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '475569' } };
  lbl.alignment = { vertical: 'middle', horizontal: 'right' };

  wsCad.mergeCells(b.row, 6, b.row, 8);
  const val = wsCad.getCell(b.row, 6);
  val.value = "Nao"; // Default
  val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
  val.font = { name: 'Segoe UI', size: 10, color: { argb: '1E293B' } };
  val.alignment = { vertical: 'middle', horizontal: 'left' };
  
  for (let c = 6; c <= 8; c++) {
    const cCell = wsCad.getCell(b.row, c);
    cCell.border = {
      top: { style: 'thin', color: { argb: FIELD_BORDER } },
      left: { style: 'thin', color: { argb: FIELD_BORDER } },
      bottom: { style: 'thin', color: { argb: FIELD_BORDER } },
      right: { style: 'thin', color: { argb: FIELD_BORDER } }
    };
  }
});

// Observations
const lblObs = wsCad.getCell(31, 10);
lblObs.value = "Observacoes:";
lblObs.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '475569' } };
lblObs.alignment = { vertical: 'middle', horizontal: 'right' };

wsCad.mergeCells(31, 11, 36, 15);
const valObs = wsCad.getCell(31, 11);
valObs.value = "";
valObs.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
valObs.font = { name: 'Segoe UI', size: 10, color: { argb: '1E293B' } };
valObs.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

for (let r = 31; r <= 36; r++) {
  for (let c = 11; c <= 15; c++) {
    const cCell = wsCad.getCell(r, c);
    cCell.border = {
      top: { style: 'thin', color: { argb: FIELD_BORDER } },
      left: { style: 'thin', color: { argb: FIELD_BORDER } },
      bottom: { style: 'thin', color: { argb: FIELD_BORDER } },
      right: { style: 'thin', color: { argb: FIELD_BORDER } }
    };
  }
}

// Cell placeholders for buttons positioning reference
wsDash.getRow(38).height = 30;
wsCad.getRow(38).height = 30;

// Create AFASTAMENTOS
const wsAf = workbook.addWorksheet('AFASTAMENTOS');
applySidebar(wsAf, 2);
drawTopBanner(wsAf, "HISTORICO DE AFASTAMENTOS & LICENCAS");
// Setup table header
const afHeaders = ["Codigo", "Nome Colaborador", "Data Inicio", "Data Fim", "Tipo Afastamento", "Descricao", "Status"];
afHeaders.forEach((h, i) => {
  const cell = wsAf.getCell(5, 5 + i);
  cell.value = h;
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '475569' } };
  cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
});
wsAf.getColumn(5).width = 10;
wsAf.getColumn(6).width = 25;
wsAf.getColumn(7).width = 12;
wsAf.getColumn(8).width = 12;
wsAf.getColumn(9).width = 18;
wsAf.getColumn(10).width = 25;
wsAf.getColumn(11).width = 12;

// Create DISCIPLINAR
const wsDisc = workbook.addWorksheet('DISCIPLINAR');
applySidebar(wsDisc, 3);
drawTopBanner(wsDisc, "CONTROLE DE PENALIDADES DISCIPLINARES");
const discHeaders = ["Codigo", "Nome Colaborador", "Data Ocorrencia", "Tipo Penalidade", "Descricao / Motivo", "Gestor Solicitante"];
discHeaders.forEach((h, i) => {
  const cell = wsDisc.getCell(5, 5 + i);
  cell.value = h;
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '475569' } };
  cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
});
wsDisc.getColumn(5).width = 10;
wsDisc.getColumn(6).width = 25;
wsDisc.getColumn(7).width = 15;
wsDisc.getColumn(8).width = 18;
wsDisc.getColumn(9).width = 30;
wsDisc.getColumn(10).width = 20;

// Create HORAS_EXTRAS
const wsHe = workbook.addWorksheet('HORAS_EXTRAS');
applySidebar(wsHe, 4);
drawTopBanner(wsHe, "CONTROLE DE HORAS EXTRAS & BANCO DE HORAS");
const heHeaders = ["Codigo", "Nome Colaborador", "Data Ocorrencia", "Horas Extras (h)", "Horas Atraso (h)", "Justificativa"];
heHeaders.forEach((h, i) => {
  const cell = wsHe.getCell(5, 5 + i);
  cell.value = h;
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '475569' } };
  cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
});
wsHe.getColumn(5).width = 10;
wsHe.getColumn(6).width = 25;
wsHe.getColumn(7).width = 15;
wsHe.getColumn(8).width = 15;
wsHe.getColumn(9).width = 15;
wsHe.getColumn(10).width = 30;

// Create RELATORIOS
const wsRel = workbook.addWorksheet('RELATORIOS');
applySidebar(wsRel, 5);
drawTopBanner(wsRel, "PAINEL DE EXPORTACAO E RELATORIOS GERENCIAIS");

// Search Card in RELATORIOS (to display ficha preview)
wsRel.mergeCells(5, 5, 5, 14);
const cardTitle = wsRel.getCell(5, 5);
cardTitle.value = "FICHA INDIVIDUAL DO COLABORADOR (PREVIEW)";
cardTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
cardTitle.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
cardTitle.alignment = { vertical: 'middle', horizontal: 'center' };

// Search input inside RELATORIOS
wsRel.getCell('E7').value = "Buscar Codigo:";
wsRel.getCell('E7').font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '475569' } };
wsRel.getCell('E7').alignment = { vertical: 'middle', horizontal: 'right' };

wsRel.mergeCells(7, 6, 7, 7);
const rSearch = wsRel.getCell('H4'); // Bound to H4 internally for backward compatibility
rSearch.value = "F0001"; // Default
rSearch.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
rSearch.font = { name: 'Segoe UI', size: 10, color: { argb: '1E293B' } };
rSearch.border = {
  top: { style: 'thin', color: { argb: '0284C7' } },
  left: { style: 'thin', color: { argb: '0284C7' } },
  bottom: { style: 'thin', color: { argb: '0284C7' } },
  right: { style: 'thin', color: { argb: '0284C7' } }
};

// Preview Card grid setup
const previewFields = [
  { r: 9, c1: 5, label: "Nome:", c2: 6, mergeTo: 8, valFormula: '=XLOOKUP(H4, DB_FUNCIONARIOS!E:E, DB_FUNCIONARIOS!F:F, "Nao Localizado")' },
  { r: 9, c1: 10, label: "Cargo:", c2: 11, mergeTo: 14, valFormula: '=XLOOKUP(H4, DB_FUNCIONARIOS!E:E, DB_FUNCIONARIOS!AM:AM, "-")' },
  
  { r: 10, c1: 5, label: "CPF:", c2: 6, mergeTo: 8, valFormula: '=XLOOKUP(H4, DB_FUNCIONARIOS!E:E, DB_FUNCIONARIOS!H:H, "-")' },
  { r: 10, c1: 10, label: "Admissao:", c2: 11, mergeTo: 14, valFormula: '=XLOOKUP(H4, DB_FUNCIONARIOS!E:E, DB_FUNCIONARIOS!AL:AL, "-")' },
  
  { r: 11, c1: 5, label: "Telefone:", c2: 6, mergeTo: 8, valFormula: '=XLOOKUP(H4, DB_FUNCIONARIOS!E:E, DB_FUNCIONARIOS!L:L, "-")' },
  { r: 11, c1: 10, label: "Email:", c2: 11, mergeTo: 14, valFormula: '=XLOOKUP(H4, DB_FUNCIONARIOS!E:E, DB_FUNCIONARIOS!K:K, "-")' },
  
  { r: 12, c1: 5, label: "Salario Atual:", c2: 6, mergeTo: 8, valFormula: '=XLOOKUP(H4, DB_FUNCIONARIOS!E:E, DB_FUNCIONARIOS!AS:AS, 0)' },
  { r: 12, c1: 10, label: "Status:", c2: 11, mergeTo: 14, valFormula: '=XLOOKUP(H4, DB_FUNCIONARIOS!E:E, DB_FUNCIONARIOS!AZ:AZ, "-")' }
];

wsRel.getColumn(10).width = 12;

previewFields.forEach(f => {
  const lbl = wsRel.getCell(f.r, f.c1);
  lbl.value = f.label;
  lbl.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '64748B' } };
  lbl.alignment = { vertical: 'middle', horizontal: 'right' };

  wsRel.mergeCells(f.r, f.c2, f.r, f.mergeTo);
  const val = wsRel.getCell(f.r, f.c2);
  val.value = { formula: f.valFormula };
  val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
  val.font = { name: 'Segoe UI', size: 10, color: { argb: '1E293B' } };
  val.alignment = { vertical: 'middle', horizontal: 'left' };
  
  // Format border for preview cards
  for (let c = f.c2; c <= f.mergeTo; c++) {
    const cCell = wsRel.getCell(f.r, c);
    cCell.border = {
      top: { style: 'thin', color: { argb: 'E2E8F0' } },
      left: { style: 'thin', color: { argb: 'E2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
      right: { style: 'thin', color: { argb: 'E2E8F0' } }
    };
  }
});

// Hide row/col headers visual placeholder
wsRel.getCell('H7').value = { formula: '=XLOOKUP(H4, DB_FUNCIONARIOS!E:E, DB_FUNCIONARIOS!F:F, "Vazio")' }; // Legacy cell bound to H7

// Add export buttons areas
wsRel.getRow(15).height = 30;
wsRel.getRow(20).height = 30;

// Create DB_FUNCIONARIOS (Hidden Database)
const wsDbFunc = workbook.addWorksheet('DB_FUNCIONARIOS');
const dbColumns = [
  "Codigo", "Nome Completo", "RG", "CPF", "Data Nascimento", "Estado Civil", "E-mail", "Telefone",
  "Endereco", "Numero", "Complemento", "Bairro", "Cidade", "Estado", "CEP", "Nome da Mae", "Nome do Pai",
  "Dependentes", "Possui Deficiencia", "Tipo Deficiencia", "Caminho Foto", "Observacoes", "Pais", "Sexo",
  "Altura", "Escolaridade", "Profissao", "Empresa", "PIS", "CTPS", "Serie", "UF Documento", "Data Emissao",
  "Data Admissao", "Cargo", "Area", "Departamento", "Gestor", "Atividades", "Salario Inicial", "Salario Atual",
  "Vale Transporte", "Vale Refeicao", "Vale Alimentacao", "Plano de Saude", "Plano Odontologico", "Seguro de Vida", "Status"
];

// Write header to column E (Col 5) onwards to match CRUD
dbColumns.forEach((col, idx) => {
  const cell = wsDbFunc.getCell(1, 5 + idx);
  cell.value = col;
  cell.font = { bold: true };
});

// Seed 10 mock employees
const mockEmployees = [
  ["F0001", "Lucas de Melo Silva", "11.222.333-4", "111.222.333-44", "15/04/1990", "Casado(a)", "lucas.melo@empresa.com", "(11) 98888-7777", "Av Paulista", "1000", "Apto 12", "Bela Vista", "Sao Paulo", "SP", "01311-100", "Maria de Melo", "Jose Silva", "1", "Nao", "", "", "Nenhuma", "Brasil", "Masculino", "1.75", "Superior Completo", "Advogado", "ADV Lira Melo", "123.45678.90-1", "98765", "001-A", "SP", "10/10/2015", "01/03/2026", "Advogado Pleno", "Juridico", "Contencioso", "Dr. Lira Melo", "Audiencias e peticoes", 5000, 5200, "Sim", "Sim", "Nao", "Sim", "Sim", "Nao", "Ativo"],
  ["F0002", "Camila Lira Santos", "22.333.444-5", "222.333.444-55", "22/08/1993", "Solteiro(a)", "camila.lira@empresa.com", "(11) 97777-6666", "Rua Augusta", "500", "", "Consolacao", "Sao Paulo", "SP", "01305-000", "Ana Lira", "Carlos Santos", "0", "Nao", "", "", "Ficha limpa", "Brasil", "Feminino", "1.65", "Pós-Graduação", "Controller", "ADV Lira Melo", "234.56789.01-2", "87654", "002-B", "SP", "12/11/2016", "15/04/2026", "Controller Juridico", "Financeiro", "Administrativo", "Dr. Lira Melo", "Fluxo de caixa e relatorios", 6000, 6000, "Nao", "Sim", "Sim", "Sim", "Nao", "Sim", "Ativo"],
  ["F0003", "Felipe Santos Oliveira", "33.444.555-6", "333.444.555-66", "10/12/1988", "Casado(a)", "felipe.santos@empresa.com", "(11) 96666-5555", "Av Consolacao", "2000", "Sala 3", "Cerqueira Cesar", "Sao Paulo", "SP", "01416-000", "Julia Santos", "Marcos Oliveira", "2", "Nao", "", "", "Destaque do ano", "Brasil", "Masculino", "1.80", "Superior Completo", "TI Specialist", "ADV Lira Melo", "345.67890.12-3", "76543", "003-C", "SP", "05/05/2018", "01/05/2026", "Analista de TI", "Tecnologia", "TI", "Dr. Lira Melo", "Suporte a servidores e rede", 4500, 4800, "Sim", "Sim", "Nao", "Sim", "Sim", "Nao", "Ativo"],
  ["F0004", "Juliana Ribeiro Costa", "44.555.666-7", "444.555.666-77", "05/02/1995", "Solteiro(a)", "juliana.costa@empresa.com", "(11) 95555-4444", "Alameda Santos", "800", "Apto 84", "Jardins", "Sao Paulo", "SP", "01419-001", "Lucia Ribeiro", "Paulo Costa", "0", "Nao", "", "", "Nenhuma", "Brasil", "Feminino", "1.68", "Superior Incompleto", "Estagiaria", "ADV Lira Melo", "456.78901.23-4", "65432", "004-D", "SP", "20/01/2020", "01/06/2026", "Estagiario", "Diretoria", "Juridico", "Dr. Lira Melo", "Apoio a peticoes e arquivo", 1500, 1500, "Sim", "Nao", "Sim", "Sim", "Nao", "Nao", "Ativo"],
  ["F0005", "Bruno Souza Lima", "55.666.777-8", "555.666.777-88", "30/09/1985", "Divorciado(a)", "bruno.lima@empresa.com", "(11) 94444-3333", "Rua Pamplona", "1200", "", "Jardim Paulista", "Sao Paulo", "SP", "01405-001", "Beatriz Souza", "Andre Lima", "1", "Nao", "", "", "Diligente", "Brasil", "Masculino", "1.78", "Superior Completo", "Gerente RH", "ADV Lira Melo", "567.89012.34-5", "54321", "005-E", "SP", "15/09/2010", "10/01/2026", "Gerente de RH", "Recursos Humanos", "RH", "Dr. Lira Melo", "Recrutamento e folha", 8000, 8500, "Nao", "Sim", "Sim", "Sim", "Sim", "Sim", "Ativo"],
  ["F0006", "Amanda Oliveira Mello", "66.777.888-9", "666.777.888-99", "12/03/1991", "Solteiro(a)", "amanda.mello@empresa.com", "(21) 99999-8888", "Av Atlantica", "400", "Cob 01", "Copacabana", "Rio de Janeiro", "RJ", "22020-002", "Carla Oliveira", "Ricardo Mello", "0", "Nao", "", "", "Home office", "Brasil", "Feminino", "1.70", "Superior Completo", "Advogada Trabalhista", "ADV Lira Melo", "678.90123.45-6", "43210", "006-F", "RJ", "02/02/2017", "01/02/2026", "Advogado Pleno", "Juridico", "Trabalhista", "Dr. Lira Melo", "Processos trabalhistas", 5200, 5200, "Nao", "Sim", "Nao", "Sim", "Nao", "Nao", "Ativo"],
  ["F0007", "Rafael Costa Rocha", "77.888.999-0", "777.888.999-00", "12/06/1994", "Casado(a)", "rafael.rocha@empresa.com", "(11) 93333-2222", "Rua Bela Cintra", "1500", "Apto 91", "Consolacao", "Sao Paulo", "SP", "01415-001", "Sandra Costa", "Arthur Rocha", "1", "Nao", "", "", "Destaque Junho", "Brasil", "Masculino", "1.76", "Superior Completo", "Analista Financeiro", "ADV Lira Melo", "789.01234.56-7", "32109", "007-G", "SP", "18/06/2019", "01/01/2026", "Analista Financeiro Jr", "Financeiro", "Contas a Pagar", "Camila Lira Santos", "Controle de notas e faturas", 3500, 3700, "Sim", "Sim", "Nao", "Sim", "Sim", "Nao", "Ativo"],
  ["F0008", "Mariana Rocha Rezende", "88.999.000-1", "888.999.000-11", "25/07/1992", "Solteiro(a)", "mariana.rezende@empresa.com", "(31) 98888-5555", "Av Afonso Pena", "3000", "", "Centro", "Belo Horizonte", "MG", "30130-009", "Marta Rocha", "Eduardo Rezende", "0", "Nao", "", "", "Filial BH", "Brasil", "Feminino", "1.62", "Ensino Medio", "Secretaria", "ADV Lira Melo", "890.12345.67-8", "21098", "008-H", "MG", "09/09/2015", "01/04/2026", "Secretaria Executiva", "Operacional", "Secretaria", "Dr. Lira Melo", "Atendimento e agenda", 2500, 2500, "Sim", "Sim", "Nao", "Sim", "Nao", "Nao", "Ativo"],
  ["F0009", "Gustavo Lima Nogueira", "99.000.111-2", "999.000.111-22", "18/11/1987", "Casado(a)", "gustavo.nogueira@empresa.com", "(11) 92222-1111", "Rua Haddock Lobo", "600", "Apto 32", "Cerqueira Cesar", "Sao Paulo", "SP", "01414-001", "Regina Lima", "Newton Nogueira", "3", "Nao", "", "", "Pai de 3", "Brasil", "Masculino", "1.82", "Pós-Graduação", "Advogado Tributario", "ADV Lira Melo", "901.23456.78-9", "10987", "009-I", "SP", "30/11/2012", "01/01/2026", "Advogado Senior", "Juridico", "Tributario", "Dr. Lira Melo", "Pareceres e defesas fiscais", 8500, 9000, "Nao", "Sim", "Sim", "Sim", "Sim", "Sim", "Ativo"],
  ["F0010", "Beatriz Almeida Silveira", "12.345.678-9", "123.456.789-01", "03/11/1996", "Solteiro(a)", "beatriz.silveira@empresa.com", "(11) 91111-0000", "Rua da Consolacao", "2500", "", "Consolacao", "Sao Paulo", "SP", "01301-100", "Sonia Almeida", "Renato Silveira", "0", "Nao", "", "", "Nenhuma", "Brasil", "Feminino", "1.67", "Ensino Tecnico", "Auxiliar RH", "ADV Lira Melo", "012.34567.89-0", "09876", "010-J", "SP", "12/12/2021", "15/05/2026", "Auxiliar de RH", "Recursos Humanos", "RH", "Bruno Souza Lima", "Controle de ponto e arquivos", 2000, 2000, "Sim", "Sim", "Nao", "Sim", "Nao", "Nao", "Ativo"]
];

mockEmployees.forEach((emp, rowIdx) => {
  emp.forEach((val, colIdx) => {
    const cell = wsDbFunc.getCell(rowIdx + 2, 5 + colIdx);
    cell.value = val;
  });
});

// Create other DB sheets
const wsDbAf = workbook.addWorksheet('DB_AFASTAMENTOS');
wsDbAf.getCell('E1').value = "Codigo";
wsDbAf.getCell('F1').value = "Nome";
wsDbAf.getCell('G1').value = "Data Inicio";
wsDbAf.getCell('H1').value = "Data Fim";
wsDbAf.getCell('I1').value = "Tipo";
wsDbAf.getCell('J1').value = "Descricao";
wsDbAf.getCell('K1').value = "Status";

const wsDbDisc = workbook.addWorksheet('DB_DISCIPLINAR');
wsDbDisc.getCell('E1').value = "Codigo";
wsDbDisc.getCell('F1').value = "Nome";
wsDbDisc.getCell('G1').value = "Data";
wsDbDisc.getCell('H1').value = "Tipo";
wsDbDisc.getCell('I1').value = "Descricao";
wsDbDisc.getCell('J1').value = "Gestor";

const wsDbHe = workbook.addWorksheet('DB_HORAS_EXTRAS');
wsDbHe.getCell('E1').value = "Codigo";
wsDbHe.getCell('F1').value = "Nome";
wsDbHe.getCell('G1').value = "Data";
wsDbHe.getCell('H1').value = "Horas Extras";
wsDbHe.getCell('I1').value = "Horas Atraso";
wsDbHe.getCell('J1').value = "Justificativa";

// Save workbook
workbook.xlsx.writeFile(finalFile)
  .then(() => {
    console.log("ADV Lira Melo base Excel workbook (v2) successfully generated at: " + finalFile);
  })
  .catch(err => {
    console.error("Error generating workbook: ", err);
    process.exit(1);
  });
