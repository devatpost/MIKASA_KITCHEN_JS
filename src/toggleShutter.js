import { bc, updateParameter, wc } from "./main";

export const toggleShutter=(session)=>{
    const shutter=Object.values(session.parameters).filter(
        (field) => field.name === "Preview Shutters"
      )[0];
      // console.log(shutter,"shutter")
    const button=document.getElementById("previewShuttersButton");
    button.addEventListener("click",async()=>{
       if(shutter.value){
        shutter.value=false;
       }else{
        shutter.value=true;
    }
    await session.customize();
    updateParameter(bc)
    updateParameter(wc)
    })
}