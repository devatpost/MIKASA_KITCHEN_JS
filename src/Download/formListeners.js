import { requestExport } from "./export";

export function setSelectedExports(selectedExports) {
    selectedExports = []; // This will allow you to set or clear the export object
}

export function resetCheckboxes() {
    const checkboxes = document.querySelectorAll('.check') ;
    checkboxes.forEach((checkbox) => {
        checkbox.checked = false; // Uncheck all checkboxes
    });
}

export function setupFormListener(session,selectedExports) {
    const submitButton = document.getElementById('userInfoSumbit');
    const userNameField = document.getElementById('userName') ;
    const userEmailField = document.getElementById('userEmail');
    // Get all elements with the class name "error"
    const errorImages = document.getElementsByClassName("error");
    const errorStat=document.getElementsByClassName("error_handler")
    // Ensure the elements exist before proceeding
    if (!userNameField || !userEmailField || !submitButton) {
        console.error("Form fields or submit button not found.");
        return;
    }
    
    const userData = JSON.parse(localStorage.getItem("userDetails")) || {};

    // Ensure form fields exist before updating values
    if (userData) {
        userNameField.value = userData.name ?? "";
        userEmailField.value = userData.email ?? "";
    }
    
    // console.log(userNameField, userEmailField, userData);
    // Check if user data exists in localStorage
    userNameField.addEventListener('input', () => {
        // console.log("User is typing in the username field");
        userNameField.style.border = '';  // Remove the red outline when user starts typing
    });


    userEmailField.addEventListener('input', () => {
        // console.log("User is typing in the email field");
        userEmailField.style.border = '';  // Remove the red outline when user starts typing
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const usernameRegex = /^[A-Za-z]+( [A-Za-z]+)*$/;

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default form submission
        // const userTypeElement = document.querySelector('input[name="userType"]:checked');
        // const userType = (userTypeElement as HTMLInputElement)?.value;  
        // Check if user data is correctly retrieved from localStorage
        const userName = userNameField.value;
        const userEmail = userEmailField.value;
        // Map the userType to the correct numeric value (e.g., Manufacturer -> 0, Designer -> 3)
        // const mappedUserType = createUserTypeMapping(userType);
        // Simple validation for empty fields
        let isValid = true;
        // Validate username (must not contain numbers or special characters)
        if (!userName || !usernameRegex.test(userName)) {
            userNameField.style.border = '1px solid #8B0000'; // Add red outline
            errorImages[0].style.display = 'block'; 
            errorStat[0].style.display='block'
            isValid = false;
        }else{
            errorImages[0].style.display = 'none'; // Hide the error image
            errorStat[0].style.display='none'
        }
        // Validate email format
        if (!userEmail || !emailRegex.test(userEmail)) {
            userEmailField.style.border = '1px solid #8B0000'; // Add red outline
            errorImages[1].style.display = 'block'; 
            errorStat[1].style.display='block'
            isValid = false;
        }else{
            errorImages[1].style.display = 'none'; // Hide the error image
            errorStat[1].style.display='none'
        }
        // If validation fails, stop submission
        if (!isValid || !userType) {
            // console.log("Validation failed, form not submitted");
            return;
        }

        // Call the update function with the form data
        await updateFormParameters(session, {
            name: userName,
            email: userEmail,
            // userType: mappedUserType.toString()
        });

        // After form submission, trigger the export when selected
        if (selectedExports.length>0) {
            for (const exportObject of selectedExports) {
                await requestExport(session, [exportObject],userName,userEmail); // Pass the name of each selected export
            }     
            if(selectedExports.includes("Email 2D CAD Drawing")){
                //Dont send mail as it is already contained in CAD Mail
            }else{
                // const Process_PDF = Object.values(session.parameters).find(param => param.name === 'Process_PDF') as IParameterApi<boolean>;
                const sendMail = session.getExportByName("Email PDF");
                if(sendMail){
                    // Process_PDF.value=true;
                    // await session.customize();
                    const mail=sendMail[0];
                    const sendingMail= await mail.request();
                    // Process_PDF.value=false;
                    // await session.customize();
                }
            }
        }
        setSelectedExports(selectedExports); // Clear the selected export after use
        resetCheckboxes();
        const downloadIconContainer=document.getElementById("downloads");
        downloadIconContainer.style.display="none"
    });
}

// Function to update ShapeDiver session parameters for Name, Email, and User Type
async function updateFormParameters(session, params) {
    const updateParameter = async (paramName, value) => {
        const param = Object.values(session.parameters).find(p => p.name === paramName);
        if (param) {
            param.value = value.toString();
            await session.customize(); 
            // console.log(`Updated ${paramName} to: ${value}`);
        } else {
            console.error(`${paramName} parameter not found in session.`);
        }
    };

    // Update ShapeDiver parameters with form values
    await updateParameter('Your Name', params.name); 
    await updateParameter('Your Email', params.email); 
    // await updateParameter('User Type', params.userType); 
}