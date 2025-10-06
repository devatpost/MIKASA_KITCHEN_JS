import axios from "axios";
import { allBays, bc, session, viewport, wc } from "../main";

// Get Screenshot in form of base64 string
export const getScreenShot = () => {
  const screenshot = viewport.getScreenshot(); 
  return {screenshot}
};

//Fetch the Design information from the Design ID in the Query params
export const fetchDesignData = async () => {
  const queryParams = new URLSearchParams(window.location.search);
  const designId = queryParams.get("designID");

  if (!designId) {
    console.warn("⚠️ No designId found in query parameters.");
    return;
  }

  // const localStorageKey = `design_param_${designId}`;
  // const stored = localStorage.getItem(localStorageKey);

  // if (stored) {
  //   const paramJson = JSON.parse(stored);
  //   console.log("🔁 Received param_json from localStorage:", paramJson);
  //   return;
  // }

  const apiUrl = "https://hy82gexng7.execute-api.ap-south-1.amazonaws.com/dev/design/fetchdesign";

  try {
    const response = await axios.post(apiUrl, { designName: designId });
    const data = response.data;

    localStorage.setItem("param_json", JSON.stringify(data));
    // console.log("⬇️ Fetched and stored param_json from API:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching design data:", error.response?.data || error.message);
  }
};

// Fetch logged in user information:

export const fetchUserInfo = () => {
  // You can later replace this with actual API/cookie/JWT logic

  
  return {
    username: "Abhay Sharma",
    company: "Mikasa",
    configurator_name: "Kitchen",
    subscription_type: "Enterprise" 
  };
};

/**
 * Sends the design, user_info, from localStorage to your Netlify function.
 */
export const sendDataToServer = async (Materials, PopupInfo) => {

  // console.log("the function is called")

  // Fetching the current paramJson
const Parameters = session.parameters;

// helper to keep only counter + matrices, and make matrices JSON-safe
const toArr = (m) => ({
  transformation: Array.from(m.transformation || []),
  rotation: Array.from(m.rotation || []),
  translation: Array.from(m.translation || [])
});
function pickCounterAndMatrices(record) {
  const slim = {};
  Object.entries(record).forEach(([key, val]) => {
    slim[key] = {
      counter: val && val.counter ? val.counter : 0,
      matrices: (val && val.matrices ? val.matrices : []).map(toArr)
    };
  });

  console.log(slim)
  return slim;
}

// build your final object
const obj = {
  parameters: Object.values(Parameters).map((param) => ({
    name: param.name,
    value: param.value
  })),
  outputs: {
    base: pickCounterAndMatrices(bc),  // only counter + matrices
    wall: pickCounterAndMatrices(wc)   // only counter + matrices
  },
  allBays: allBays.map(({ matrices, ...rest }) => ({
    ...rest,
    matrices: toArr(matrices)        // <-- converts Float32Array -> number[]
  }))
};

console.log(JSON.stringify(obj, null, 2));


console.log(obj);

  
  const paramJson = JSON.stringify(obj);
  const userInfo = fetchUserInfo();
  const screenshotData = getScreenShot();
  const material_json = Materials;

  // console.log(screenshotData,"Hiiii")
  // console.log(paramJson,"Hiiii")
  // console.log(userInfo,"Hiiii")
  // console.log(JSON.parse(material_json))
  // console.log(PopupInfo)

  if (!paramJson || !userInfo || ! screenshotData) {
    console.error("Missing Design or user_info in localStorage.");
    return;
  }

  try {
    const response = await fetch("https://hy82gexng7.execute-api.ap-south-1.amazonaws.com/dev/designs/uploadDesign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        param_json: JSON.parse(paramJson),
        user_info: userInfo,
        image: screenshotData,
        material_info: JSON.parse(material_json),
        popupInfo: PopupInfo
      }), 
    });

    const result = await response.json();
     console.log("✅ Server response:", result.status);
    // console.log("✅ Server response:", result);


    if (result.designName  && PopupInfo.sendDesignMail) {
      console.log("Sending design Email")
      const designURL = `https://configcloud.ai/sideboarddemo/?designID=${encodeURIComponent(
        result.designName 
      )}`;
      try {
        const mailResponse = await fetch("https://hy82gexng7.execute-api.ap-south-1.amazonaws.com/dev/email/sendDesignMail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: PopupInfo.name,
            email: PopupInfo.email,
            designURL: designURL,
          }),
        });

        const mailResult = await mailResponse.json();
        console.log("📧 Mail API response:", mailResult);
      } catch (mailError) {
        console.error("❌ Error sending design mail:", mailError);
      }
    }
    console.log("✅ Server response:", result);
  } catch (error) {
    console.error("❌ Error sending data to server:", error);
  }
};
