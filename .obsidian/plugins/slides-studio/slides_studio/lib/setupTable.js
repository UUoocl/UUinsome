let table;
let isKeyPressed = false;

function loadTable() {
    //get local storage slide deck attributes first
    const tableData = JSON.parse(localStorage.getItem(slideDeckId)) ?? slidesArray;
    
    table = undefined;
    table = new Tabulator("#slidesTable", {
        layout:"fitDataStretch",
        height: "500px",
        data: tableData,
        dataTree: true,
        dataTreeStartExpanded: true,
        dataTreeSort:true,
        //enable range selection        
        selectableRange:1,
        selectableRangeClearCells:true,
        //configure clipboard to allow copy and paste of range format data
        clipboard:true,
        clipboardCopyStyled:false,
        clipboardCopyConfig:{
            rowHeaders:false,
            columnHeaders:false,
        },
        clipboardCopyRowRange:"range",
        clipboardPasteParser:"range",
        clipboardPasteAction:"range",
        initialSort:[
            {column:"slideState", dir:"asc"}, //sort by this first
        ],
        columns: [
            { title: "Index", field: "slideState",  responsive: 0,
                cellClick: function gotoSlide(e,cell){
                    let rowValues = cell.getRow().getData();
                    filterRowData(rowValues);
                },
                sorter:"alphanum",
            }, 
            {title:"Scene", field:"scene", width: 150, editor:"list", editorParams:{
                values: dropDownOptions.scene},
                cellEdited: saveTableToLocalStorage
            },
            // { title: "Name", field: "slideName", width: 70, responsive: 2 }, 
            {title:"Slide Position", field:"slidePosition", editor:"list", editorParams:{
                values: dropDownOptions.slidePosition},
                cellEdited: saveTableToLocalStorage
            },
            {title:"camera Position", field:"cameraPosition", editor:"list", editorParams:{
                values: dropDownOptions.cameraPosition},
                cellEdited: saveTableToLocalStorage
            },
            {
                title:"Camera Shape", field:"cameraShape", editor:"list", editorParams:{
                values: dropDownOptions.cameraShape},
                cellEdited: saveTableToLocalStorage
            }
        ],
    });
    
    
    //slide attribute changed
    function saveTableToLocalStorage(event,cell){
        //save table data
        if(slideDeckId.length > 0){
            localStorage.setItem(slideDeckId, JSON.stringify(table.getData()));
        }
    }
    
    //Table row Clicked
    table.on("rowClick", function (e, row) {
        table.deselectRow();
        table.selectRow(table.getRowFromPosition(row.getPosition()));
        selectedRowNumber = row.getPosition()
    });
    

    document.addEventListener('keydown', function(event) {
        if (event.key === ' ' && !isKeyPressed){ 
            isKeyPressed = true;
            
            event.preventDefault(); // Prevents page scrolling
            //console.debug('Spacebar pressed, default scroll prevented', selectedRowNumber);
            table.deselectRow();
            selectedRowNumber += 1;                        
            table.selectRow(table.getRowFromPosition( selectedRowNumber ));
            filterRowData(table.getRowFromPosition(selectedRowNumber).getData())
        }   
    });
    
    document.addEventListener('keyup', function(event) {
        if (event.key === ' ') {
            isKeyPressed = false;
        }
    });
}
        