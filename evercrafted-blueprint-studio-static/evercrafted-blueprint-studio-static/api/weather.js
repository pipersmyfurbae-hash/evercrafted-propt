module.exports = async function handler(req,res){
  try{
    const lat=39.9612,lon=-82.9988;
    const u=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=1`;
    const r=await fetch(u); if(!r.ok) throw new Error('Weather request failed'); const d=await r.json();
    const labels={0:'Clear',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',80:'Rain showers',81:'Rain showers',82:'Heavy showers',95:'Thunderstorms',96:'Thunderstorms with hail',99:'Severe thunderstorms with hail'};
    const condition=labels[d.current.weather_code]||'Mixed conditions'; const high=Math.round(d.daily.temperature_2m_max[0]),low=Math.round(d.daily.temperature_2m_min[0]),rain=d.daily.precipitation_probability_max[0]||0,wind=Math.round(d.daily.wind_speed_10m_max[0]||0),humidity=Math.round(d.current.relative_humidity_2m||0);
    const designSignal=rain>=60?'Saturation → storm movement → rain-darkened contrast':wind>=20?'Warmth → wind movement → directional release':high-low>=20?'Day warmth → sharp cooling → seasonal contrast':'Temperature + light → restrained seasonal shift';
    res.status(200).json({date:d.daily.time[0],location:'Columbus, Ohio',current:`${condition} • ${Math.round(d.current.temperature_2m)}°F`,highF:high,lowF:low,dayPattern:`${condition} • ${humidity}% humidity`,laterConditions:`Rain ${rain}% • wind up to ${wind} mph`,designSignal,precipProbability:rain,wind:`${wind} mph`,humidity:`${humidity}%`});
  }catch(e){res.status(502).json({error:e.message||'Weather error'})}
}
