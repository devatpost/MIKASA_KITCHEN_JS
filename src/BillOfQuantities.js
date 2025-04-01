export const cabinetMapping= {
  bc1:"Base Cabinet Type 1",
  bc2:"Base Cabinet Type 2",
  bc3:"Base Cabinet Type 3",
  wc1:"Wall Cabinet Type 1",
  wc2:"Wall Cabinet Type 2",
  wc3:"Wall Cabinet Type 3",
}

export const cabinetCostMapping= {
    bc1:25,
    bc2:50,
    bc3:75,
    wc1:15,
    wc2:40,
    wc3:65,
  }

  export const totalCost=(allBays,bc,wc)=>{
    const totalTypesBC=Object.keys(bc);
    const totalTypesWC=Object.keys(wc);
    console.log(totalTypesBC,totalTypesWC)
    let totalSum=0;
    totalTypesBC.forEach(type=>{
        const baseCabinet= allBays.filter(bc => bc.bayName === type);
        totalSum=totalSum+(baseCabinet.length*cabinetCostMapping[type])
     })
 
     totalTypesWC.forEach(type=>{
         const baseCabinet= allBays.filter(wc => wc.bayName === type);
         totalSum=totalSum+(baseCabinet.length*cabinetCostMapping[type]) 
      })

      const priceButton=document.getElementById("totalPrice");
      priceButton.innerText=`$${totalSum}`;
  }

export const populatePopupTable =(allBays,bc,wc)=> {
    // Clear existing rows
    const popupRows = document.getElementById('popupRows');
    popupRows.innerHTML = '';
    const totalTypesBC=Object.keys(bc);
    const totalTypesWC=Object.keys(wc);
    console.log(totalTypesBC,totalTypesWC)


    function createPopupRow(name, quantity, pricePerUnit,type) {
      const total = quantity * pricePerUnit;
      const row = document.createElement('div');
      row.className = 'popup-row';
      row.innerHTML = `
        <div class="center">${name}</div>
        <div class="center">${quantity}</div>
        <div class="center">${pricePerUnit}</div>
        <div class="center">${total}</div>
      `;
      popupRows.appendChild(row);
    }

    totalTypesBC.forEach(type=>{
       const baseCabinet= allBays.filter(bc => bc.bayName === type);
       console.log(baseCabinet)
       if(baseCabinet)
       createPopupRow(cabinetMapping[type],baseCabinet.length,cabinetCostMapping[type],"bc")
    })

    totalTypesWC.forEach(type=>{
        const baseCabinet= allBays.filter(wc => wc.bayName === type);
        console.log(baseCabinet)

        if(baseCabinet)
        createPopupRow(cabinetMapping[type],baseCabinet.length,cabinetCostMapping[type],"wc")
     })
  }