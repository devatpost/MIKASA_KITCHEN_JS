import { PreviewShutters } from "../constants";
import { bc, updateParameter, wc } from "../main";

//Toggle shutter featur
export const toggleShutter=(session)=>{
    const shutter=Object.values(session.parameters).filter(
        (field) => field.name === PreviewShutters
      )[0];
      // console.log(shutter,"shutter")
    const button=document.getElementById("previewShuttersButton");
    const text=document.getElementById("menuTextShutters")

    button.addEventListener("click",async()=>{
       if(shutter.value){
        shutter.value=false;
        text.style.color="#000000"
       }else{
        shutter.value=true;
        text.style.color="#A89378"

    }
    await session.customize();
    updateParameter(bc)
    updateParameter(wc)
    })
}