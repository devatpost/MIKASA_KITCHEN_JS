import { HTMLElementAnchorCustomData, sceneTree } from "@shapediver/viewer";
import { mat4, quat, vec3, vec2 } from "gl-matrix";

const create = (anchor, parent) => {
    const circle = document.createElement("div");
    circle.className = "anchor-point";
    circle.style.width = "10px";
    circle.style.height = "10px";
    circle.style.backgroundColor = "black";
    circle.style.borderRadius = "50%";
    circle.style.position = "absolute";
    circle.style.pointerEvents = "auto";
    circle.style.cursor = "pointer";
    // circle.style.display="none"
    // Set initial position
    // circle.style.left = `${anchor.anchor.location[0]}px`;
    // circle.style.top = `${anchor.anchor.location[1]}px`;

    anchor.parent.appendChild(circle);
};

const update = (anchor) => {
    const x = anchor.container[0] - anchor.htmlElement.offsetWidth / 2;
    const y = anchor.container[1] - anchor.htmlElement.offsetHeight / 2;

    anchor.htmlElement.style.left = x + "px";
    anchor.htmlElement.style.top = y + "px";
    anchor.htmlElement.style.transform = `scale(${anchor.scale[0]})`;
    anchor.htmlElement.style.display = anchor.hidden ? "none" : "block";
};

export const createSnapPoints = async (points) => {
    // const parent = document.getElementById("parentContainer"); // Make sure this exists in your HTML
    console.log(points,"popdofkjopdsjkfpos")
    points.forEach((pointData, index) => {
        const anchorDataCustom = new HTMLElementAnchorCustomData({
            location: pointData.point,
            data: {
                index: pointData.index,
            },
            create,
            update,
        });
        sceneTree.root.data.push(anchorDataCustom);
        // Create the circle immediately
        // create(anchorDataCustom, parent);
    });

};

export const calcStaticSnapPoints = async (data, len, bayNumber, bayLength, cabinet) => {
  console.log(data,"datattata")
  const lineLength = bayLength * (bayNumber - 1);
  const y_axis = 0;
  const point1 = vec3.fromValues(data[0].x, -y_axis, data[0].z);
  const point2 = vec3.fromValues(data[len-1].x, -y_axis, data[0].z);

  const line = {
    point1: point1,
    point2: point2,
    radius: 500,
    rotation: {
      axis: vec3.fromValues(0, 0, 1),
      angle: -Math.PI,
    },
  };
  console.log(cabinet,"in snapp ",line)
  // Reset snapLines and assign the new line to all bays
  for (const bayKey in cabinet) {
    console.log("bayKey",bayKey)
    if (cabinet.hasOwnProperty(bayKey)) {
      cabinet[bayKey].snapLines = [line];
    }
  }

  const points = [];

  for (let i = 0; i < len; i++) {
    const x = data[i][0];
    const z=data[i][2]
    const newPoint = {
      index: i,
      point: vec3.fromValues(x, 0, z),
      radius: 500,
      rotation: {
        axis: vec3.fromValues(0, 0, 1),
        angle: 0,
      },
    };
    points.push(newPoint);
  }

  // Assign the snapPoints to all cabinet
  let cabinetName;
  for (const bayKey in cabinet) {
    cabinetName=bayKey
    if (cabinet.hasOwnProperty(bayKey)) {
      cabinet[bayKey].snapPoints = points;
    }
  }

  await createSnapPoints(points);
};

