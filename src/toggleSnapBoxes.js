import { bc, session, updateParameter, wc } from "./main"
let snapBoxesOn=true;

export const toggleSnapBoxes=async()=>{
    
        const output=session.getOutputByName("Wall Snapbox")[0];
        const output1=session.getOutputByName("Base Snapbox")[0];
    
        if(snapBoxesOn){
            output.node.visible=false;
            output1.node.visible=false;        
            snapBoxesOn=false
        }
        else{
            output.node.visible=true;
            output1.node.visible=true;        
            snapBoxesOn=true
        }
        await session.customize();
        updateParameter(bc)
        updateParameter(wc)
}