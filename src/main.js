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
import { handleAddShelf } from "./drag_and_snap";
import { DragManager, HoverManager, InteractionData, InteractionEngine, SelectManager } from "@shapediver/viewer.features.interaction";
import { mat4, quat, vec3, vec2 } from "gl-matrix";
import { compareBayMatrices, removeMatrixByComparison } from "./utility";
import { addAndStyle } from "./addAndStyle";
import {outputDisplay} from './outputs'
import { createUI } from "./dynamicUI";
import handleInputsForDownloads from "./inputDownloads";
import { createDownloadHandler } from "./Download/downloadHandeler";
import { toggleShutter } from "./toggleShutter";
import { populatePopupTable, totalCost } from "./BillOfQuantities";
import { handleScreenshot } from "./Download/screenshot";
import { materialUI } from "./Materials/materialUI";
import { fetchMaterials } from "./Materials/dynamicMaterial";
import { createTooltip } from "./tooltip";
import { loadAR } from "./arIntegration";
import { handleSnapBoxesAddition } from "./SnapBoxes";
import { deleteCabinetHandeler } from "./deleteCabinets";
import { eventListenersSetup } from "./eventListeners";

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
      console.log(nodes, `nodes for ${bayKey}`,regex);

      // const nodes = def.output.node?.getNodesByName(`${def.name}_`) || [];
      // console.log(nodes, `nodes for ${bayKey}`,def.parameter.value);

      nodes[0].children.forEach((node, index) => {
        node.data.push(data); // Add InteractionData to all nodes
        console.log(node,def.counter-1,index,index === def.counter - 1)
        if (index === def.counter - 1) {
          node.visible = false; // Only hide the last node
          console.log("hidding")
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
      "048a6862731ccc50827a91151c3132ce031203342f903c215f7c7957484319ad09d236ac5854f8e16c2a36d02872ca0be3cbaae83ab3762da7ef095bbb607d3e0ab60a98861d9d8b8cb53a8086549e2383922abf653325dd44784a7907d00c9dfa24fbbc88d56e-344d8468f40e33557fee39b8c049ceba",
      modelViewUrl: "https://sdr7euc1.eu-central-1.shapediver.com",
      id: "mySession"
    });

    // Log session and viewport
    console.log("Viewport and session initialized:", { viewport, session });
    viewport.camera.reset();

    viewport.show = true;

    const outputs = session.outputs; // Get all outputs
    const parameters = session.parameters; // Get all parameters
//     console.log(outputs,"nenenwen")
    Object.values(parameters).forEach(param => {
      console.log(param.name);
  });
  Object.values(outputs).forEach(param => {
    console.log(param.name);
});


    Object.values(outputs).forEach(output => {
      console.log(output,output.name)
      if (output.name.startsWith("bc") && output.name!="bay_number" && output.name!="bay_length") {
        console.log(output.name)
        console.log("inin")
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

  Object.values(outputs).forEach(output => {
    if (output.name.startsWith("wc")) {
      console.log(output.name)
      console.log("inin")
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
    
    // Assign the corresponding parameters
    Object.values(parameters).forEach(param => {
        if (param.name.startsWith("bc")) {
            console.log(param.name,"paramname")
            const newName = param.name.replace("Matrices", "");
            // const bayKey = `bay${bayNumber.toLowerCase()}`;
            const bayKey=newName
    
            if (bc[bayKey]) {
                bc[bayKey].parameter = param;
            }
        }
    });
    
    Object.values(parameters).forEach(param => {
      if (param.name.startsWith("wc")) {
          console.log(param.name,"paramname")
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
  
  
  console.log("Bays:", bc,wc);
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

