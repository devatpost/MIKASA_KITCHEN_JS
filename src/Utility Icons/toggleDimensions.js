import { Dimensions_GEO, Dimensions_Text } from "../constants";
import { bc, session, updateParameter, wc } from "../main";

let dimOn=true;
export const toggleDimensions=async()=>{
    const output=session.getOutputByName(Dimensions_GEO)[0];
    const output1=session.getOutputByName(Dimensions_Text)[0];
    const text=document.getElementById("menuTextDimensions")
    if(dimOn){
        output.node.visible=false;
        output1.node.visible=false;        
        dimOn=false
        text.style.color="#000000"
    }
    else{
        output.node.visible=true;
        output1.node.visible=true;        
        dimOn=true
        text.style.color="#A89378"
    }
    await session.customize();
    updateParameter(bc)
    updateParameter(wc)
}