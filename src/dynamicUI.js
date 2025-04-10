import { handleAddShelf } from "./drag_and_snap";
import { bc } from "./main";

export const createUI=(cabinet,container)=>{
    const bayContainer = document.getElementById(container);

    bayContainer.innerHTML = ""; // Clear existing buttons

    Object.keys(cabinet).forEach((bayKey) => {
        const button = document.createElement("button");
        button.classList.add("bayButton");
        button.id = `${bayKey}Btn`;

        const img = document.createElement("img");
        img.src = `/assets/${bayKey}.jpg`;
        img.alt = `Add ${bayKey}`;
        img.width = 70;
        img.height = 70;
        img.draggable = false;

        button.appendChild(img);
        bayContainer.appendChild(button);

        // Attach event listener for each button
        button.addEventListener("click", () => {
            console.log(`Adding ${bayKey}`);
            handleAddShelf(cabinet,cabinet[bayKey], cabinet[bayKey].name);
        });
    });
}