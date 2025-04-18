import "./styles/style.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/initialPopup.css";
import "./styles/cartPopup.css";
import "./styles/downloadPopup.css";
import "./styles/billOfQuantities.css";
import "./styles/material.css"
import "./styles/tooltip.css"
import { createSession, VISIBILITY_MODE } from '@shapediver/viewer';
import { createViewport } from '@shapediver/viewer';
import * as SDV from "@shapediver/viewer";
import { DragManager, HoverManager, InteractionData, InteractionEngine, SelectManager } from "@shapediver/viewer.features.interaction";
import { mat4, quat, vec3, vec2 } from "gl-matrix";
import { addAndStyle } from "./addAndStyle";
import {outputDisplay} from './outputs'
import { createUI } from "./dynamicUI";
import { createDownloadHandler } from "./Download/downloadHandeler";
import { populatePopupTable, totalCost } from "./BillOfQuantities";
import { materialUI } from "./Materials/materialUI";
import { fetchMaterials } from "./Materials/dynamicMaterial";
import { eventListenersSetup } from "./eventListeners";
import { toggleShutter } from "./Utility Icons/toggleShutter";
import { BaseCabinet, WallCabinet } from "./constants";

export let viewport;
export let session;
let bayNumber;
let bayLength;
export let dragManager;
let hoverManager;
export let selectManager;
export let allBays= [];
export let bc = {}; // Object to store bay objects dynamically
export let wc={}

export const updateParameter = async (cabinet) => {
  for (const bayKey in cabinet) {
    if (cabinet.hasOwnProperty(bayKey)) {
      const def = cabinet[bayKey];

      // Convert the matrices into the desired format
      const stringMatrixArray = def.matrices.map(m =>
        "[" + m.transformation.toString() + "]"
      );

      def.parameter.value =
        stringMatrixArray.length === 0 ? "{}" : `{matrices:[${stringMatrixArray.join()}]}`;

      await session.customize();

      const data = new InteractionData({ select: true, hover: true });
      const regex = new RegExp(`^${def.output.name}$`); // Create a regex from the name
      const nodes = def.output.node?.getNodesByNameWithRegex(regex) || [];
      // console.log(nodes, `nodes for ${bayKey}`,regex);

      // const nodes = def.output.node?.getNodesByName(`${def.name}_`) || [];
      // console.log(nodes, `nodes for ${bayKey}`,def.parameter.value);

      nodes[0].children.forEach((node, index) => {
        node.data.push(data); // Add InteractionData to all nodes
        // console.log(node,def.counter-1,index,index === def.counter - 1)
        if (index === def.counter - 1) {
          node.visible = false; // Only hide the last node
          // console.log("hidding")
        }
        node.updateVersion();
      });
      // function addDataToNodeAndChildren(node, data) {
      //   node.data.push(data); // Add data to the current node
      //   node.updateVersion();
      
      //   if (node.children) {
      //     node.children.forEach(child => addDataToNodeAndChildren(child, data));
      //   }
      // }
      
      // nodes.forEach((node,index) => {
      //   if (index === def.counter - 1) {
      //     node.visible = false; // Only hide the last node
      //   }
      //   addDataToNodeAndChildren(node, data);
      // });
      
    }
  }
};

(async () => {
  // console.log(SDV,"sdfsdjnjdnskvjndks")

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
      "e2697eec9e2271f00bd0690c70561442a91ce772b47d466a35676d91d786ab5ce65a2727df832bcc57e8f2307cfd67e3dbdfb2bd636bf171462d28b677b69fd1bf9a4e79eb27cdafff1e5048a911064e5162788b105e0b53f5aeb67afedc3e6e7eb65b76cfe998-6f459bf8946360447c2952c24a445601",
      modelViewUrl: "https://sdr8euc1.eu-central-1.shapediver.com",
      id: "mySession"
    });

    // Log session and viewport
    // console.log("Viewport and session initialized:", { viewport, session });
    viewport.camera.reset();

    viewport.show = true;

    const outputs = session.outputs; // Get all outputs
    const parameters = session.parameters; // Get all parameters
//     console.log(outputs,"nenenwen")
//     Object.values(parameters).forEach(param => {
//       console.log(param.name);
//   });
//   Object.values(outputs).forEach(param => {
//     console.log(param.name);
// });

//Getting outputs for Base Cabinets
    Object.values(outputs).forEach(output => {
      if (output.name.startsWith(BaseCabinet)) {
          const bayKey = output.name; // Convert to bay1, bay2
  
          // Initialize the bay object if not already created
          if (!bc[bayKey]) {
              bc[bayKey] = {
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
          bc[bayKey].output = output;
          bc[bayKey].snapLines = [];
          bc[bayKey].snapPoints = [];
          bc[bayKey].name=bayKey

      }
  });

  //Getting outputs for Wall Cabinets
  Object.values(outputs).forEach(output => {
    if (output.name.startsWith(WallCabinet)) {
        const bayKey = output.name; // Convert to bay1, bay2

        // Initialize the bay object if not already created
        if (!wc[bayKey]) {
            wc[bayKey] = {
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
        wc[bayKey].output = output;
        wc[bayKey].snapLines = [];
        wc[bayKey].snapPoints = [];
        wc[bayKey].name=bayKey
    }
});
    
//Getting parameters for Base Cabinets
Object.values(parameters).forEach(param => {
        if (param.name.startsWith(BaseCabinet)) {
            const newName = param.name.replace("Matrices", "");
            // const bayKey = `bay${bayNumber.toLowerCase()}`;
            const bayKey=newName
    
            if (bc[bayKey]) {
                bc[bayKey].parameter = param;
            }
        }
    });
    
    //Getting parameters for Wall Cabinets
    Object.values(parameters).forEach(param => {
      if (param.name.startsWith(WallCabinet)) {
          const newName = param.name.replace("Matrices", "");
          // const bayKey = `bay${bayNumber.toLowerCase()}`;
          const bayKey=newName
  
          if (wc[bayKey]) {
              wc[bayKey].parameter = param;
          }
      }
  });
  bc = Object.fromEntries(
    Object.entries(bc).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
  );
  wc = Object.fromEntries(
    Object.entries(wc).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
  );
  
    //Updating parameters to hide the initial box
    await updateParameter(bc);
    await updateParameter(wc);
    ({bay_number:bayNumber,bay_length:bayLength}=outputDisplay(session,bc,wc));


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

    //Variuos handelers for features
    addAndStyle();
    createUI(bc,"baseCabinetContainer")
    createUI(wc,"wallCabinetContainer")
    materialUI()
    fetchMaterials(session);
    createDownloadHandler(session)
    toggleShutter(session)
    totalCost(allBays,bc,wc)
    eventListenersSetup()  
  } catch (error) {
    console.error("Error initializing ShapeDiver:", error);
  }
})();

