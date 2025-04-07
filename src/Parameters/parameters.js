import { createStringListParameterElement } from "./createStringListParameterElement";

export const createParameterMenu = (session) => {

    const orderedParameters = Object.values(session.parameters)
    const ConfigureTab=document.getElementById("add");

    for (let i = 0; i < orderedParameters.length; i++) {
        const parameterObject = orderedParameters[i] ;
        if ('hidden' in parameterObject && parameterObject.hidden === true) continue;

        // Type guard for ISessionApi before calling functions
        if ("exports" in session && "jwtToken" in session) {
            switch (parameterObject.type) {
                case "StringList":
                    createStringListParameterElement(session, parameterObject,ConfigureTab);
                    break;
            }
        }
    }
};