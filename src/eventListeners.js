import { SelectManager } from "@shapediver/viewer.features.interaction";
import { loadAR } from "./Utility Icons/arIntegration";
import { populatePopupTable } from "./BillOfQuantities";
import { deleteCabinetHandeler } from "./deleteCabinets";
import { handleScreenshot } from "./Download/screenshot";
import handleInputsForDownloads from "./inputDownloads";
import { allBays, bc, selectManager, session, viewport, wc } from "./main";
import { createTooltip } from "./tooltip";
import * as SDV from "@shapediver/viewer";
import { toggleSnapBoxes } from "./Utility Icons/toggleSnapBoxes";
import { toggleDimensions } from "./Utility Icons/toggleDimensions";
import { handleUnitToggle } from "./Utility Icons/toggleUnit";
import { handleDefaultScene } from "./Utility Icons/handleDefaultscene";
import { toggleScene } from "./Utility Icons/toggleScene";


export let selectedNode;

export const eventListenersSetup=()=>{
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
  // setTimeout(() => {
  //     popup.style.display = 'flex';
  //     overlay.style.display = 'block';
  // }, 10000);

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

  function outsideClickHandle(event) {
    // Close menu if clicked outside
    if (!downloadIconContainer.contains(event.target) && event.target !== downloadIconContainer) {
      downloadIconContainer.style.display = "none";
      document.removeEventListener("click", outsideClickHandle);
    }
  }

  const downloadBox=document.getElementById("downloadBox");
  const downloadIconContainer=document.getElementById("downloads");
  downloadBox.addEventListener("click",()=>{
       downloadIconContainer.style.display="flex";
       setTimeout(() => {
        document.addEventListener("click", outsideClickHandle);
      }, 0);
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

  // let snapPointToggle=false;
  // const snapPointButton=document.getElementById("previewSnapPoints");
  // snapPointButton.addEventListener("click",()=>{
  //   const circles = document.getElementsByClassName("anchor-point");

  //   if (snapPointToggle) {
  //       Array.from(circles).forEach(circle => {
  //           circle.style.display = "flex";
  //       });
  //   } else {
  //       Array.from(circles).forEach(circle => {
  //           circle.style.display = "none";
  //       });
  //   }
  //   snapPointToggle=!snapPointToggle
  // })

  const screenshotIcon = document.getElementById('screenshotIcon');
  screenshotIcon.addEventListener("click",handleScreenshot);

  
document.querySelectorAll("[data-tooltip]").forEach((element) => {
createTooltip(element);
})
const ar = document.getElementById("arIcon");

ar.addEventListener("click", () => {
  // console.log("insdjnfjkdsk")
    loadAR(viewport, session);
});


const arCross=document.getElementById("arCross")
 arCross.addEventListener("click",()=>{
  if (arModal) {
    arModal.style.display = "none";
  } else {
    console.error("AR modal element not found");
  } 
})

const deleteIcon=document.getElementById("deleteCabinet");
let deselectTimeout; // Store timeout ID

const selectToken = SDV.addListener(SDV.EVENTTYPE.INTERACTION.SELECT_ON, (e) => {
    deleteIcon.style.display = "block";
    selectedNode = e;

    // Clear any existing timeout before setting a new one
    if (deselectTimeout) {
        clearTimeout(deselectTimeout);
    }

    deselectTimeout = setTimeout(() => {
        selectManager.deselect();
        deleteIcon.style.display = "none";
        selectedNode = null;
    }, 5000);
});


deleteIcon.addEventListener("click",()=>{
    deleteCabinetHandeler(selectedNode);
    selectManager.deselect();
    deleteIcon.style.display = "none";
})

const dimensions=document.getElementById("previewDimensionsButton");
dimensions.addEventListener("click",toggleDimensions)
const previewSnapBoxes=document.getElementById("previewSnapBoxes");
previewSnapBoxes.addEventListener("click",toggleSnapBoxes)

const unitToggle=document.getElementById("unitIcon");
unitToggle.addEventListener("click",handleUnitToggle);


const defaultScene=document.getElementById("defaultIcon");
defaultScene.addEventListener("click",handleDefaultScene);


const Scene=document.getElementById("previewWallButton");
Scene.addEventListener("click",toggleScene);

}
