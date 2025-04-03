import { DefaultCamera } from "../constants";
import { viewport } from "../main";

export const handleDefaultScene=()=>{
    const perspectiveCamera = Object.values(viewport.cameras).find(cam=>cam.name === DefaultCamera);
    // console.log(perspectiveCamera,"cammamamwm")
    // Save the default camera position and orientation
    // Clone position and target arrays properly
    const defaultCameraPosition = [...perspectiveCamera.defaultPosition]; 
    const defaultCameraTarget = [...perspectiveCamera.defaultTarget]; 

    /**
     * Resets the camera to the default position and orientation.
     */
    // Function to reset the camera to the default position and orientation
    const resetCameraToDefault = () => {
        perspectiveCamera.position[0] = defaultCameraPosition[0];
        perspectiveCamera.position[1] = defaultCameraPosition[1];
        perspectiveCamera.position[2] = defaultCameraPosition[2];
        perspectiveCamera.target[0] = defaultCameraTarget[0];
        perspectiveCamera.target[1] = defaultCameraTarget[1];
        perspectiveCamera.target[2] = defaultCameraTarget[2];
        viewport.update();
    };

    resetCameraToDefault();
}