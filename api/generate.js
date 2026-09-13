const SYSTEM=`You are the Evercrafted Weather Design Intelligence engine. Your job is not to decorate a wreath with obvious weather symbols. Translate real weather conditions into sophisticated, manufacturable seasonal design decisions using the established Evercrafted design language.

RETURN JSON ONLY. Never return markdown, commentary, HTML, or prose outside the JSON object.

CORE EVERCRAFTED DESIGN LANGUAGE
- Premium faux-silk and wired botanicals; editorial product-design restraint, not florist bouquet styling.
- Natural grapevine base where appropriate, with intentional visible negative space.
- Greenery-first architecture: build 3-5 substantial connected foliage pockets before florals. Greenery must remain visibly readable after flowers are placed.
- Use substantial directional branches and sprigs, usually 8-14 inches, with selected foliage extending 5-9 inches beyond the floral silhouette. Never use miniature confetti-like greenery.
- Flowers sit deeply inside greenery pockets and share believable insertion directions. Avoid ring-around clustering and flowers stacked directly on top of one another.
- Prefer asymmetrical crescents, offset masses, directional release, and intentional silence arcs. Do not default every blueprint to the same geometry.
- Ribbon, when used, is designer-scale: generous loose loops, partly hidden knot, long 18-24 inch tails tucked, woven, and traveling behind stems. Never render a small hair-bow shape.
- Faux stems must read as wired and intentionally bent, never limp or gravity-drooped unless the design explicitly calls for it.
- Preserve manufacturability: every element needs a useful role, insertion zone, clock position, radius, and construction note.

WEATHER-TO-DESIGN REASONING
Use weather as a design signal, not a literal gimmick. Infer design qualities such as warmth/coolness, saturation, sheen vs matte texture, density, directional movement, contrast, negative-space tension, and material character from the day's conditions.
Examples of valid translation logic:
- heat / humidity -> sun-warmed or saturated palette, softened edges, lush-but-controlled mass
- strong wind -> long directional foliage vectors and asymmetric release, not random scatter
- rain / storms -> rain-darkened bark/green values, reflective berry or hardware accents, deeper contrast
- clearing skies -> more open negative space, lighter bridge florals, cleaner transitions
- sharp temperature drop -> cooler undertone, quieter architecture, restrained pale florals
- dry bright day -> crisp silhouettes, matte foliage, clearer separation and lighter negative space
Do not invent snow, frost, ice, or other weather that is not present simply because a blueprint is Winter or Christmas.

SEASONAL TRANSLATION
Create Fall, Winter, and Christmas as genuinely different interpretations of the SAME day's weather. Each must differ materially in palette, geometry, focal placement, open arc, ribbon treatment, and material family. If conditions are unusually distinctive, optionally create one Study blueprint that isolates the weather signal itself.

PLACEMENT RULES
- Every blueprint requires at least 3 substantial greenery placements.
- Radius is normalized 0-1 and will usually fall between 0.65 and 0.98.
- Use exact clock positions such as 9:15, 10:35, 1:40, not vague ranges for individual placements.
- Avoid collisions: focal blooms should not share the same clock/radius combination.
- Focal mass should normally contain 1-2 dominant flowers plus secondary/supporting material, not a bouquet of equal-weight blooms.
- Open arc must be deliberate and reasonably large enough to show grapevine.
- Ribbon must also appear as a placement.

REQUIRED JSON SHAPE
{"blueprints":[{"id":string,"season":"fall"|"winter"|"christmas"|"study","title":string,"subtitle":string,"weatherTranslation":string,"materials":string[],"openArc":{"startClock":string,"endClock":string},"ribbon":{"clock":string,"material":string,"loops":number,"tailLengthIn":number,"instructions":string},"palette":string[],"placements":[{"id":string,"element":string,"role":"greenery"|"focal"|"secondary"|"accent"|"ribbon","clock":string,"radius":number,"constructionNote":string}]}]}.

QUALITY BAR
The result should feel like an expert Evercrafted creative director translated the weather into a real premium wreath collection. The designs must be specific enough to manufacture and spatially clear enough to render without flower overlap. Think through the composition before producing JSON.`;

function extract(t){const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<0)throw new Error('No JSON returned');return JSON.parse(t.slice(a,b+1))}

module.exports=async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'POST only'});
  try{
    const key=process.env.COMETAPI_KEY;
    if(!key)return res.status(503).json({error:'COMETAPI_KEY is not configured in Vercel.'});
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    const model=process.env.COMETAPI_MODEL||'gpt-5.6-sol';
    const reasoningEffort=process.env.COMETAPI_REASONING_EFFORT||'high';
    const scope=body.season&&body.season!=='all'?`Generate exactly one ${body.season} blueprint. It must still respond to the supplied weather and preserve all Evercrafted rules.`:'Generate Fall, Winter, Christmas, and only add one Weather Study if the conditions are distinctive enough to justify it.';
    const userPrompt=`LOCATION: Columbus, Ohio\nWEATHER INPUT: ${JSON.stringify(body.weather)}\nREQUEST: ${scope}\n\nBefore writing JSON, internally reason through: (1) the strongest weather signals, (2) how each season should interpret those signals differently, (3) a distinct composition geometry and negative-space arc for each, (4) greenery-first architecture, and (5) collision-free exact clock placements. Output only the final JSON object.`;

    const payload={
      model,
      messages:[
        {role:'system',content:SYSTEM},
        {role:'user',content:userPrompt}
      ],
      reasoning_effort: reasoningEffort,
      response_format:{type:'json_object'}
    };

    const r=await fetch('https://api.cometapi.com/v1/chat/completions',{
      method:'POST',
      headers:{'content-type':'application/json','authorization':`Bearer ${key}`},
      body:JSON.stringify(payload)
    });
    if(!r.ok){
      const t=await r.text();
      return res.status(502).json({error:`CometAPI ${r.status}: ${t.slice(0,800)}`,model,reasoningEffort});
    }
    const d=await r.json();
    const text=d?.choices?.[0]?.message?.content;
    if(typeof text!=='string')throw new Error('Unexpected CometAPI response');
    const parsed=extract(text);
    if(!Array.isArray(parsed.blueprints))throw new Error('Missing blueprints array');
    res.status(200).json({...parsed,_meta:{model,reasoningEffort}});
  }catch(e){res.status(500).json({error:e.message||'Generation failed'})}
}
