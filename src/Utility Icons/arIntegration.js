import { IViewportApi, FLAG_TYPE, ISessionApi, AnimationData, ITreeNode } from "@shapediver/viewer"; // Replace with the correct import path
import { QR_CODE_ID, WALL_GEOMETRY } from "../constants";
// import { nodeAnimationDataPairs } from './animationStorage';

const nodeAnimationDataPairs=[];

export function showARModal() {
    const arModal = document.getElementById('arModal');
    if (arModal) {
        arModal.style.display = "block";
    } else {
        console.error("AR modal element not found");
    }
}
/**
 * Loads an Augmented Reality (AR) session for the given viewport and session.
 * This function removes all animations from the scene temporarily, initiates the AR session,
 * and generates a QR code if the device is not AR-ready. After AR session ends, 
 * animations are re-added to their respective nodes.
 *
 * - It hides specific scene elements (e.g., wall geometry) during AR mode.
 * - If AR is supported, it starts the AR session; otherwise, it creates a QR code for access.
 * - It removes animations from scene nodes before AR mode and restores them afterward.
 *
 * @param {IViewportApi} viewport - The viewport API controlling the 3D scene.
 * @param {ISessionApi} session - The session API controlling the data and node structure of the scene.
 * @returns {Promise<void>} A promise that resolves after the AR session is handled.
 */

export async function loadAR(viewport, session) {
    if (!viewport || !session) {
        return;
    }

    const token = viewport.addFlag(FLAG_TYPE.BUSY_MODE);

    /**
     * Temporarily hides the wall geometry in the scene during the AR session.
     */
    session.getOutputByName(WALL_GEOMETRY)[0].node.visible = false;
    try {
        // Traverse the scene tree to find and remove animation data when AR is enable
        // session.node.traverse((node) => {
        //     const animationData= node.data.filter((d) => d instanceof AnimationData);
        //     if (animationData.length > 0) {
        //         // Store node and its animation data
        //         nodeAnimationDataPairs.push({ node, data: animationData });
        //         // Remove animation data from the node
        //         animationData.forEach(d => node.removeData(d));
        //     }
        // });

        /**
 * Checks if the current device supports AR. If it does, the AR session is started. 
 * If not, a QR code is generated to allow access to the AR session on another device.
 *
 * - If `viewport.viewableInAR()` returns true, the AR session is started.
 * - If AR is not supported, a QR code is created, which allows users to view the scene in AR on a compatible device.
 *
 * @returns {Promise<void>} A promise that resolves when the AR session is either started or the QR code is generated.
 */
        if (viewport.viewableInAR()) {
            await viewport.viewInAR();
        } else {
            const qr = await viewport.createArSessionLink(undefined, true);
            const qrCodeElement = document.getElementById(QR_CODE_ID);
            if (qrCodeElement) {
                (qrCodeElement).src = qr;
                showARModal();
            } else {
                console.error("QR code element not found");
            }
        }
    } catch (error) {
        console.error("Error during AR session loading:", error);
    } finally {
        /**
 * Restores the visibility of the wall geometry in the scene after the AR session is complete.
 *
 * @returns {void}
 */
        session.getOutputByName(WALL_GEOMETRY)[0].node.visible = true
        viewport.removeFlag(token);

        // Re-add animations to the nodes
        nodeAnimationDataPairs.forEach(pair => {
            pair.data.forEach(d => pair.node.addData(d));
        });
        /**
         * Clears the global array `nodeAnimationDataPairs` after the animations have been re-applied to the nodes.
         * This ensures that the array is empty for future AR sessions.
         *
         * @returns {void}
         */
        // Clear stored animation data
        nodeAnimationDataPairs.length = 0;
    }
}