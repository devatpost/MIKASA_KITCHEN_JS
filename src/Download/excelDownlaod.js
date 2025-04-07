import * as XLSX from 'xlsx';
import { allBays, bc, wc } from '../main';
import { cabinetCostMapping, cabinetMapping } from '../BillOfQuantities';

export const Excel = (userName,userEmail,type) => {
    const excelData=[];
    const workbook = XLSX.utils.book_new();

        excelData.push({
            name:cabinetMapping[type],
            quantity:1,
            costperunit:cabinetCostMapping[type],
            total:cabinetCostMapping[type]
        })

    const additionalColumns = {
        'Costing': '',
        'Total': '',
    };

    // Dynamic order date
    const orderDate = new Date().toLocaleDateString();

    // Basic product information
    const productInfo = [
        { A: 'Product', B: 'Kitchen' },
        { A: 'Client Name', B: userName },
        { A: 'Client Email', B: userEmail },
        // { A: 'Order Number', B: 105 },
        { A: 'Order Date', B: orderDate },
    ];

    // Dimensions for bays
    // const bayDimensions = {
    //     Length: '0.73m',
    //     Width: '0.30m',
    //     Height: '0.02m',
    //     Material: jsonData.material || 'Default Material',  // Fallback if no material is set
    // };

    // Pipe dimensions (Assuming static values for illustration)
    // const pipeDimensions = {
    //     pipe1: { Height: '0.2m', Length: '100mm', Width: '50mm', Material: jsonData.material },
    //     pipe2: { Height: '0.3m', Length: '150mm', Width: '60mm', Material: jsonData.material },
    //     pipe3: { Height: '0.4m', Length: '200mm', Width: '70mm', Material: jsonData.material },
    // };

    // Initialize dataRows array
    const dataRows = [];
    console.log(excelData)
    // Process bays
    excelData.forEach((obj, index) => {
        dataRows.push({
            'S.no': index + 1,
            'Item': obj.name,
            'Quantity': obj.quantity,
            'Price per Unit':obj.costperunit,
            "Total":obj.total
            // ...additionalColumns,  // Add other predefined columns
        });
    });

    console.log(dataRows,"rororo")
    // // Process pipes (continuing the serial number from bays)
    // Object.entries(jsonData.pipes).forEach(([key, value], index) => {
    //     let temp;
    //     if(key === 'pipe1')
    //       temp="Pipe_Type_1"
    //     if(key === 'pipe2')
    //       temp="Pipe_Type_2"
    //     if(key === 'pipe3')
    //       temp="Pipe_Type_3"
    //     dataRows.push({
    //         'S.no': dataRows.length + 1,  // Continue serial number from previous data
    //         'Item': temp,
    //         'Quantity': value,
    //         'Length (mm)': pipeDimensions[key]?.Length || '',  // Use optional chaining
    //         'Width (mm)': pipeDimensions[key]?.Width || '',
    //         'Height (mm)': pipeDimensions[key]?.Height || '',
    //         'Material': pipeDimensions[key]?.Material || '',
    //         ...additionalColumns,
    //     });
    // });

    // // Add Pipe Tops and Pipe Legs directly from jsonData
    // if (jsonData.pipeTops || jsonData.pipeLegs) {
    //     dataRows.push({
    //         'S.no': dataRows.length + 1,
    //         'Item': 'Pipe Tops',
    //         'Quantity': jsonData.pipeTops,
    //         'Length (mm)': 'N/A',  // Add specific lengths if needed
    //         'Width (mm)': 'N/A',   // Add specific widths if needed
    //         'Height (mm)': '0.1',  // Add specific heights if needed
    //         'Material': jsonData.material,
    //         ...additionalColumns,
    //     });

    //     dataRows.push({
    //         'S.no': dataRows.length + 1,
    //         'Item': 'Pipe Legs',
    //         'Quantity': jsonData.pipeLegs,
    //         'Length (mm)': 'N/A',
    //         'Width (mm)': 'N/A',
    //         'Height (mm)': '0.1',
    //         'Material': jsonData.material,
    //         ...additionalColumns,
    //     });
    // }

    // Generate worksheet
    const worksheet = XLSX.utils.json_to_sheet([]);

    // Add product info manually to specific rows and columns
    XLSX.utils.sheet_add_json(worksheet, productInfo, { skipHeader: true, origin: 'A1' });

    // Leave a gap and then add the BOM data starting from row 7
    XLSX.utils.sheet_add_json(worksheet, dataRows, { origin: 'A7' });

    // Append worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Create Excel file as a blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Convert buffer to a blob for downloading
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // Create a URL for the blob and trigger download
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${userName}_Mikasa_Sofa.xlsx`; // Filename of the Excel file
    anchor.click();

    // Clean up the URL object after download
    URL.revokeObjectURL(url);
};
