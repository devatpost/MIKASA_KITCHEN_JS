export const materialUI=()=>{
const allCabinetFinish = document.getElementById('allCF');
const plainCabinetFinish = document.getElementById('plainCF');
const textureCabinetFinish = document.getElementById('textureCF');


function setDisplayFlex(elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = 'flex';
    }
}

function setDisplayNone(elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = 'none';
    }
}
// Event listener for toggle
allCabinetFinish.addEventListener('click', () => {
    const plain = document.getElementsByClassName('plain');
    const texture = document.getElementsByClassName('texture');
    allCabinetFinish.style.color="#000000"
    plainCabinetFinish.style.color="#5F5F5F"
    textureCabinetFinish.style.color="#5F5F5F"
    allCabinetFinish.style.textDecoration="underline"
    plainCabinetFinish.style.textDecoration="none"
    textureCabinetFinish.style.textDecoration="none"
    // Apply display: flex to both collections
    setDisplayFlex(plain);
    setDisplayFlex(texture);
});

plainCabinetFinish.addEventListener('click', () => {
    const plain = document.getElementsByClassName('plain');
    const texture = document.getElementsByClassName('texture');
    plainCabinetFinish.style.color="#000000"
    allCabinetFinish.style.color="#5F5F5F"
    textureCabinetFinish.style.color="#5F5F5F"
    plainCabinetFinish.style.textDecoration="underline"
    allCabinetFinish.style.textDecoration="none"
    textureCabinetFinish.style.textDecoration="none"
    // Apply display: flex to both collections
    setDisplayFlex(plain);
    setDisplayNone(texture);
});

textureCabinetFinish.addEventListener('click', () => {
    const plain = document.getElementsByClassName('plain');
    const texture = document.getElementsByClassName('texture');
    textureCabinetFinish.style.color="#000000"
    allCabinetFinish.style.color="#5F5F5F"
    plainCabinetFinish.style.color="#5F5F5F"
    textureCabinetFinish.style.textDecoration="underline"
    allCabinetFinish.style.textDecoration="none"
    plainCabinetFinish.style.textDecoration="none"

    // Apply display: flex to both collections
    setDisplayFlex(texture);
    setDisplayNone(plain);
});

}