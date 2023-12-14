sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        oDialog: null,
        excelSheetsData: [],
        onDownloadTemplatePress: function() {
            console.log("dkjcb")
            var ws = XLSX.utils.aoa_to_sheet([["Header1", "Header2"], [1, 2], [3, 4]]);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        
            // var blob = XLSX.write(wb, { bookType: 'xlsx', type: 'blob' });
        
            // var link = document.createElement("a");
            // link.href = window.URL.createObjectURL(blob);
            // link.download = "salesorder_template.xlsx";
            // link.click();
        },
        onUploadExcel: function(oEvent) {
            // MessageToast.show("Custom handler invoked.");
            if (!this.oDialog) {
                this.oDialog = new sap.ui.xmlfragment("salesorder.fragment.popup", this);
                this.getView().addDependent(this.oDialog);

                this.oDialog.attachBeforeClose(this.setDataToJsonFromExcel, this);
            }
            this.oDialog.open();
        },
        setDataToJsonFromExcel: function (oEvent) {
            // debugger;
            // var XLSX;
            var oUploader = oEvent.getSource().getContent()[0];
            this.oDataModel = this.getView().getModel();
            var domRef = oUploader.oFileUpload;
            if (!domRef.files) {
                console.log("if runs");
                return;

            }
            else {
                var file = domRef.files[0];

                var that = this;
                //start of code to fetch data from excel sheet
                var payload = []
                var excelData = {};

                if (file && window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var data = e.target.result;
                        var workbook = XLSX.read(data, {
                            type: 'binary'
                        });
                        // let obj1 = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[0]])
                        // obj1[0].to_Item.results = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[1]])[0]
                        // console.log("object with item",obj1)
                        workbook.SheetNames.forEach(function (sheetName) {
                            // Here is your object for every sheet in workbook
                            excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                            console.log("sheet data ", excelData);
                            payload.push(excelData[0])
                        });

                        console.log("our data is ", payload);
                        // debugger;

                        payload[0].to_Item = { "results": [payload[1]] };
                        // payload[0].to_Item['results'][0].to_Item_Ass = { "results": [payload[2]] }

                        let newPayload = payload[0]
                        console.log(newPayload)

                        that.oDataModel.create("/zsalesorder_hdr_c", newPayload, {

                            success: function () {
                                MessageToast.show("Data Uploaded into SAP");
                            },
                            error: function () {
                                MessageToast.show("ERROR");

                            }
                        });
                    };

                    //FileReader will start  reading the file
                    reader.readAsBinaryString(file);

                }

            }
        },
        onCloseDialog: function () {
            this.oDialog.close();
            // MessageToast.show("Custom handler invoked.");

        },
    };
});