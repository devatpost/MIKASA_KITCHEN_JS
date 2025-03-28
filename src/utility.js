import { viewport } from "./main";

export function compareMat4(matrix1, matrix2) {
    for (let i = 0; i < matrix1.length; i++) {
      if (Math.abs(matrix1[i] - matrix2[i]) > 0.00001) {
        return false; // Small tolerance for floating-point comparisons
      }
    }
    return true;
  }
  
  
  
  export function compareBayMatrices(matrices1, matrices2) {
    console.log(matrices1,matrices2)
    return (
      compareMat4(matrices1.transformation, matrices2.transformation) &&
      compareMat4(matrices1.rotation, matrices2.rotation) &&
      compareMat4(matrices1.translation, matrices2.translation)
    );
  }

  export const removeMatrixByComparison = async (parent, matrixToRemove) => {
    console.log(parent,"aprenttntn")
    const matrixIndex = parent.matrices.findIndex(existingMatrix =>
      compareBayMatrices(existingMatrix, matrixToRemove)
    );
    if (matrixIndex !== -1) {
      // Remove the matrix and update parent counter
      parent.matrices.splice(matrixIndex, 1);
      parent.counter=parent.counter-1;
    //   setCustomizationInProgress(true);
  
    //   updateCountOfBays(bay, bay?.output?.name || "");
      viewport.update();
    //   console.log(bay1,bay2,"byss")
      //  session.updateOutputs();
  
    } else {
      console.log("Matrix not found in the bay.");
    }
  };