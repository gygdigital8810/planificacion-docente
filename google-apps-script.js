// Pegar en Extensiones > Apps Script de una hoja de cálculo nueva.
// En Configuración del proyecto > Propiedades del script, crear SHEET_API_SECRET y SPREADSHEET_ID.
const TAB = 'Respuestas';
const HEADERS = ['id','created_at','course_code','content','ideas','notes','matched_courses'];
function doPost(e) {
  try {
    const body=JSON.parse(e.postData.contents);
    const secret=PropertiesService.getScriptProperties().getProperty('SHEET_API_SECRET');
    if(!secret || body.secret!==secret) return output({ok:false});
    const lock=LockService.getScriptLock();lock.waitLock(30000);
    try {
      const book=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'));
      const sheet=book.getSheetByName(TAB)||book.insertSheet(TAB);
      if(sheet.getLastRow()===0)sheet.appendRow(HEADERS);
      if(body.action==='list') {
        const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,HEADERS.length).getValues():[];
        return output({ok:true,entries:rows.map(r=>({id:String(r[0]),created_at:r[1] instanceof Date?r[1].toISOString():String(r[1]),course_code:String(r[2]),content:unescapeCell(r[3]),ideas:unescapeCell(r[4]),notes:unescapeCell(r[5]),matched_courses:JSON.parse(r[6]||'[]')}))});
      }
      if(body.action==='add' && body.entry) {
        const x=body.entry;
        sheet.appendRow([Utilities.getUuid(),new Date(),safeCell(x.course_code),safeCell(x.content),safeCell(x.ideas),safeCell(x.notes),JSON.stringify(x.matched_courses||[])]);
        return output({ok:true});
      }
      return output({ok:false});
    } finally {lock.releaseLock();}
  } catch(err) {return output({ok:false});}
}
function safeCell(value){const s=String(value||'');return /^[\s]*[=+\-@]/.test(s)?"'"+s:s;}
function unescapeCell(value){const s=String(value||'');return /^'[\s]*[=+\-@]/.test(s)?s.slice(1):s;}
function output(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}
