import { ISessionApi, IOutputApi, EVENTTYPE, addListener } from "@shapediver/viewer";
import { calcStaticSnapPoints } from "./snapPoints";
// import { calcStaticSnapPoints } from "./snapPoints_creation";
// import { handleSnapSkeleton } from "./snapSkeleton";

// Module-level variables to store values
let bay_number,bay_length;

export const outputDisplay = async (session,bays)=> {
  try {
    const outputs = session.outputs;
    for (const outputId in outputs) {
      if (Object.prototype.hasOwnProperty.call(outputs, outputId)) {
        const output= outputs[outputId];
        if (output && output.content && output.content[0]) {
          const data = output.content[0].data;
          const outputName = output.name;
          // Store the values of bay_number and bay_length
          if (outputName === "bay_number" && typeof data === "number") {
            bay_number = data;
          } else if (outputName === "bay_length" && typeof data === "number") {
            bay_length = data;
          } else if (outputName === "snap_points") {
            console.log(output,"outputss")
            await calcStaticSnapPoints(data, data.length, 3, 300,bays);
          } else if (outputName === "SnapSkeleton") {
            // const nodes = output.node?.getNodesByNameWithRegex(/^primitive_/);
            // if(process.env.Snap_Skeleton_Interaction === "true"){
            // if (nodes && nodes.length > 0) {
            //   handleSnapSkeleton(nodes);
            // }
          }
        } else {
          console.warn(`No content available for output ID: ${outputId}`);
        }
      }
    }
    return { bay_number, bay_length };
  } catch (error) {
    return { bay_number, bay_length }; 
  }
};

