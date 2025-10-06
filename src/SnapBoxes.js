import { BaseCabinet, BaseSnapBoxes, WallSnapBoxes } from "./constants";
import { session } from "./main"

export const handleSnapBoxesRemoval=(index,name)=>{
  console.log(name,"def"
  )
  const snap=session.getParameterByName("Preview SnapBoxes")[0];
  if(snap.value){
    let snapBoxName;
    if(name.includes(BaseCabinet)){
      snapBoxName=BaseSnapBoxes
    }else{
      snapBoxName=WallSnapBoxes
    }
    const snapBoxes=session.getOutputByName(snapBoxName)
    const indexSnapBox=snapBoxes[0].node.getNodesByName(`${index}`)[0];
    indexSnapBox.visible = false;
    indexSnapBox.updateVersion();
  }
}

export const handleSnapBoxesAddition=(index,cabinet)=>{
    const snap=session.getParameterByName("Preview SnapBoxes")[0];
  if(snap.value){
    let snapBoxName;
    if(cabinet.bayName.includes(BaseCabinet)){
      snapBoxName=BaseSnapBoxes
    }else{
      snapBoxName=WallSnapBoxes
    }
    const snapBoxes=session.getOutputByName(snapBoxName)
    const indexSnapBox=snapBoxes[0].node.getNodesByName(`${index}`)[0];
    indexSnapBox.visible = true;
    indexSnapBox.updateVersion();
  }
}