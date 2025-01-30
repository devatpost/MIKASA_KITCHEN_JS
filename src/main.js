import "./styles/style.css";
import "./styles/header.css";
import "./styles/footer.css";

import { createSession, VISIBILITY_MODE } from '@shapediver/viewer';
import { createViewport } from '@shapediver/viewer';
import * as SDV from "@shapediver/viewer";
import { handleAddShelf } from "./drag_and_snap";
import { DragManager, HoverManager, InteractionData, InteractionEngine, SelectManager } from "@shapediver/viewer.features.interaction";
import { mat4, quat, vec3, vec2 } from "gl-matrix";
import { compareBayMatrices, removeMatrixByComparison } from "./utility";
import { addAndStyle } from "./addAndStyle";
import {outputDisplay} from './outputs'
import { createUI } from "./dynamicUI";

export let viewport;
let session;
let bayNumber;
let bayLength;
export let dragManager;
let hoverManager;
let selectManager;
export let allBays= [];
export const bays = {}; // Object to store bay objects dynamically

export const updateParameter = async () => {
  for (const bayKey in bays) {
    if (bays.hasOwnProperty(bayKey)) {
      const def = bays[bayKey];

      // Convert the matrices into the desired format
      const stringMatrixArray = def.matrices.map(m =>
        "[" + m.transformation.toString() + "]"
      );

      def.parameter.value =
        stringMatrixArray.length === 0 ? "{}" : `{matrices:[${stringMatrixArray.join()}]}`;

      await session.customize();

      const data = new InteractionData({ select: true, hover: true });

      const regexPattern = new RegExp(`^${def.output.name}_`);

      const nodes = def.output.node?.getNodesByNameWithRegex(regexPattern) || [];
      console.log(nodes, `nodes for ${bayKey}`);

      nodes.forEach((node, index) => {
        node.data.push(data); // Add InteractionData to all nodes

        if (index === def.counter - 1) {
          node.visible = false; // Only hide the last node
        }
        node.updateVersion();
      });
    }
  }
};

(async () => {
  console.log(SDV,"sdfsdjnjdnskvjndks")

  try {
    const canvas = document.getElementById("canvas");
    if (!canvas) throw new Error("Canvas element not found");

    // Create viewport
    viewport = await createViewport({
      canvas: document.getElementById("canvas"),
      id: "myViewport",
      visibility: VISIBILITY_MODE.MANUAL
    });
    session = await createSession({
      ticket:
      "adf75b38b60cb834b25dbec06dbb71a40bc9f2c880c43d14d1e59bc7efb82a266c4d6ae355deb297a2d2777d169e055548fa75f6869fe73f9dc6169fbfcbe42b1b81e15881a713a5a9e823ce375c0ed8a917d805b35388e4765dec4001d18f0d090c15890c419b-cda7b3f29d58b8cafee79717da9050e8",
      modelViewUrl: "https://sdr7euc1.eu-central-1.shapediver.com",
      id: "mySession"
    });

    // Log session and viewport
    console.log("Viewport and session initialized:", { viewport, session });
    viewport.camera.reset();

    viewport.show = true;

    const outputs = session.outputs; // Get all outputs
    const parameters = session.parameters; // Get all parameters
    
    Object.values(outputs).forEach(output => {
      if (output.name.startsWith("baytype")) {
        console.log(output.name)
        console.log("inin")
          const bayNumber = output.name.replace("baytype", ""); // Extract One, Two, etc.
          const bayKey = `bay${bayNumber.toLowerCase()}`; // Convert to bay1, bay2
  
          // Initialize the bay object if not already created
          if (!bays[bayKey]) {
              bays[bayKey] = {
                  output: null,
                  parameter: null,
                  counter: 1,
                  matrices: [{
                      transformation: mat4.create(),
                      rotation: mat4.create(),
                      translation: mat4.create()
                  }]
              };
          }
  
          // Assign the output
          bays[bayKey].output = output;
          bays[bayKey].snapLines = [];
          bays[bayKey].snapPoints = [];
          bays[bayKey].name=bayKey

      }
  });
    
    // Assign the corresponding parameters
    Object.values(parameters).forEach(param => {
        if (param.name.startsWith("baytype")) {
          console.log(param.name)

            const bayNumber = param.name.replace("baytype", "").replace("Matrices", "");
            const bayKey = `bay${bayNumber.toLowerCase()}`;
    
            if (bays[bayKey]) {
                bays[bayKey].parameter = param;
            }
        }
    });
    
    console.log("Bays:", bays.bayone);
    

    await updateParameter();
    ({bay_number:bayNumber,bay_length:bayLength}=outputDisplay(session,bays));


    const interactionEngine = new InteractionEngine(viewport);
    hoverManager = new HoverManager();
    hoverManager.effectMaterial = new SDV.MaterialStandardData({ color: "#ffa500" , opacity:0.1});
    interactionEngine.addInteractionManager(hoverManager);
    dragManager = new DragManager();
    dragManager.effectMaterial = new SDV.MaterialStandardData({ color: "#dddddd" });
    interactionEngine.addInteractionManager(dragManager);
    selectManager = new SelectManager();
    selectManager.effectMaterial = new SDV.MaterialStandardData({ color: "#8080FF", opacity:0.3 });
    interactionEngine.addInteractionManager(selectManager);


    addAndStyle();
    createUI()

    const selectToken=SDV.addListener(SDV.EVENTTYPE.INTERACTION.SELECT_ON, (e) => {
      const selectEvent = e ;
      const selectedNode = selectEvent.node;
      console.log("Node selected:", selectedNode);
      // Get the center point
      const center = selectedNode.boundingBox.boundingSphere.center[0];
      const snapInfo=bays.bayone.snapPoints.find(snappoint => snappoint.point[0]===center)
      let index=0;
      if(snapInfo){
          index=snapInfo.index;
      }
      // Create the new point object
      const newPoint = vec3.fromValues(center, 0, 0);
      const newPointObject = {
          point: newPoint,
          radius: 500,
          rotation: {
              axis: vec3.fromValues(0, 0, 1),
              angle: 0
          }
      };

      const deleteBay= async (newPointObject)=>{
        const pointVec3 = vec3.fromValues(newPointObject.point[0],newPointObject.point[1],newPointObject.point[2]);
        // console.log(pointVec3,"pointvec3")
        // Adjust the y-axis based on the required offset
        const yOffset = 0;
        pointVec3[1] = yOffset;
      
        // Create the transformation matrix manually
        const transformationMatrix = mat4.create();
        transformationMatrix[3] = pointVec3[0];  // X translation 
        transformationMatrix[7] = pointVec3[1];  // Y translation 
        transformationMatrix[11] = pointVec3[2]; // Z translation 
      
        let translationMatrix=mat4.create()
        mat4.multiply(
          translationMatrix,
          translationMatrix,
          mat4.transpose(mat4.create(), transformationMatrix)
        );
        // Create the matrix object for the selected bay
        const matrixObject = {
          transformation: mat4.clone(transformationMatrix),
          rotation: mat4.create(),
          translation: mat4.clone(translationMatrix),
        };
        const existingMatric = allBays.find(bay => compareBayMatrices(bay.matrices, matrixObject));
        console.log(existingMatric)
        removeMatrixByComparison(bays[existingMatric.bayName], existingMatric.matrices);
        const allBayIndex = allBays.findIndex(mat =>
            compareBayMatrices(mat.matrices, matrixObject)
          );
          if(allBayIndex!=-1)
        allBays.splice(allBayIndex, 1);
        await updateParameter()
        // colorButton(newPointObject)
    }

    deleteBay(newPointObject)
  });
  console.log("Initialization complete");
  document.getElementById("loadingOverlay").style.display = "none";

  } catch (error) {
    console.error("Error initializing ShapeDiver:", error);
  }
})();

