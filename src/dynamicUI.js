import { handleAddShelf } from "./drag_and_snap";
import { bays } from "./main";

export const createUI=()=>{
    const bayContainer = document.getElementById("bayButtonsContainer");

    bayContainer.innerHTML = ""; // Clear existing buttons

    Object.keys(bays).forEach((bayKey) => {
        const button = document.createElement("button");
        button.classList.add("bayButton");
        button.id = `${bayKey}Btn`;

        const img = document.createElement("img");
        img.src = `/assets/${bayKey}.svg`;
        img.alt = `Add ${bayKey}`;
        img.width = 84;
        img.height = 84;
        img.draggable = false;

        button.appendChild(img);
        bayContainer.appendChild(button);

        // Attach event listener for each button
        button.addEventListener("click", () => {
            console.log(`Adding ${bayKey}`);
            handleAddShelf(bays[bayKey], bays[bayKey].name);
        });
    });
}