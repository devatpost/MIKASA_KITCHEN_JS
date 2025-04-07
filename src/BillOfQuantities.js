export const cabinetMapping= {
  0:"One Seater Sofa",
  1:"Two Seater Sofa",
  2:"Three Seater Sofa",
}

export const cabinetCostMapping= {
    0:200,
    1:400,
    2:600,
  }

  export const totalCost=(type)=>{
      
      const priceButton=document.getElementById("totalPrice");
       priceButton.innerText=`$${cabinetCostMapping[type]}`;
  }

export const populatePopupTable =(type)=> {
    // Clear existing rows
    const popupRows = document.getElementById('popupRows');
    popupRows.innerHTML = '';


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

     createPopupRow(cabinetMapping[type],1,cabinetCostMapping[type],type)
  }