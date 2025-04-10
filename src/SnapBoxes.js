import { session } from "./main"

export const handleSnapBoxesRemoval=(index,def)=>{
  let snapBoxName;
  console.log(def,"cabineinteitn")
  if(def.name.includes("bc")){
    snapBoxName="Base Snapbox"
  }else{
    snapBoxName="Wall Snapbox"
  }
  const snapBoxes=session.getOutputByName(snapBoxName)
  const indexSnapBox=snapBoxes[0].node.getNodesByName(`${index}`)[0];
  indexSnapBox.visible = false;
  indexSnapBox.updateVersion();
}

export const handleSnapBoxesAddition=(index,cabinet)=>{
    let snapBoxName;
    if(cabinet.bayName.includes("bc")){
      snapBoxName="Base Snapbox"
    }else{
      snapBoxName="Wall Snapbox"
    }
    const snapBoxes=session.getOutputByName(snapBoxName)
    const indexSnapBox=snapBoxes[0].node.getNodesByName(`${index}`)[0];
    indexSnapBox.visible = true;
    indexSnapBox.updateVersion();
}