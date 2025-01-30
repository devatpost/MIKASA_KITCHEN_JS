import {
    PointConstraint,
    IDragEvent,
    InteractionData,
    LineConstraint,
    DragManager,
    PlaneConstraint,
  } from "@shapediver/viewer.features.interaction";
import { allBays, bays, dragManager, updateParameter, viewport } from "./main";
import { mat4, quat, vec3, vec2 } from "gl-matrix";
import { addListener, EVENTTYPE, removeListener } from "@shapediver/viewer";
import { compareBayMatrices, removeMatrixByComparison } from "./utility";

export const snapPointToBayMap = new Map();

let mouseDown = 0;
document.body.onmousedown = () => {
  ++mouseDown;
};
document.body.onmouseup = () => {
  --mouseDown;
};

let touchDown = 0;
document.body.ontouchstart = () => {
  ++touchDown;
};
document.body.ontouchend = () => {
  --touchDown;
};

let tokenMove="", tokenEnd="";


export const storeBay = (matrices, bayName,index) => {
    const existingMatric = allBays.find(bay => compareBayMatrices(bay.matrices, matrices));
    console.log(existingMatric,bayName)
    if (existingMatric) {
      if (existingMatric.bayName !== bayName) {
        removeMatrixByComparison(bays[existingMatric.bayName], existingMatric.matrices);
        existingMatric.bayName = bayName;
        console.log(allBays,)
        return true;
      } else {
        return false;
      }
    } else {
      allBays.push({ matrices, bayName ,index });
      return true;
    }
}

export const storeBayAtIndex = (bay, index) => {
    // Check if the index already has a bay assigned
    if (snapPointToBayMap.has(index)) {
      console.log(`Replacing existing bay at index ${index} with new bay: ${bay}`);
    } else {
      console.log(`Storing new bay at index ${index}: ${bay}`);
    }
  
    // Set the bay at the specified index (will replace if it already exists)
    snapPointToBayMap.set(index, bay);
  };


  export const handleAddShelf = async (def, bayName) => {
    removeListener(tokenMove);
    removeListener(tokenEnd);

    console.log("handleAddShelf function called");
    
    dragManager.removeNode();
    
    // Initialize the drag constraints array
    const dragConstraintsIDs = [];
    
    // Add constraints for snap points and snap lines
    def.snapPoints.forEach((element) => {
        dragConstraintsIDs.push(
            dragManager.addDragConstraint(
                new PointConstraint(element.point, element.radius, element.rotation)
            )
        );
    });
    
    def.snapLines.forEach((element) => {
        dragConstraintsIDs.push(
            dragManager.addDragConstraint(
                new LineConstraint(
                    element.point1,
                    element.point2,
                    element.radius,
                    element.rotation
                )
            )
        );
    });
    
    // Add the plane constraint for dragging
    const planeConstraint = new PlaneConstraint([0, 1, 0], [0, 0, 0]);
    dragManager.addDragConstraint(planeConstraint);
    
    // Find the node with the last id, this one is currently hidden
    const newNode = def.output.node?.getNodesByName(
        def.output.name + "_" + (def.counter - 1)
    )[0];
    
    // Enable dragging for this node
    const data = new InteractionData({ drag: true });
    data.dragOrigin = vec3.fromValues(
        (newNode.boundingBox.max[0] + newNode.boundingBox.min[0]) / 2,
        newNode.boundingBox.max[1],
        newNode.boundingBox.min[2]
    );
    newNode.data.push(data);
    newNode.visible = false;
    newNode.updateVersion();

    // Set the node to be draggable
    dragManager.setNode(newNode);

    // Move listener for the drag event
    tokenMove = addListener(EVENTTYPE.INTERACTION.DRAG_MOVE, async (e) => {
        console.log("Drag move triggered:", e);

        if (!mouseDown && !touchDown) {
            console.log("Mouse released before entering viewer");
            dragManager.removeNode();
        } else {
            console.log("Viewer entered, making node visible");
            newNode.visible = true;
            newNode.updateVersion();
        }
        // Remove the listener after it has triggered
        console.log("Removing drag move listener");
        removeListener(tokenMove);
    });

    // End listener for the drag event
    tokenEnd = addListener(EVENTTYPE.INTERACTION.DRAG_END, async (e) => {
        console.log("Drag end triggered:", e);

        const dragEvent = e;
        dragConstraintsIDs.forEach((d) => dragManager.removeDragConstraint(d));
        console.log("Removed all drag constraints");

        const translationMatrix = mat4.fromTranslation(
            mat4.create(),
            mat4.getTranslation(vec3.create(), dragEvent.matrix)
        );
        const rotationMatrix = mat4.fromQuat(
            mat4.create(),
            mat4.getRotation(quat.create(), dragEvent.matrix)
        );
        let transformationMatrix = mat4.create();
        mat4.multiply(
            transformationMatrix,
            transformationMatrix,
            mat4.transpose(mat4.create(), dragEvent.matrix)
        );

        const matrixObject = {
            transformation: transformationMatrix,
            rotation: rotationMatrix,
            translation: translationMatrix,
        };

        console.log("MatrixObject:", matrixObject);

        const xTranslation = transformationMatrix[3];
        const specificSnap = def.snapPoints.find(info => info.point[0] === xTranslation);
        let index = specificSnap ? specificSnap.index : undefined;
        
        console.log("Snap index:", index);

        if (index !== undefined && storeBay(matrixObject, bayName, index)) {
            storeBayAtIndex(bayName, index);
            def.matrices[def.matrices.length - 1].rotation = rotationMatrix;
            def.matrices[def.matrices.length - 1].transformation = transformationMatrix;
            def.matrices[def.matrices.length - 1].translation = translationMatrix;

            if (def.matrices.length === def.counter) {
                def.matrices.push({
                    transformation: mat4.create(),
                    rotation: mat4.create(),
                    translation: mat4.create()
                });
            }

            def.counter++;
            await updateParameter();
            console.log("Updated matrices and parameters for bay:", def);
        } else {
            console.log("Snap index not found or storeBay failed");
            newNode.visible = false;
            newNode.updateVersion();
        }

        viewport.update();
        // Remove the listener after it has triggered
        console.log("Removing drag end listener");
        removeListener(tokenEnd);
    });
};

