// import neo4j from 'neo4j-driver';

// const NEO4J_URI = import.meta.env.VITE_NEO4J_URI;
// const NEO4J_USER = import.meta.env.VITE_NEO4J_USER;
// const NEO4J_PASSWORD = import.meta.env.VITE_NEO4J_PASSWORD;

export const handleInputsForDownloads = (userType)=> {
    // console.log(userType,"userrere")
    const popup = document.querySelector('.inputpopup');
    const overlay = document.querySelector('.popup-overlay-input');
    const continueBtn = document.getElementById('continue-btn') ;
    
    // Input fields and error messages
    const nameInput = document.getElementById('name-input') 
    const emailInput = document.getElementById('email-input') ;
    const nameError = document.getElementById('nameError') ;
    const emailError = document.getElementById('emailError') ;

    

    if (!popup || !overlay || !continueBtn || !nameInput || !emailInput || !nameError || !emailError) {

        return; // Exit early if elements are not found
    }

    const validateInputs = () => {
        let isValid = true;
        if(nameError){
            nameError.style.display="none";
        }
        
        if(emailError){
            emailError.style.display="none";
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

        return isValid;
    };

    if (validateInputs()) {
        const userData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            userType:userType==="" ? "Manufacturer" : userType
        };

        // Store values in localStorage
        localStorage.setItem('userDetails', JSON.stringify(userData));
        // sendLocalStorageToServer()
        // const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
        // const session = driver.session();

        // session
        //     .run(
        //         `MERGE (u:ShelveUser {name: $name, email: $email, userType: $userType})`,
        //         { name: userData.name, email: userData.email, userType: userData.userType }
        //     )
        //     .then(() => {
        //   
        //     })
        //     .catch((error) => {
        //         console.error('Error adding user to Neo4j:', error);
        //     })
        //     .finally(() => {
        //         session.close();
        //         driver.close();
        //     });

        // Close popup
        popup.style.display = 'none';
        overlay.style.display = 'none';

     
    }
}

export default handleInputsForDownloads;