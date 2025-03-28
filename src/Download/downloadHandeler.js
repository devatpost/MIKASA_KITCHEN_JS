import { setupFormListener } from "./formListeners";

export const createDownloadHandler = (session) => {
    const downloadContainer = document.getElementById("downloads");
    if (!downloadContainer) return; // Ensure the container exists
  
    // Array to store selected export names
    const selectedExports = [];
    // Get all export items that have type "download"
    let downloadExports = Object.values(session.exports).filter(
      (field) => field.type === "download"
    );
    // downloadExports=[...downloadExports,...downloadExports]
    downloadExports.forEach((item) => {
      // Create a wrapper div for image and checkbox
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.alignItems = "center";
      wrapper.style.margin = "10px";
  
      // Create an image element
      const img = document.createElement("img");
      img.src = `./assets/${item.name}.svg`;
      img.alt = item.name;
      img.setAttribute("data-name", item.name);
      img.style.width = "40px";
      
      // Create a checkbox element
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = item.name;
      checkbox.classList.add("check")
      // Handle checkbox selection
      checkbox.addEventListener("change", (event) => {
        if (event.target.checked) {
          selectedExports.push(item.name);
        } else {
          const index = selectedExports.indexOf(item.name);
          if (index > -1) {
            selectedExports.splice(index, 1);
          }
        }
        console.log("Selected Exports:", selectedExports);
        const downloadArrow=document.getElementsByClassName("downloadArrow")[0];
        console.log(downloadArrow)
        if(selectedExports.length>0){
            downloadArrow.style.display="flex";
        }else{
            downloadArrow.style.display="none";
        }
      });
  
      // Append elements to wrapper
      wrapper.appendChild(img);
      wrapper.appendChild(checkbox);
      // Append wrapper to the container
      downloadContainer.appendChild(wrapper);
    });

    const downloadButton = document.createElement('button');
    // Add a class for circular styling
    downloadButton.classList.add('downloadArrow');
    // Create an image element for the icon
    const downloadIcon = document.createElement('img');
    downloadIcon.src = './assets/downloadExports.svg'; 
    downloadIcon.alt = 'Download Icon'; 
    downloadIcon.style.height = '30px';
    downloadIcon.style.width = '25px';
    
    downloadButton.innerHTML = ''; 
    downloadButton.appendChild(downloadIcon); 
    downloadContainer.appendChild(downloadButton)

    downloadButton.addEventListener("click",()=>{
        const iniPopup=document.getElementById("iniPopup") 
        const overlay=document.getElementById("iniPopupOverlay")
        iniPopup.style.display = 'flex';
        overlay.style.display = 'block';
        const downloadPopup=document.getElementById("userInfoPopup");
        downloadPopup.style.display="flex"
        setupFormListener(session,selectedExports);
    })
  };
  