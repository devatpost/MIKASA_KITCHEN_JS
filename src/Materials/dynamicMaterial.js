import neo4j from 'neo4j-driver';
import { bc, updateParameter, wc } from '../main';

export const fetchMaterials=async (session)=> {
    const NEO4J_URI = import.meta.env.VITE_NEO4J_URI??"";
    const NEO4J_USER = import.meta.env.VITE_NEO4J_USER??"";
    const NEO4J_PASSWORD = import.meta.env.VITE_NEO4J_PASSWORD??"";
    const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
   
    const materials= [];
   
    const query = `
        MATCH (m:Material)
        RETURN m.name AS name, m.ct_url AS url, m.roughness_factor as roughness_factor,m.metallic_factor as metallic_factor, m.mrt_url as mrt_url, m.colorHex as hex_code , m.finish_type as type
    `;
   
    const sessionNeo = driver.session();
   
    try {
        // Run the query and process the results
        const result = await sessionNeo.run(query);
   
        result.records.forEach((record) => {
            const material = {
                name: record.get("name"),
                url: record.get("url"),
                metallic_factor: record.get("metallic_factor"),
                roughness_factor: record.get("roughness_factor"),
                mrt_url: record.get("mrt_url"),
                hex_code: record.get("hex_code"),
                type:record.get("type")
            };
            materials.push(material);
        });
   
        const dynamicIconsContainer = document.getElementById("dynamicIcons");
        // const dynamicIconsContainerCounterTop = document.getElementById("dynamicIconsCounterTop");

        materials.forEach((material, index) => {
            // if(material.name === initialColorName){
            //     universalTextureUrl=material.url
            // }
            const tooltipDiv = document.createElement("div");
            tooltipDiv.classList.add("tooltip");

            if(material.type === "Plain"){
                tooltipDiv.classList.add("plain");
            }else{
                tooltipDiv.classList.add("texture");
            }
            
            // Create img element
            const img = document.createElement("img");
            img.src = material.url;  // Set the image source to the URL from the material
            img.alt = `Icon ${index + 1}`;
            img.classList.add("texture-icon", "unselected");
            img.setAttribute("data-index", index);  // Assign the index to data-index

            // Create the tooltip text
            const tooltipText = document.createElement("span");
            tooltipText.classList.add("tooltiptext");
            tooltipText.textContent = material.name; // You can change this to whatever text you want

            // Append the image and tooltip text to the tooltip div
            tooltipDiv.appendChild(img);
            tooltipDiv.appendChild(tooltipText);

            // Append the tooltip div to the dynamicIcons container
            dynamicIconsContainer?.appendChild(tooltipDiv);
        });

        // console.log(materials,"materials")   
        setupClickListeners(materials, session);

    } catch (error) {
        console.error("Error fetching materials: ", error);
    } finally {
        // Always close the session and driver
        await sessionNeo.close();
        await driver.close();
    }
  }


  export function setupClickListeners(materials, session) {
    
    const textureIcons = document.querySelectorAll('.texture-icon');
    textureIcons.forEach((element) => {
        element.addEventListener('click', async () => {
            const dataIndex = element.getAttribute('data-index');
            if (dataIndex !== null) {
                const index = parseInt(dataIndex, 10);
                const material = materials[index];
                const outerColorName = material['name'];
                const outerColor = material['hex_code'];
                const colorTextureUrl = material['url'];
                const metallicFactor = material['metallic_factor'];
                const outerRoughness = material['roughness_factor'];
                const metallicRoughnessUrl = material['mrt_url']; // Ensure this matches Excel column
                // const outerNormalUrl = material['NT URL']; // Ensure this matches Excel column


                // // Log the extracted values
                // console.log(`Extracted values for icon ${index}:`);
                // console.log(`Material Name: ${outerColorName}`);
                // console.log(`Color Hex: ${outerColor}`);
                // console.log(`Color Texture URL: ${colorTextureUrl}`);
                // console.log(`Metallic Roughness URL: ${metallicRoughnessUrl}`);
                // console.log(`Metallic Factor: ${metallicFactor}`);
                // console.log(`Roughness Factor: ${outerRoughness}`);
                // console.log(`Normal Texture URL: ${outerNormalUrl}`);


                // Update all the related parameters
                await updateOuterParameters(session,
                    colorTextureUrl,
                    outerColorName,
                    outerColor,
                    outerRoughness,
                    metallicFactor,
                    metallicRoughnessUrl);
            }
        });
    });
}


export async function updateOuterParameters(session,
    textureUrl,
    colorName,
    color,
    roughness,
    metallicFactor,
    metallicRoughnessUrl
) {
    // Helper function to update a specific parameter
    const updateMaterialParameter = async (paramName, value) => {
        // universalTextureUrl=textureUrl;
        // console.log(paramName,value,"maateiralla")
        if (value !== undefined && value !== null) {
            const param = Object.values(session.parameters).find(p => p.name === paramName);
            if (param) 
            param.value = value;
            await session.customize();
            } else {
                console.error(`${paramName} parameter not found in session.`);
            }
    };

    updateMaterialParameter('Shutter CT URL', textureUrl);
    // updateMaterialParameter('Outer Color Name', colorName);
    updateMaterialParameter('Shutter Color', color);
    updateMaterialParameter('Shutter RF', roughness);
    if (Number.isInteger(metallicFactor)) {
    updateMaterialParameter('Shutter MF', metallicFactor);
    }
    updateMaterialParameter('Shutter MRT URL', metallicRoughnessUrl);

   await updateParameter(wc)
   await updateParameter(bc)
}
