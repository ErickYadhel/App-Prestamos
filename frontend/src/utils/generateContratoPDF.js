import jsPDF from 'jspdf';

// ─────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────

const determinarGenero = (nombre) => {
  if (!nombre) return { deudor: 'DEUDOR', elLa: 'EL', le: 'LE', cliente: 'Senor' };
  const n = nombre.toLowerCase();
  const femeninos = [
    'maria','josefina','ana','rosa','marta','lucia','carmen','isabel',
    'patricia','carolina','julia','laura','sofia','valentina','camila',
    'milagros','katherin','yenny','jenny','paola','andrea','claudia',
    'diana','monica','sandra','gabriela','alejandra','natalia','jessica'
  ];
  const esFemenino = femeninos.some(f => n.includes(f));
  return {
    deudor  : esFemenino ? 'DEUDORA'  : 'DEUDOR',
    elLa    : esFemenino ? 'LA'       : 'EL',
    le      : 'LE',
    cliente : esFemenino ? 'Senora'   : 'Senor'
  };
};

const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  return [
    String(d.getDate()).padStart(2,'0'),
    String(d.getMonth()+1).padStart(2,'0'),
    d.getFullYear()
  ].join('/');
};

function numberToWords(num) {
  if (!num || num === 0) return 'CERO';
  const uni = ['','UN','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
  const esp = ['DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISEIS',
               'DIECISIETE','DIECIOCHO','DIECINUEVE'];
  const dec = ['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA',
               'SESENTA','SETENTA','OCHENTA','NOVENTA'];
  const cen = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS',
               'SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  const conv = (n) => {
    if (n === 0) return '';
    if (n < 10) return uni[n];
    if (n < 20) return esp[n-10];
    if (n < 100) { const d=Math.floor(n/10),u=n%10; return dec[d]+(u?' Y '+uni[u]:''); }
    if (n < 1000) { const c=Math.floor(n/100),r=n%100; return (c===1&&r===0)?'CIEN':cen[c]+(r?' '+conv(r):''); }
    if (n < 1000000) {
      const m=Math.floor(n/1000),r=n%1000;
      return (m===1?'MIL':conv(m)+' MIL')+(r?' '+conv(r):'');
    }
    return conv(Math.floor(n/1000000))+' MILLONES'+(n%1000000?' '+conv(n%1000000):'');
  };
  return conv(Math.floor(num));
}

// ─────────────────────────────────────────────────────────────
// MOTOR DE PARRAFOS CON NEGRITA INLINE
//
// REGLA DE ORO: cada segmento de texto en el array `partes`
// debe incluir el espacio que le corresponde dentro de su propio
// string. No se agregan espacios automáticos entre segmentos para
// evitar dobles espacios o falta de espacios.
//
// Convencion:
//   Texto normal que va ANTES de un bold → termina con ' '
//   Texto normal que va DESPUES de un bold → empieza con ' '
//   Texto bold → sin espacios extra (los lleva el segmento adyacente)
// ─────────────────────────────────────────────────────────────

function buildTokens(partes) {
  const tokens = [];
  partes.forEach(({ text, bold }) => {
    if (!text) return;
    // Dividir preservando espacios como tokens separados
    const chunks = text.split(/( +)/);
    chunks.forEach(ch => {
      if (ch === '') return;
      tokens.push({ word: ch, bold: !!bold });
    });
  });
  return tokens;
}

function writeRichParagraph(doc, partes, x, maxWidth, yPos, fontSize, lineHeightFactor) {
  if (lineHeightFactor === undefined) lineHeightFactor = 1.55;
  doc.setFontSize(fontSize);
  const lh = fontSize * lineHeightFactor * (25.4 / 72);

  const tokens = buildTokens(partes);

  const lines = [];
  let line = [], lineW = 0;

  tokens.forEach(function(tok) {
    var word = tok.word, bold = tok.bold;
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    var w = doc.getTextWidth(word);

    // No comenzar línea con espacios
    if (/^ +$/.test(word) && line.length === 0) return;

    if (lineW + w > maxWidth && line.length > 0) {
      lines.push(line);
      if (/^ +$/.test(word)) {
        line = []; lineW = 0;
      } else {
        line = [{ word: word, bold: bold }];
        lineW = w;
      }
    } else {
      line.push({ word: word, bold: bold });
      lineW += w;
    }
  });
  if (line.length > 0) lines.push(line);

  lines.forEach(function(ln) {
    var cx = x;
    ln.forEach(function(tok) {
      doc.setFont('helvetica', tok.bold ? 'bold' : 'normal');
      doc.text(tok.word, cx, yPos);
      cx += doc.getTextWidth(tok.word);
    });
    yPos += lh;
  });

  return yPos;
}

// ─────────────────────────────────────────────────────────────
// CAJA DE FIRMA VISUAL (solo caracteres ASCII, sin emojis)
// ─────────────────────────────────────────────────────────────

function drawSignatureBox(doc, x, y, w, h, label) {
  doc.setFillColor(252, 252, 254);
  doc.setDrawColor(55, 55, 55);
  doc.setLineWidth(0.45);
  doc.rect(x, y, w, h, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(145, 145, 145);
  doc.text('Firma aqui', x + 4, y + 6);

  // Icono lapiz con lineas simples
  var px = x + w - 9, py = y + 3.5;
  doc.setDrawColor(165, 165, 165);
  doc.setLineWidth(0.35);
  doc.line(px,     py + 4, px + 3, py);
  doc.line(px + 3, py,     px + 4, py + 1);
  doc.line(px + 4, py + 1, px,     py + 4);

  // Linea para firmar
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.line(x + 4, y + h - 8, x + w - 4, y + h - 8);

  // Etiqueta inferior
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(88, 88, 88);
  doc.text(label, x + 4, y + h - 2.5);

  doc.setTextColor(0, 0, 0);
}

// ─────────────────────────────────────────────────────────────
// SALTO DE PAGINA AUTOMATICO
// ─────────────────────────────────────────────────────────────

function checkBreak(doc, y, needed, marginTop, pageH) {
  if (y + needed > pageH - 20) {
    doc.addPage();
    return marginTop + 5;
  }
  return y;
}

// ─────────────────────────────────────────────────────────────
// GENERADOR PRINCIPAL
// ─────────────────────────────────────────────────────────────

export const generarContratoPDF = (datos) => {
  var doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  var PW  = doc.internal.pageSize.getWidth();
  var PH  = doc.internal.pageSize.getHeight();
  var ML  = 20;
  var MR  = 20;
  var CW  = PW - ML - MR;
  var cb  = function(y, need) { return checkBreak(doc, y, need, ML, PH); };

  var fechaHoy      = formatearFecha(new Date());
  var nombreCliente = (datos.clienteNombre || '').trim();
  var cedula        = (datos.cedula        || 'No especificada').trim();
  var direccion     = (datos.direccion     || 'No especificada').trim();
  var montoNum      = parseFloat(datos.monto)   || 0;
  var interesNum    = parseFloat(datos.interes) || 10;
  var frecuencia    = (datos.frecuencia || 'quincenal').toLowerCase();
  var genero        = determinarGenero(nombreCliente);

  var tieneGarante  = !!(datos.garanteNombre &&
    datos.garanteNombre.trim() !== '' &&
    datos.garanteNombre !== 'No especificado');

  var frecDisplay = frecuencia.charAt(0).toUpperCase() + frecuencia.slice(1);
  var frecAdv     = frecuencia === 'quincenal' ? 'quincenalmente'
                  : frecuencia === 'mensual'   ? 'mensualmente'
                  : frecuencia === 'semanal'   ? 'semanalmente' : 'diariamente';
  var diasPago    = frecuencia === 'quincenal' ? 'los dias 15 y 30 de cada mes'
                  : frecuencia === 'mensual'   ? 'el mismo dia de cada mes'
                  : frecuencia === 'semanal'   ? 'el mismo dia de cada semana' : 'diariamente';
  var fechaPP     = datos.fechaPrimerPago
                    ? formatearFecha(datos.fechaPrimerPago)
                    : formatearFecha(new Date());

  var y = 18;

  // ══════════════════════════════════════
  // TITULO
  // ══════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('DOCUMENTO DE PRESTAMO', PW / 2, y, { align: 'center' });
  y += 3;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  doc.line(ML, y, PW - MR, y);
  y += 8;

  // ══════════════════════════════════════
  // PARRAFO INTRODUCTORIO
  //
  // REGLA DE ESPACIADO APLICADA:
  //   - Los textos normales terminan con ' ' antes de un campo bold
  //   - Los textos normales empiezan con ' ' despues de un campo bold
  //   - Los campos bold NO tienen espacios extra propios
  // ══════════════════════════════════════
  y = cb(y, 30);
  y = writeRichParagraph(doc, [
    { text: 'Este documento de prestamo (en adelante, el "Acuerdo") se celebra en la fecha ' },
    { text: fechaHoy, bold: true },
    { text: ', por y entre S&E Inversiones (' },
    { text: 'Erick Perez', bold: true },
    { text: '), con domicilio en Santo Domingo, D.N, y la ' + genero.cliente + ' ' },
    { text: nombreCliente, bold: true },
    { text: ', Dominicana, mayor de edad portador de la cedula de identidad y electoral No. ' },
    { text: cedula, bold: true },
    { text: ' (en adelante, la "Deudora"), con domicilio en ' },
    { text: direccion, bold: true },
    { text: ' persona en lo adelante del presente contrato se denomina como ' },
    { text: 'LA ' + genero.deudor, bold: true },
    { text: ' o por su nombre completo;' },
  ], ML, CW, y, 9.5);
  y += 3;

  // ══════════════════════════════════════
  // FIADOR — solo mencion textual, SIN caja de firma
  // ══════════════════════════════════════
  if (tieneGarante) {
    y = cb(y, 16);
    y = writeRichParagraph(doc, [
      { text: 'Y el senor ' },
      { text: datos.garanteNombre, bold: true },
      { text: ', de nacionalidad Dominicana, Mayor de edad portador de la cedula No. ' },
      { text: datos.garanteCedula || 'No especificada', bold: true },
      { text: ', quien en lo adelante se denominara ' },
      { text: 'El Fiador Solidario', bold: true },
      { text: '.' },
    ], ML, CW, y, 9.5);
    y += 3;
  }

  // ══════════════════════════════════════
  // MONTO
  // ══════════════════════════════════════
  y = cb(y, 12);
  y = writeRichParagraph(doc, [
    { text: 'El Prestamista prestara al Prestatario la cantidad de ' },
    { text: numberToWords(montoNum) + ' Pesos Dominicanos Con 00/100 RD$', bold: true },
  ], ML, CW, y, 9.5);
  y += 3;

  // ══════════════════════════════════════
  // POR CUANTO
  // ══════════════════════════════════════
  y = cb(y, 22);
  y = writeRichParagraph(doc, [
    { text: 'Por cuanto: ' },
    { text: 'Erick Perez (S&E Inversiones)', bold: true },
    { text: ' Ha manifestado su intencion de otorgarle a ' },
    { text: genero.elLa + ' ' + genero.deudor, bold: true },
    { text: ' el prestamo solicitado, sujeto a los terminos y condiciones que se establece en el presente contrato. Por tanto, y en el entendido de que el anterior preambulo forma parte integrante del presente Acto, las partes; Han convenido y pactado las siguientes condiciones:' },
  ], ML, CW, y, 9.5);
  y += 5;

  // ══════════════════════════════════════
  // CLAUSULAS NUMERADAS
  // Formato: "N. Titulo: texto del cuerpo"
  // El espacio entre titulo y cuerpo se garantiza con { text: ' ' }
  // ══════════════════════════════════════
  var clausulas = [
    {
      num: '1.', titulo: 'Monto del prestamo',
      cuerpo: [
        { text: 'El monto del prestamo es de ' },
        { text: montoNum.toLocaleString('es-DO') + ' Pesos Dominicano con 00/100 RD$', bold: true },
        { text: ' lo cual se le otorga al deudor quien acepta conforme.' },
      ]
    },
    {
      num: '2.', titulo: 'Intereses',
      cuerpo: [
        { text: 'El Prestamista cobrara intereses sobre el Prestamo a una tasa ' },
        { text: frecDisplay + ' del ' + interesNum + '%', bold: true },
        { text: ' (en adelante, la "Tasa de Interes"). Los intereses se calcularan y pagaran ' + frecAdv + ' sobre el saldo pendiente del Prestamo.' },
      ]
    },
    {
      num: '3.', titulo: 'Pagos',
      cuerpo: [
        { text: genero.elLa + ' ' + genero.deudor + ' realizara pagos ' + frecuencia + ' por el monto de la ' },
        { text: 'tasa de interes', bold: true },
        { text: ' el cual puede tambien incluir capital. El primer pago se realizara el dia ' },
        { text: fechaPP, bold: true },
        { text: ' y los siguientes pagos se realizaran ' + diasPago + '.' },
      ]
    },
    {
      num: '4.', titulo: 'Gastos y costos',
      cuerpo: [
        { text: genero.elLa + ' ' + genero.deudor + ' sera responsable de todos los gastos y costos relacionados con la obtencion y mantenimiento del Prestamo.' },
      ]
    },
  ];

  if (tieneGarante) {
    clausulas.push({
      num: '5.', titulo: 'Garantia',
      cuerpo: [
        { text: 'Fiador Solidario. - ' },
        { text: genero.deudor, bold: true },
        { text: ' presenta como fiador solidario al senor ' },
        { text: datos.garanteNombre, bold: true },
        { text: ', de generales que consta en el presente documento, quien acepta y asume todas las obligaciones contraidas por la deudora, en caso de que este dejara de cumplirlas.' },
      ]
    });
  }

  clausulas.push(
    {
      num: tieneGarante ? '6.' : '5.', titulo: 'Ley aplicable',
      cuerpo: [
        { text: 'Este Acuerdo se regira por las leyes del Estado de la Republica Dominicana y para lo no previsto en el mismo las partes se remiten a las disposiciones del derecho comun.' },
      ]
    },
    {
      num: tieneGarante ? '7.' : '6.', titulo: 'Causas de caducidad',
      cuerpo: [
        { text: 'en caso de que La ' },
        { text: 'DEUDORA', bold: true },
        { text: ' dejare de cumplir cualesquiera de las obligaciones asumidas frente a ' },
        { text: 'Erick Perez (S&E Inversiones)', bold: true },
        { text: ', el presente contrato quedara resuelto de pleno derecho, sin necesidad de ninguna formalidad judicial o extrajudicial y, en consecuencia, ' },
        { text: 'LA DEUDORA', bold: true },
        { text: ' perdera Beneficio del termino y de las condiciones de pago acordadas, pudiendo ' },
        { text: 'Erick Perez', bold: true },
        { text: ' Exigir el pago inmediato de la suma adeudada en principal, intereses y comisiones, haciendose ejecutables las garantia consentidas en el presente contrato.' },
      ]
    }
  );

  clausulas.forEach(function(cl) {
    y = cb(y, 22);
    // Combinar: "N. Titulo: " (bold) + espacio explícito + cuerpo
    var partes = [
      { text: cl.num + ' ', bold: true },
      { text: cl.titulo + ': ', bold: true },
      // primer elemento del cuerpo: si empieza con texto normal y no espacio, ok
      // porque el titulo ya termina con ': ' que incluye el espacio
    ].concat(cl.cuerpo);
    y = writeRichParagraph(doc, partes, ML + 2, CW - 2, y, 9.5);
    y += 3;
  });

  // ══════════════════════════════════════
  // SECCION DE FIRMAS — DOS COLUMNAS
  // Cliente/Deudor (izquierda) | Prestamista (derecha)
  // NO hay caja de firma para el Fiador
  // ══════════════════════════════════════
  y = cb(y, 65);
  y += 6;

  // Separador superior
  doc.setDrawColor(148, 148, 148);
  doc.setLineWidth(0.3);
  doc.line(ML, y - 4, PW - MR, y - 4);

  var GAP   = 14;
  var COL_W = (CW - GAP) / 2;   // ~78 mm
  var C_L   = ML;
  var C_R   = ML + COL_W + GAP;
  var SIG_W = COL_W;
  var SIG_H = 27;
  var LH    = 6.5;

  // Titulos de columna
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(genero.deudor + ':', C_L, y);
  doc.text('PRESTAMISTA:', C_R, y);
  y += LH;

  // Nombre
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Nombre: ', C_L, y);
  doc.setFont('helvetica', 'bold');
  var nmTrunc = (doc.getTextWidth(nombreCliente) > COL_W - 22)
    ? nombreCliente.substring(0, 25) + '...'
    : nombreCliente;
  doc.text(nmTrunc, C_L + 20, y);

  doc.setFont('helvetica', 'normal');
  doc.text('Nombre: ', C_R, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Erick Perez (S&E Inversiones)', C_R + 20, y);
  y += LH;

  // Cedula
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Cedula: ', C_L, y);
  doc.setFont('helvetica', 'bold');
  doc.text(cedula, C_L + 16, y);

  doc.setFont('helvetica', 'normal');
  doc.text('Cedula: ', C_R, y);
  doc.setFont('helvetica', 'bold');
  doc.text('001-1234567-8', C_R + 16, y);
  y += LH;

  // Fecha
  doc.setFont('helvetica', 'normal');
  doc.text('Fecha: ', C_L, y);
  doc.setFont('helvetica', 'bold');
  doc.text(fechaHoy, C_L + 14, y);

  doc.setFont('helvetica', 'normal');
  doc.text('Fecha: ', C_R, y);
  doc.setFont('helvetica', 'bold');
  doc.text(fechaHoy, C_R + 14, y);
  y += LH - 1;

  // Cajas de firma — lado a lado
  drawSignatureBox(doc, C_L, y, SIG_W, SIG_H, 'Firma del ' + genero.deudor);
  drawSignatureBox(doc, C_R, y, SIG_W, SIG_H, 'Firma del Prestamista');
  y += SIG_H + 10;

  // ══════════════════════════════════════
  // INSTRUCCIONES PARA FIRMAR
  // - Sin emojis (solo ASCII puro)
  // - Altura calculada antes de dibujar el recuadro
  // - Salto de pagina si no cabe
  // ══════════════════════════════════════

  var INSTR_FS   = 8.5;
  var INSTR_LH   = INSTR_FS * 1.6 * (25.4 / 72);
  var INSTR_X_TXT = ML + 20;                    // X del texto de cada paso
  var INSTR_TXT_W = CW - 25;                    // ancho disponible para el texto

  var instrPasos = [
    {
      label: '1.',
      texto: 'Abre este PDF desde WhatsApp. Toca el archivo y selecciona "Abrir con..." y elige Adobe Acrobat o tu visor PDF preferido.'
    },
    {
      label: '2.',
      texto: 'Toca el recuadro de firma y dibuja tu firma con el dedo sobre la pantalla.'
    },
    {
      label: '3.',
      texto: 'Guarda el PDF firmado y reenvíalo por WhatsApp a S&E Inversiones.'
    },
    {
      label: 'NOTA:',
      texto: 'iPhone: usa "Editar con Markup". Android: usa Adobe Acrobat Reader (gratis) o Xodo PDF.'
    },
  ];

  // Calcular altura total del bloque antes de dibujarlo
  doc.setFontSize(INSTR_FS);
  doc.setFont('helvetica', 'normal');
  var instrTotalH = 6 + 6 + 3; // padding-top + titulo + separador + padding-bottom
  instrPasos.forEach(function(p) {
    var lines = doc.splitTextToSize(p.texto, INSTR_TXT_W);
    instrTotalH += lines.length * INSTR_LH + 3;
  });
  instrTotalH += 4; // padding-bottom extra

  // Saltar pagina si no cabe el bloque completo
  y = cb(y, instrTotalH + 6);
  y += 4;

  // Recuadro gris con borde redondeado
  doc.setFillColor(244, 244, 244);
  doc.setDrawColor(190, 190, 190);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, y, CW, instrTotalH, 2.5, 2.5, 'FD');

  y += 5;

  // Titulo en negrita
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 22, 22);
  doc.text('INSTRUCCIONES PARA FIRMAR DESDE WHATSAPP:', ML + 5, y);
  y += 5.5;

  // Linea interna bajo el titulo
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(ML + 5, y - 1.5, PW - MR - 5, y - 1.5);

  // Pasos
  instrPasos.forEach(function(p) {
    // Etiqueta bold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(INSTR_FS);
    doc.setTextColor(28, 28, 28);
    doc.text(p.label, ML + 5, y);

    // Texto del paso con wrap
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(INSTR_FS);
    doc.setTextColor(52, 52, 52);
    var lines = doc.splitTextToSize(p.texto, INSTR_TXT_W);
    doc.text(lines, INSTR_X_TXT, y);
    y += lines.length * INSTR_LH + 3;
  });

  doc.setTextColor(0, 0, 0);

  return doc;
};

export default generarContratoPDF;