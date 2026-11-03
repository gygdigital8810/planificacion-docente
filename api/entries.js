const validCodes = new Set(['IA-2411','IA-2412','IA-2413','IA-2414','IA-2415','LEC-2411','IA-2421','IA-2422','IA-2423','IA-2424','IA-2425','LEC-2422']);
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.SHEET_WEBAPP_URL || !process.env.SHEET_API_SECRET) return res.status(503).json({error:'El servicio aún no está configurado.'});
  if (!['GET','POST'].includes(req.method)) return res.status(405).json({error:'Método no permitido.'});
  let entry;
  if (req.method === 'POST') {
    const b=req.body || {};
    if (!validCodes.has(b.course_code) || typeof b.content !== 'string' || !b.content.trim() || b.content.length > 4000 || typeof b.ideas !== 'string' || b.ideas.length > 2000 || typeof b.notes !== 'string' || b.notes.length > 2000 || !Array.isArray(b.matched_courses) || b.matched_courses.some(c=>!validCodes.has(c))) return res.status(400).json({error:'Comprueba los datos del formulario.'});
    entry={course_code:b.course_code,content:b.content.trim(),ideas:b.ideas.trim(),notes:b.notes.trim(),matched_courses:[...new Set(b.matched_courses)]};
  }
  try {
    const upstream=await fetch(process.env.SHEET_WEBAPP_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:process.env.SHEET_API_SECRET,action:req.method==='GET'?'list':'add',entry})});
    if(!upstream.ok)throw Error('upstream error');
    const data=await upstream.json();
    if(!data.ok)throw Error('upstream error');
    return res.status(req.method==='GET'?200:201).json(req.method==='GET'?data.entries:{ok:true});
  } catch { return res.status(502).json({error:'No se pudo conectar. Inténtalo nuevamente.'}); }
};
