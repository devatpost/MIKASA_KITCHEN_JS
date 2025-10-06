import { session } from "../main";

export const applyLoadedParam=async(loadedParam)=>{

        //  console.log(loadedParam,"new loaded")
        // Loop through the named parameters and map them to IDs
        loadedParam.forEach((param)=>{
            let parameter=session.getParameterByName(param.name)[0]
            if (parameter) {
               parameter.value=param.value;
            }
        })
        // Apply the design with IDs using the session.customize method
        await session.customize();
        // console.log("Design applied with mapped IDs.");
}