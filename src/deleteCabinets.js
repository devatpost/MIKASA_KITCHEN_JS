import { allBays, bc, updateParameter, wc } from "./main";
import * as SDV from "@shapediver/viewer";
import { mat4, quat, vec3, vec2 } from "gl-matrix";
import { compareBayMatrices, removeMatrixByComparison } from "./utility";
import { totalCost } from "./BillOfQuantities";
import { handleSnapBoxesAddition } from "./SnapBoxes";
import { BaseCabinet, WallCabinet } from "./constants";

export const deleteCabinetHandeler = (e) => {
  const selectEvent = e;
  const selectedNode = selectEvent.node;
  let parentNode = selectedNode.parent.name;
  let parentGroup = null;
  if (parentNode.includes(BaseCabinet)) {
    parentGroup = bc;
  } else if (parentNode.includes(WallCabinet)) {
    parentGroup = wc;
  }
  // Get the center point
  const center = selectedNode.boundingBox.boundingSphere.center[0];
  const snapInfo = Object.values(parentGroup)[0].snapPoints.find(
    (snappoint) => snappoint.point[0] === center
  );
  let index = 0;
  if (snapInfo) {
    index = snapInfo.index;
  }
  // Create the new point object
  const newPoint = vec3.fromValues(
    snapInfo.point[0],
    snapInfo.point[1],
    snapInfo.point[2]
  );
  const newPointObject = {
    point: newPoint,
    radius: 500,
    rotation: {
      axis: vec3.fromValues(0, 0, 1),
      angle: 0,
    },
  };

  const deleteBay = async (newPointObject) => {
    const pointVec3 = vec3.fromValues(
      newPointObject.point[0],
      newPointObject.point[1],
      newPointObject.point[2]
    );
    // console.log(pointVec3,"pointvec3")
    const yOffset = 0;
    pointVec3[1] = yOffset;

    // Create the transformation matrix manually
    const transformationMatrix = mat4.create();
    transformationMatrix[3] = pointVec3[0]; // X translation
    transformationMatrix[7] = pointVec3[1]; // Y translation
    transformationMatrix[11] = pointVec3[2]; // Z translation

    let translationMatrix = mat4.create();
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
    // console.log(matrixObject, "matrixxiix", allBays);
    const existingMatric = allBays.find(
      (bay) =>
        bay.bayName.includes(parentNode) &&
        compareBayMatrices(bay.matrices, matrixObject)
    );
    // console.log(existingMatric);
    removeMatrixByComparison(
      parentGroup[existingMatric.bayName],
      existingMatric.matrices
    );
    const allBayIndex = allBays.findIndex((mat) =>
      compareBayMatrices(mat.matrices, matrixObject)
    );
    if (allBayIndex != -1) allBays.splice(allBayIndex, 1);
    await updateParameter(parentGroup);
    totalCost(allBays, bc, wc);
    handleSnapBoxesAddition(index, existingMatric);
  };

  deleteBay(newPointObject);
  const deleteIcon=document.getElementById("deleteCabinet");
  deleteIcon.style.display="none";
};
