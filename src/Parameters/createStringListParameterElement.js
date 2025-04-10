import { totalCost } from "../BillOfQuantities";

export const updateFeaturesParameters=async(session,parameterObject,index)=>{
  parameterObject.value=index;
  await session.customize();
}


export const createStringListParameterElement = (session, parameterObject,ConfigureTab) => {
    console.log("inin Parameter");
    const paramName=parameterObject.name.replace(" ","")
    //Outer Box
    const headingBox=document.createElement("div");
    headingBox.classList.add("headings")

    //Inner Heading
    const heading=document.createElement('div');
    heading.classList.add("baseCabinets");
    heading.innerText=parameterObject.name;

    headingBox.appendChild(heading)

    //Options Container
    const options=document.createElement("div");
    options.classList.add("baseCabinets");

    parameterObject.choices.forEach((name,index) => {
        const option=document.createElement("div");
        option.classList.add(paramName);
        if(index===Number(parameterObject.value)){
            option.classList.add("selected");
        }
            option.innerText=name;
            option.id = `${index}`;
            option.classList.add("option")
            options.appendChild(option);
    
            // Attach event listener for each button
            option.addEventListener("click", async() => {
                const allOptions = options.querySelectorAll(`.${paramName}`);
                allOptions.forEach(opt => opt.classList.remove("selected"));
                option.classList.add("selected");
                await updateFeaturesParameters(session,parameterObject,option.id);
                totalCost(parameterObject.value)
            });
        });



    //Add all in parent Component
    ConfigureTab.appendChild(headingBox)
    ConfigureTab.appendChild(options)

}