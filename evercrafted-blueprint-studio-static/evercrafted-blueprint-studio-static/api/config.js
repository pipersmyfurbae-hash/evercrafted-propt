module.exports=async function handler(req,res){
  res.status(200).json({compositionStudioUrl:process.env.COMPOSITION_STUDIO_URL||'/app/apps/studio'});
}
