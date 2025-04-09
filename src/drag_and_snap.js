import {
    PointConstraint,
    IDragEvent,
    InteractionData,
    LineConstraint,
    DragManager,
    PlaneConstraint,
  } from "@shapediver/viewer.features.interaction";
import { allBays, bc, dragManager, updateParameter, viewport, wc } from "./main";
import { mat4, quat, vec3, vec2 } from "gl-matrix";
import { addListener, EVENTTYPE, removeListener } from "@shapediver/viewer";
import { compareBayMatrices, removeMatrixByComparison } from "./utility";
import { totalCost } from "./BillOfQuantities";
import { handleSnapBoxesRemoval } from "./SnapBoxes";

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


export const storeBay = (cabinet,matrices, bayName,index) => {
    const existingMatric = allBays.find(bay => compareBayMatrices(bay.matrices, matrices));

    if (existingMatric) {
      if (existingMatric.bayName !== bayName) {
        removeMatrixByComparison(cabinet[existingMatric.bayName], existingMatric.matrices);
        existingMatric.bayName = bayName;

        return true;
      } else {
        return false;
      }
    } else {
      allBays.push({ matrices, bayName ,index });

      return true;
    }
}


  export const handleAddShelf = async (cabinet,def, bayName) => {
    removeListener(tokenMove);
    removeListener(tokenEnd);


    
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
        `${def.counter-1}`
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


        if (!mouseDown && !touchDown) {

            dragManager.removeNode();
        } else {

            newNode.visible = true;
            newNode.updateVersion();
        }
        // Remove the listener after it has triggered

        removeListener(tokenMove);
    });

    // End listener for the drag event
    tokenEnd = addListener(EVENTTYPE.INTERACTION.DRAG_END, async (e) => {


        const dragEvent = e;
        dragConstraintsIDs.forEach((d) => dragManager.removeDragConstraint(d));

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

       

        let xTranslation = transformationMatrix[3];
        const specificSnap = def.snapPoints.find(info => info.point[0] === xTranslation);
     

        let index = specificSnap ? specificSnap.index : undefined;
        
   

        if (index !== undefined && storeBay(cabinet,matrixObject, bayName, index)) {
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

            updateParameter(cabinet);
            handleSnapBoxesRemoval(index,def);
            // totalCost(allBays,bc,wc);
        } else {

            newNode.visible = false;
            newNode.updateVersion(def);
        }

        viewport.update();
        // Remove the listener after it has triggered
 
        removeListener(tokenEnd);
    });
};

