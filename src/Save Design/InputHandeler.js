export const handleInputs = ()=> {
    // console.log(userType,"userrere")
    const popup = document.querySelector('.inputpopup');
    const overlay = document.querySelector('.popup-overlay-input');
    
    // Input fields and error messages
    const nameInput = document.getElementById('name-input')
    const emailInput = document.getElementById('email-input');
    const projectInput = document.getElementById('project-input');
    const remarksInput = document.getElementById('remarks-input');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const projectError = document.getElementById('projectError');
    const roomInput = document.getElementById('room-type-input');
    const designMailInput = document.getElementById('send-email-checkbox');
    console.log(roomInput,"sdfsdfsdf")
    

    if (!popup || !overlay || !nameInput || !emailInput || !nameError || !emailError || !projectInput || !projectError || !remarksInput) {
        console.error("Required elements are missing.");
        return; // Exit early if elements are not found
    }

    const validateInputs = () => {
        let isValid = true;
        if(nameError){
            nameError.style.display="none";
            nameInput.style.border = '1px solid #7C7C7C';
        }
        
        if(emailError){
            emailError.style.display="none";
            emailInput.style.border = '1px solid #7C7C7C';
        }

        if(projectError){
            projectError.style.display="none";
            projectInput.style.border = '1px solid #7C7C7C';
        }
        // Validate name (non-empty and contains only letters and spaces)
        if (!nameInput.value.trim() || !/^[a-zA-Z\s]+$/.test(nameInput.value.trim())) {
            if (nameError) {
                nameError.style.display="flex";
                nameInput.style.border = '1px solid #8B0000'; // Add red outline
            }
            isValid = false;
        } 

        // Validate email (non-empty and valid format)
        if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            if (emailError) {
                emailError.style.display="flex";
                emailInput.style.border = '1px solid #8B0000'; // Add red outline
            }
            isValid = false;
        }

        if (!projectInput.value.trim()) {
            if (projectError) {
                projectError.style.display="flex";
                projectInput.style.border = '1px solid #8B0000'; // Add red outline
            }
            isValid = false;
        }

        return isValid;
    };

    if (validateInputs()) {
        const userData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            projectName:projectInput.value.trim(),
            remarks:remarksInput.value.trim(),
            roomType: roomInput.value.trim(),
            sendDesignMail: designMailInput.checked
        };

        // localStorage.setItem('userDetails', JSON.stringify(userData));
        popup.style.display = 'none';
        overlay.style.display = 'none';
        nameInput.value='';
        emailInput.value='';
        projectInput.value='';
        remarksInput.value='';
        roomInput.value='';
        designMailInput.checked = false; // ✅ reset checkbox too


        return userData;
    }else{
        return false;
    }
}