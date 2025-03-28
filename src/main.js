import "./styles/style.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/initialPopup.css";
import "./styles/cartPopup.css";
import "./styles/downloadPopup.css";
import "./styles/billOfQuantities.css";


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

export let viewport;
let session;
let bayNumber;
let bayLength;
export let dragManager;
let hoverManager;
let selectManager;
export let allBays= [];
export const bc = {}; // Object to store bay objects dynamically
export const wc={}

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
      "57edf425b3277a4fca6f8a817f8bc1ebe8abe8dc2ea51278e4ed0c6b0eec73c4d66ceb35804e1ba725903a2fe417bbb22c2a213e0aa44c84ef7301eeee221968a8a27671cc6c6b491ed2fa71a1db2bdbd5806a5cb6bd4e1529322440d6369c57b379045f4bbf32-e1bfd602a27952ba5dbf84e94400ddeb",
      modelViewUrl: "https://sdr8euc1.eu-central-1.shapediver.com",
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
    createDownloadHandler(session)
    toggleShutter(session)
    totalCost(allBays,bc,wc)
    const selectToken=SDV.addListener(SDV.EVENTTYPE.INTERACTION.SELECT_ON, (e) => {
      const selectEvent = e ;
      const selectedNode = selectEvent.node;
      console.log("Node selected:", selectedNode.parent.name);
      let parentNode=selectedNode.parent.name;
      let parentGroup=null;
      if(parentNode.includes("bc")){
        parentGroup=bc
      }else if(parentNode.includes("wc")){
        parentGroup=wc
      }
      // Get the center point
      const center = selectedNode.boundingBox.boundingSphere.center[0];
      const snapInfo=Object.values(parentGroup)[0].snapPoints.find(snappoint => snappoint.point[0]===center)
      console.log(snapInfo,"asdnaisndaodnoaks")
      let index=0;
      if(snapInfo){
          index=snapInfo.index;
      }
      // Create the new point object
      const newPoint = vec3.fromValues(snapInfo.point[0], snapInfo.point[1], snapInfo.point[2]);
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
        console.log(matrixObject,"matrixxiix",allBays)
        const existingMatric = allBays.find(bay => bay.bayName.includes(parentNode) && compareBayMatrices(bay.matrices, matrixObject));
        console.log(existingMatric)
        removeMatrixByComparison(parentGroup[existingMatric.bayName], existingMatric.matrices);
        const allBayIndex = allBays.findIndex(mat =>
            compareBayMatrices(mat.matrices, matrixObject)
          );
          if(allBayIndex!=-1)
        allBays.splice(allBayIndex, 1);
        await updateParameter(parentGroup)
        totalCost(allBays,bc,wc);
        // colorButton(newPointObject)
    }

    deleteBay(newPointObject)
  });
      console.log("Initialization complete");
      document.getElementById("loadingOverlay").style.display = "none";
      //user info popup
    const popup = document.querySelector('.inputpopup');
    const overlay = document.querySelector('.popup-overlay-input') ;
    const configure = document.getElementById('configure');
    configure.addEventListener('click', () => {
      // Get the currently checked radio button
      const selectedRadio = document.querySelector('input[name="roleType"]:checked');
      const userType = selectedRadio ? selectedRadio.value : ''; // Fallback to empty string if none selected

      handleInputsForDownloads(userType);
    });
    setTimeout(() => {
        popup.style.display = 'flex';
        overlay.style.display = 'block';
    }, 10000);

    document.getElementById('initialPopupCross')?.addEventListener('click', function () {
      const iniPopup=document.getElementById("iniPopup") 
      const overlay=document.getElementById("iniPopupOverlay")
      iniPopup.style.display="none"
      overlay.style.display="none"
    });
    
    document.getElementById('userInfo')?.addEventListener('click', function () {
      const iniPopup=document.getElementById("iniPopup") 
      const overlay=document.getElementById("iniPopupOverlay")
      iniPopup.style.display = 'flex';
      overlay.style.display = 'block';
    });
    
    document.getElementById('chooseUsPopupCross')?.addEventListener('click', function () {
      const chooseUsPopup=document.getElementById("chooseUsPopup")
      chooseUsPopup.style.display="none"
    });
    
    
    document.getElementById('cartPopup')?.addEventListener('click', function () {
      const chooseUsPopup=document.getElementById("chooseUsPopup")
      chooseUsPopup.style.display="flex"
    });

    const extrasMenu = document.getElementById("extrasMenu");
    const extrasIcon = document.getElementById("extrasIcon"); // The button that opens the menu
    
    extrasIcon.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent immediate closing
    
      if (extrasMenu.style.display === "none" || extrasMenu.style.display === "") {
        extrasMenu.style.display = "flex";
        
        // Outside click event listener
        setTimeout(() => {
          document.addEventListener("click", outsideClick);
        }, 0);
      } else {
        extrasMenu.style.display = "none";
        document.removeEventListener("click", outsideClick);
      }
    });
    
    function outsideClick(event) {
      // Close menu if clicked outside
      if (!extrasMenu.contains(event.target) && event.target !== extrasIcon) {
        extrasMenu.style.display = "none";
        document.removeEventListener("click", outsideClick);
      }
    }

    const downloadBox=document.getElementById("downloadBox");
    const downloadIconContainer=document.getElementById("downloads");
    downloadBox.addEventListener("click",()=>{
         downloadIconContainer.style.display="flex";
    })
    const downloadPopupCross=document.getElementById("downloadPopupCross");
    downloadPopupCross.addEventListener("click",()=>{
      downloadIconContainer.style.display="none";
      const iniPopup=document.getElementById("iniPopup") 
      const overlay=document.getElementById("iniPopupOverlay")
      iniPopup.style.display = 'none';
      overlay.style.display = 'none';
      const downloadPopup=document.getElementById("userInfoPopup");
      downloadPopup.style.display="none"
    })

    const popupBill = document.getElementById('popup');
    const priceButton=document.getElementById("totalPrice");
    priceButton.addEventListener("click",()=>{
      populatePopupTable(allBays,bc,wc); // Populate table with current data
      popupBill.style.display = 'flex'; // Show the popup
    })

    const closePopupBtn = document.getElementById('closePopup');
    closePopupBtn.addEventListener('click', () => {
      popupBill.style.display = 'none'; // Hide the popup
    });

    let snapPointToggle=false;
    const snapPointButton=document.getElementById("previewSnapPoints");
    snapPointButton.addEventListener("click",()=>{
      const circles = document.getElementsByClassName("anchor-point");

      if (snapPointToggle) {
          Array.from(circles).forEach(circle => {
              circle.style.display = "flex";
          });
      } else {
          Array.from(circles).forEach(circle => {
              circle.style.display = "none";
          });
      }
      snapPointToggle=!snapPointToggle
    })

    const screenshotIcon = document.getElementById('screenshotIcon');
    screenshotIcon.addEventListener("click",handleScreenshot);
  } catch (error) {
    console.error("Error initializing ShapeDiver:", error);
  }
})();

