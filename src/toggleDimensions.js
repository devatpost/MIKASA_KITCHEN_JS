import { bc, session, updateParameter, wc } from "./main"

let dimOn=true;
export const toggleDimensions=async()=>{
    const output=session.getOutputByName("Dimensions")[0];
    const output1=session.getOutputByName("Dimesnion Text")[0];

    if(dimOn){
        output.node.visible=false;
        output1.node.visible=false;        
        dimOn=false
    }
    else{
        output.node.visible=true;
        output1.node.visible=true;        
        dimOn=true
    }
    await session.customize();
    updateParameter(bc)
    updateParameter(wc)
}