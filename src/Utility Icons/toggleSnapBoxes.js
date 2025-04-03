import { BaseSnapBoxes, WallSnapBoxes } from "../constants";
import { bc, session, updateParameter, wc } from "../main";

let snapBoxesOn=true;

export const toggleSnapBoxes=async()=>{
    
        const output=session.getOutputByName(WallSnapBoxes)[0];
        const output1=session.getOutputByName(BaseSnapBoxes)[0];
        const text=document.getElementById("menuTextSnapBox")

        if(snapBoxesOn){
            output.node.visible=false;
            output1.node.visible=false;        
            snapBoxesOn=false
            text.style.color="#000000"
        }
        else{
            output.node.visible=true;
            output1.node.visible=true;        
            snapBoxesOn=true
            text.style.color="#A89378"

        }
        await session.customize();
        updateParameter(bc)
        updateParameter(wc)
}