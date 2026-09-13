function promptFor(blueprint,weather){
  const placements=(blueprint.placements||[]).map(p=>`${p.element} ${p.clock} r${Number(p.radius).toFixed(2)} (${p.role})`).join('; ');
  const materials=(blueprint.materials||[]).join(', ');
  const ribbon=blueprint.ribbon?`${blueprint.ribbon.material} designer bow at ${blueprint.ribbon.clock}, ${blueprint.ribbon.loops} generous loose loops, ${blueprint.ribbon.tailLengthIn}-inch tails tucked and woven behind stems`:'';
  return `Photorealistic luxury editorial product photograph of a handcrafted 24-inch premium faux botanical wreath on natural grapevine. ${blueprint.title}. Preserve geometry exactly. Open grapevine arc ${blueprint.openArc?.startClock} to ${blueprint.openArc?.endClock}. Greenery-first structural pockets with substantial wired 8-14 inch branches, never miniature sprigs or limp foliage. Materials: ${materials}. Exact placements: ${placements}. ${ribbon}. Intentional negative space, asymmetric composition, flowers seated deeply into visible greenery pockets, believable wired faux-silk construction, matte petals, semi-gloss foliage, straight-on camera, 85mm product lens, soft natural daylight, entire wreath in frame, clean warm-neutral background. Weather mood only: ${weather?.designSignal||blueprint.weatherTranslation||''}. No bouquet clumping, no ring-around floral spacing, no tiny hair bow, no ribbon across the open center.`;
}
async function waitForJob(jobId,key){
  const deadline=Date.now()+85000;
  while(Date.now()<deadline){
    const r=await fetch(`https://api.krea.ai/jobs/${jobId}`,{headers:{authorization:`Bearer ${key}`}});
    if(!r.ok)throw new Error(`Krea job check failed: ${r.status} ${await r.text()}`);
    const j=await r.json();
    if(j.status==='completed')return j;
    if(j.status==='failed'||j.status==='canceled')throw new Error(`Krea job ${j.status}`);
    await new Promise(resolve=>setTimeout(resolve,2500));
  }
  throw new Error('Krea render timed out before completion');
}
module.exports=async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'POST only'});
  try{
    const key=process.env.KREA_API_TOKEN||process.env.KREA_API_KEY;
    if(!key)return res.status(503).json({error:'KREA_API_TOKEN is not configured in Vercel.'});
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    if(!body?.blueprint)return res.status(400).json({error:'blueprint is required'});
    const prompt=promptFor(body.blueprint,body.weather);
    const input={prompt,aspect_ratio:'1:1',resolution:'1K',creativity:'low'};
    if(process.env.KREA_MOODBOARD_ID){input.moodboards=[{id:process.env.KREA_MOODBOARD_ID,strength:Number(process.env.KREA_MOODBOARD_STRENGTH||0.2)}]}
    const endpoint=process.env.KREA_MODEL_ENDPOINT||'https://api.krea.ai/generate/image/krea/krea-2/medium';
    const r=await fetch(endpoint,{method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify(input)});
    if(!r.ok)return res.status(502).json({error:`Krea ${r.status}: ${(await r.text()).slice(0,800)}`});
    const created=await r.json();
    const jobId=created.job_id||created.id;
    if(!jobId)throw new Error('Krea did not return a job id');
    const done=await waitForJob(jobId,key);
    const imageUrl=done?.result?.urls?.[0]||done?.data?.urls?.[0];
    if(!imageUrl)throw new Error('Krea completed without an image URL');
    res.status(200).json({imageUrl,jobId,prompt,model:'image/krea/krea-2/medium',creativity:'low'});
  }catch(e){res.status(500).json({error:e.message||'Krea render failed'})}
}
