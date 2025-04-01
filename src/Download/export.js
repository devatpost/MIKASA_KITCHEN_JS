import { Excel } from "./excelDownlaod";

export async function requestExport(session, exportNames,userName,userEmail) {
    for (const exportName of exportNames) {
        const downloadExports = session.getExportByName(exportName);
        try {
            if(exportName === "Email 2D CAD Drawing"){
                const cutSheet = Object.values(session.parameters).find(param => param.name === 'Cut_sheet');
                if (cutSheet) {
                    cutSheet.value=true;
                    await session.customize();
                    const downloadExport = downloadExports[0];
                    const resultDownloadExport = await downloadExport.request();
                    cutSheet.value = false;
                    await session.customize();
                }
            } else if(exportName === "Download Excel"){
                Excel(userName,userEmail)
            }
            else {
                // const Process_PDF = Object.values(session.parameters).find(param => param.name === 'Process_PDF');
                // if(Process_PDF){
                //     Process_PDF.value=true;
                //     await session.customize();
                // }
                    let resultDownloadExport;
                    const downloadExport = downloadExports[0];
                    console.log(downloadExport)
                    resultDownloadExport = await downloadExport.request();
                    // if(exportName === "Rhino 3D Model"){
                    // function downloadImage(imageUrl:string, filename = 'downloaded-image.jpg') {
                    //     fetch(imageUrl)
                    //         .then(response => response.blob())
                    //         .then(blob => {
                    //             const link = document.createElement('a');
                    //             link.href = URL.createObjectURL(blob);
                    //             link.download = filename;
                    //             document.body.appendChild(link);
                    //             link.click();
                    //             document.body.removeChild(link);
                    //         }).catch(error => console.error('Error downloading image:', error));
                    //     }
                    //   downloadImage(universalTextureUrl, "texture.jpg");
                    // }
                    if (resultDownloadExport && resultDownloadExport.content && resultDownloadExport.content[0]) {
                        const content = resultDownloadExport.content[0];
                        if ('href' in content && content.href) {
                            window.open(content.href);
                        }
                    }
                    // Process_PDF.value=false;
                    // await session.customize();
            }
        } catch (error) {
            console.error('Error during export process:', error);
        } finally {
            if (exportName === exportNames[exportNames.length - 1]) {
                const iniPopup=document.getElementById("iniPopup") 
                const overlay=document.getElementById("iniPopupOverlay")
                iniPopup.style.display = 'none';
                overlay.style.display = 'none';
                const downloadPopup=document.getElementById("userInfoPopup");
                downloadPopup.style.display="none"
            }
        }
    }
}