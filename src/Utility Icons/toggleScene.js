import { PreviewScene } from "../constants";
import { bc, session, updateParameter, wc } from "../main";

export const toggleScene=async()=>{
        const scene=Object.values(session.parameters).filter(
            (field) => field.name === PreviewScene
          )[0];
          const text=document.getElementById("menuTextScene")

           if(scene.value){
            scene.value=false;
            text.style.color="#000000"
           }else{
            scene.value=true;
            text.style.color="#A89378"
    
        }
        await session.customize();
        updateParameter(bc)
        updateParameter(wc)
}