/**
 * OfflineExcel — modo de contingencia sin internet para SucreBot
 * Usa File System Access API (Chrome/Edge, misma limitación que Web Serial)
 * para leer/escribir un archivo .xlsx local que sirve como base de datos
 * mientras no hay conexión a Google Sheets/GAS.
 *
 * Flujo:
 *  1) Con internet, ANTES del corte: OfflineExcel.crearNuevo() crea el archivo local
 *     y OfflineExcel.importarParticipantesDesdeGAS(gasUrl) lo llena con los
 *     participantes aprobados actuales.
 *  2) Sin internet: OfflineExcel.activar() reabre ese mismo archivo. Los módulos
 *     (CRONOMETRO, etc.) leen participantes con getParticipantes(categoria) y
 *     guardan resultados con guardarResultado(data) — todo se escribe en el
 *     archivo local en cada operación, no se pierde nada aunque se cierre la pestaña.
 *  3) Al volver el internet: OfflineExcel.sincronizar(gasUrl) sube todo lo
 *     pendiente a Google Sheets vía GAS, en orden, marcando cada fila como sincronizada.
 */
window.OfflineExcel = (function () {
  const SHEET_PART = 'Participantes';
  const SHEET_RES = 'Resultados_Offline';
  const PART_COLS = ['id', 'nombre', 'robot', 'institucion', 'ciudad', 'categoria', 'correo', 'miembro2', 'aprobado'];
  const RES_COLS = ['participanteId', 'nombre', 'robot', 'institucion', 'categoria', 'tiempo', 'ronda', 'intento', 'ruta', 'fecha', 'sincronizado'];

  let fileHandle = null;
  let workbook = null;
  let activo = false;

  function soportado() {
    return typeof window.showOpenFilePicker === 'function' && typeof window.showSaveFilePicker === 'function';
  }

  function _tipoExcel() {
    return [{
      description: 'Excel',
      accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
    }];
  }

  function _asegurarHojaResultados() {
    if (!workbook.Sheets[SHEET_RES]) {
      workbook.Sheets[SHEET_RES] = XLSX.utils.aoa_to_sheet([RES_COLS]);
      workbook.SheetNames.push(SHEET_RES);
    }
  }

  async function _guardarDisco() {
    if (!fileHandle || !workbook) return false;
    try {
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const writable = await fileHandle.createWritable();
      await writable.write(wbout);
      await writable.close();
      return true;
    } catch (e) {
      console.error('OfflineExcel: error escribiendo en disco', e);
      return false;
    }
  }

  // Crea un archivo .xlsx nuevo (usar la PRIMERA vez, con internet, antes del evento)
  async function crearNuevo(nombreSugerido) {
    if (!soportado()) { alert('El modo offline requiere Chrome o Edge (igual que el cronómetro Web Serial).'); return false; }
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: nombreSugerido || 'SucreBot_offline.xlsx',
        types: _tipoExcel()
      });
      workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([PART_COLS]), SHEET_PART);
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([RES_COLS]), SHEET_RES);
      activo = true;
      await _guardarDisco();
      return true;
    } catch (e) {
      console.error('OfflineExcel.crearNuevo:', e);
      return false;
    }
  }

  // Abre un archivo .xlsx existente (usar SIN internet, o para continuar donde quedó)
  async function activar() {
    if (!soportado()) { alert('El modo offline requiere Chrome o Edge (igual que el cronómetro Web Serial).'); return false; }
    try {
      const [handle] = await window.showOpenFilePicker({ types: _tipoExcel(), multiple: false });
      fileHandle = handle;
      const file = await handle.getFile();
      const buf = await file.arrayBuffer();
      workbook = XLSX.read(buf, { type: 'array' });
      if (!workbook.Sheets[SHEET_PART]) {
        workbook.Sheets[SHEET_PART] = XLSX.utils.aoa_to_sheet([PART_COLS]);
        workbook.SheetNames.push(SHEET_PART);
      }
      _asegurarHojaResultados();
      activo = true;
      await _guardarDisco();
      return true;
    } catch (e) {
      console.error('OfflineExcel.activar:', e);
      return false;
    }
  }

  // Con internet: llena/actualiza la hoja Participantes desde GAS (getParticipantes)
  async function importarParticipantesDesdeGAS(gasUrl) {
    if (!activo) return false;
    const r = await fetch(gasUrl + '?' + new URLSearchParams({ action: 'getParticipantes' }));
    const todos = await r.json();
    const lista = Array.isArray(todos) ? todos : (todos.participantes || []);
    const rows = [PART_COLS];
    lista.forEach(p => rows.push([
      p.id || '', p.nombre || '', p.robot || '', p.institucion || '', p.ciudad || '',
      p.categoria || '', p.correo || '', p.miembro2 || '', p.aprobado || ''
    ]));
    workbook.Sheets[SHEET_PART] = XLSX.utils.aoa_to_sheet(rows);
    if (workbook.SheetNames.indexOf(SHEET_PART) === -1) workbook.SheetNames.push(SHEET_PART);
    await _guardarDisco();
    return lista.length;
  }

  function estaActivo() { return activo; }

  function getParticipantes(categoria) {
    if (!workbook || !workbook.Sheets[SHEET_PART]) return [];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_PART], { defval: '' });
    return data.filter(p =>
      String(p.categoria || '').trim() === String(categoria || '').trim() &&
      String(p.aprobado || '').toUpperCase() === 'APROBADO'
    );
  }

  // Agrega un resultado y reescribe el archivo local inmediatamente
  async function guardarResultado(data) {
    if (!activo || !workbook) return false;
    _asegurarHojaResultados();
    const existing = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_RES], { defval: '' });
    existing.push({
      participanteId: data.participanteId || '',
      nombre: data.nombre || '',
      robot: data.robot || '',
      institucion: data.institucion || '',
      categoria: data.categoria || '',
      tiempo: data.tiempo,
      ronda: data.ronda,
      intento: data.intento,
      ruta: data.ruta || 'general',
      fecha: data.fecha || new Date().toISOString(),
      sincronizado: 'FALSE'
    });
    workbook.Sheets[SHEET_RES] = XLSX.utils.json_to_sheet(existing, { header: RES_COLS });
    return await _guardarDisco();
  }

  function contarPendientes() {
    if (!workbook || !workbook.Sheets[SHEET_RES]) return 0;
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_RES], { defval: '' });
    return data.filter(r => String(r.sincronizado).toUpperCase() !== 'TRUE').length;
  }

  // Con internet de vuelta: sube todo lo pendiente a GAS, en orden
  async function sincronizar(gasUrl, onProgress) {
    if (!workbook || !workbook.Sheets[SHEET_RES]) return { ok: 0, fail: 0 };
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[SHEET_RES], { defval: '' });
    let ok = 0, fail = 0;
    for (let i = 0; i < data.length; i++) {
      const r = data[i];
      if (String(r.sincronizado).toUpperCase() === 'TRUE') continue;
      try {
        await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'pushResultado',
            participanteId: r.participanteId, nombre: r.nombre, robot: r.robot,
            institucion: r.institucion, tiempo: r.tiempo, ronda: r.ronda,
            intento: r.intento, ruta: r.ruta, fecha: r.fecha
          })
        });
        r.sincronizado = 'TRUE';
        ok++;
      } catch (e) {
        fail++;
      }
      if (onProgress) onProgress(i + 1, data.length);
    }
    workbook.Sheets[SHEET_RES] = XLSX.utils.json_to_sheet(data, { header: RES_COLS });
    await _guardarDisco();
    return { ok, fail };
  }

  function desactivar() {
    activo = false;
    fileHandle = null;
    workbook = null;
  }

  return {
    soportado, crearNuevo, activar, importarParticipantesDesdeGAS,
    estaActivo, getParticipantes, guardarResultado, contarPendientes,
    sincronizar, desactivar
  };
})();
