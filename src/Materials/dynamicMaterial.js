import neo4j from 'neo4j-driver';
import { bc, session, updateParameter, viewport, wc } from '../main';
import { GeometryData, MaterialEngine, MaterialStandardData } from '@shapediver/viewer';
const materialEngine = MaterialEngine.instance;

export const fetchMaterials=async (session)=> {
    const NEO4J_URI = import.meta.env.VITE_NEO4J_URI??"";
    const NEO4J_USER = import.meta.env.VITE_NEO4J_USER??"";
    const NEO4J_PASSWORD = import.meta.env.VITE_NEO4J_PASSWORD??"";
    const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
   
    const materials= [];
   
    const query = `
        MATCH (m:Material) 
        WHERE m.surface_type = "Fabric" 
        RETURN m.name AS name, 
            m.ct_url AS url, 
            m.roughness_factor AS roughness_factor, 
            m.metallic_factor AS metallic_factor, 
            m.mrt_url AS mrt_url, 
            m.nt_url AS nt_url, 
            m.hexColor AS hex_code, 
            m.finish_type AS type,
            m.dt_url AS dt_url,
            m.aot_url AS aot_url,
            m.displacement_factor AS disp_factor
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
                nt_url:record.get("nt_url"),
                hex_code: record.get("hex_code"),
                type:record.get("type"),
                dt_url:record.get("dt_url"),
                aot_url:record.get("aot_url"),
                disp_factor:record.get("disp_factor")
            };
            materials.push(material);
        });
        
        console.log(materials,"ammam")
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

  const replaceMaterial = async(
    node,
    materialName,
    material
  ) => {
    for (let i = 0; i < node?.data?.length; i++) {
      // or can be assigned to a geometry
      if (node.data[i] instanceof GeometryData) {
        const geometry = node.data[i];
        console.log(geometry,materialName)
        if (geometry.material && geometry.material.name === materialName)
            geometry.material = material;
        geometry.standaradMaterial = material;

      }
    }
  
    for (let i = 0; i < node.children.length; i++)
      replaceMaterial(node.children[i], materialName, material);
  };


  export function setupClickListeners(materials, session) {
    
      const primaryOutput=session.getOutputByName("glTFDisplay")[0]
      const requireNode=primaryOutput.node.getNodesByName("Top")[0];
      const material = new MaterialStandardData();
    console.log(materials,material)
    const textureIcons = document.querySelectorAll('.texture-icon');
    textureIcons.forEach((element,index) => {
        element.addEventListener('click', async () => {
            console.log(materials[index].url)
            material.aoMap = (await materialEngine.loadMap(
                materials[index].aot_url
              )) || undefined; 
            material.map =(await materialEngine.loadMap(
                materials[index].url
              )) || undefined;
              material.displacementMap =(await materialEngine.loadMap(
                materials[index].dt_url
              )) || undefined;  
              material.metalnessRoughnessMap =(await materialEngine.loadMap(
                materials[index].mrt_url
              )) || undefined;  
              material.normalMap =(await materialEngine.loadMap(
                materials[index].nt_url
              )) || undefined;    
              material.roughness=materials[index].roughness_factor
              material.metalness=materials[index].metallic_factor;
              material.displacementScale=materials[index].disp_factor
            material.name="sofa_fabric"         
        console.log(material)
        replaceMaterial(requireNode, "sofa_fabric", material);
        primaryOutput.node.updateVersion();
        viewport.update();
    });
})}

