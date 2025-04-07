
let initial=true;

//Handle configure and style tab
export const addAndStyle = ()=>{
    const styleButton=document.getElementById("addStyle");
    const addButton=document.getElementById("addButton");
    const style=document.getElementById("style");
    const add=document.getElementById("add");
    styleButton.addEventListener("click",()=>{
        if(initial){
            style.style.display="flex"
            add.style.display="none"
            initial=!initial;
            styleButton.style.fontWeight="500"
            addButton.style.fontWeight="300"

        }
    })

    addButton.addEventListener("click",()=>{
        if(!initial){
            style.style.display="none"
            add.style.display="flex"
            initial=!initial;
            styleButton.style.fontWeight="300"
            addButton.style.fontWeight="500"

        }
    })

}