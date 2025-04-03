import { Units } from "../constants";
import { bc, session, updateParameter, wc } from "../main";

function chngimg() {
    const imgElement = document.getElementById('unitIconImage') ;
    
    if (!imgElement) return; // Handle case where the image element is not found
    
    const imgFileName = imgElement.src.split('/').pop(); // Extract file name from URL

    if (imgFileName === 'unit_mm.svg') {
        imgElement.src = '../../assets/unit_in.svg';
    } else {
        imgElement.src = 'a../../assets/unit_mm.svg';
    }
}

export const handleUnitToggle=async()=>{
        const shutter=Object.values(session.parameters).filter(
            (field) => field.name === Units
          )[0];
           if(shutter.value){
            shutter.value=false;
           }else{
            shutter.value=true;
           }
           chngimg()
        await session.customize();
        updateParameter(bc)
        updateParameter(wc)
}

