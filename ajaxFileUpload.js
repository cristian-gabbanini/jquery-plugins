"use strict";
(function($){
    
    var iFrame = {
        
        id: "",
        currentSpanVisibleId: "",
        options: {},
        
        uploadForm : {                       
            
            id: "",
                                 
            addFileInput: function(fileInput) {                
                $("#" + iFrame.id).contents().find("#" + this.id).append(fileInput.clone());
            },
            
            showUploadingAnim: function (){
                iFrame.currentSpanVisibleId = "uploadAnim";
                $("#" + iFrame.currentSpanVisibleId).fadeIn(500, function(){
                    iFrame.uploadForm.submitAction();
                }); 
            },
            submitAction: function() {
                $("#" + iFrame.id).contents().find("#" + this.id).submit();    
            },
            submit: function(){
                             
                if (iFrame.currentSpanVisibleId !== "") {
                    console.log("HIDING " + iFrame.currentSpanVisibleId);
                    $("#" + iFrame.currentSpanVisibleId).fadeOut(500, function(){
                        iFrame.uploadForm.showUploadingAnim();
                    });     
                } else {
                    console.log("here");
                    this.showUploadingAnim();
                }                                 
            }
        },
        
        openDocument: function(){
            var iFrameDoc = $("#" + this.id).contents()[0];
                iFrameDoc.open();
                iFrameDoc.write('<!doctype html><html><head></head><body></body></html>');
                iFrameDoc.close();    
        },
        
        addInputControlToForm: function(formId){
           $("<input>", {
                id: "iFrameLoaded",
                type: "hidden",
                value: 0
            }).appendTo("#" + formId);
            
            this.addReadyListener("iFrameLoaded");
        },
        
        appendToForm : function(formId) {
            $("<iframe>", {
                id: this.id,
                style: "display:none;"                
            }).appendTo($("#" + formId));   
        },
        
        createHTML: function(uploadFormId, uploadFormAction){
            
            this.openDocument();
            
            var contentHTML = iFrameHTML.replace("{{UPLOADFORMID}}", uploadFormId);
                contentHTML = contentHTML.replace("{{UPLOADFORMACTION}}", uploadFormAction);
                
            $('body', $("#" + this.id).contents()).append(contentHTML);
        },
        
        eventHandler: function(e){
            
            if (e.nodeName === 'JSON') {
                console.log("JSON NODE DETECTED");
            }
        },
        
        /**
         * Listen for value change of inputFieldId and reacts as a consequence
         * parsing the json tag in the iFrame 
         * @param {string} inputFieldId
         * @returns {undefined}
         */
        addReadyListener: function(inputFieldId){
            $("#" + inputFieldId).on("change", function(e) {                
                if (parseInt($(e.target).val()) === 1) {
                    
                    var spanToShowId = "uploadError";                                        
                    
                    // Parse the <json></json> tag 
                    var jsonData = $.parseJSON($("#" + iFrame.id).contents().find("json").text());
                    
                    
                    // If error property is null was successfull
                    if (jsonData.error === null){
                        
                        $("#uploadInfoText")
                            .html("<strong>File type</strong>:&nbsp;" 
                                + jsonData.mimeType 
                                + "&nbsp;-&nbsp;<strong>Size</strong>:&nbsp;"
                                + jsonData.size);
                            
                        spanToShowId = "uploadInfo";
                        
                        // Adds a hidden input text field to the main form
                        // which stores the session uid containing the file
                        // uploaded
                        $("<input/>", {
                            name: "uid",
                            id: "c_file_uid",
                            value: jsonData.uid,
                            type: "hidden"
                        }).appendTo($("#" + iFrame.options.formId));
                        
                    // otherwise upload failed
                    } else {
                        
                        $("#uploadErrorText")
                            .html("<strong>Error while uploading file</strong>:&nbsp;" 
                                + jsonData.error);                        
                    }
                    
                    
                    $("#c_fileUploadControlsContainer").hide(300, function(){
                        $("#c_filename_disabled")
                            .val($("#" + iFrame.options.fileNameId).val());
                        $("#c_discardUploadContainer").fadeIn(300);
                    });
                    // Reset input field value
                    $(e.target).val(0);
                    
                    iFrame.createHTML(iFrame.options.iFrameUploadFormId, iFrame.options.iFrameUploadFormAction);
                    
                    // Hides loading animation and shows information/errors
                    $("#" + iFrame.currentSpanVisibleId).fadeOut(500, function(){
                        iFrame.currentSpanVisibleId = spanToShowId;
                        $("#" + spanToShowId).fadeIn(500);
                    });                   
                    
                }
            });
        }
    };
    
    var instances = {};
    
    var infoHTML = "" +
            '<p id="uploadAnim" class="text-warning" style="display:none;margin-left:10px;"><i class="fa fa-cog faa-spin animated"></i>&nbsp;&nbsp;Uploading file...</p>' +
            '<p id="uploadError" class="text-error" style="display:none;margin-left:10px;"><i class="fa fa-exclamation-triangle faa-flash animated"></i>&nbsp;&nbsp;<span id="uploadErrorText">Unexpected error...</span></p>'+
            '<p id="uploadInfo" class="text-muted" style="display:none;margin-left:10px;"><i class="fa fa-file-code-o"></i>&nbsp;&nbsp;<span id="uploadInfoText">Generic file informations...</span></p>';
    
    // The following script is used to inform the parent page that
    // the iframe was loaded
    var iFrameHTML = "" + 
       
            '<form id="{{UPLOADFORMID}}" method="post" action="{{UPLOADFORMACTION}}" enctype="multipart/form-data">' +
                '<input type="hidden" name="MAX_FILE_SIZE" value="8388608" />' +
            '</form>' +
            '<script type="text/javascript">' + 
                'window.onload = function(){' +
                    'var inputField = parent.window.document.getElementById("iFrameLoaded");' +
                    'inputField.value = 1;' +
                    'parent.$(inputField).trigger("change");' +
                '};' +
            '</script>' ;
 

    var template = [
        '<div id="c_discardUploadContainer" class="input-prepend" style="display:none;">',
            '<button type="button" class="btn btn-danger" id="c_discard_button">Discard</button>',
            '<input class="{{FILENAMECLASS}}" id="c_filename_disabled" type="text"  disabled>',
        '</div>',
        '<div id="c_fileUploadControlsContainer" class="input-prepend">',
            '<span id="c_fileInputContainer" class="btn btn-default btn-file">',
                '{{TEXT}}',           
            '</span>',
            '<input class="{{FILENAMECLASS}}" id="{{ID}}" type="text" placeholder="{{FILENAMEPLACEHOLDER}}">',        
        '</div>'
    ];
    
    
    var AjaxFileUpload = function(inputFileField, options) {
        
        this.detachEventHandlers = function(){
           $("#c_fileInputContainer, #" + options.fileNameId).off("click", function(e){
                inputFileField.trigger("click");
            });
            
            inputFileField.off("change", function(e){
                $("#" + options.fileNameId).val($(this).val());
            }); 
        };
        
        this.attachEventHandlers = function(){
            $("#c_fileInputContainer, #" + options.fileNameId).on("click", function(e){
                inputFileField.trigger("click");
            });
            
            inputFileField.on("change", function(e){
                $("#" + options.fileNameId).val($(this).val());
               
                iFrame.uploadForm.addFileInput(inputFileField);
                                
                iFrame.uploadForm.submit();                
                
            });
            
            // Manages discard file upload
            $("#c_discard_button").on("click", function(e){
                
                // Hides the discard container and shows the upload one
                $("#c_discardUploadContainer").fadeOut(300, function(){
                    $("#" + iFrame.options.fileNameId).val("");                   
                    $("#c_fileUploadControlsContainer").fadeIn(300);
                });
                
                // Hides messages
                $("#" + iFrame.currentSpanVisibleId).fadeOut(300);
                
                // Removes the old uploaded file uid
                $("#" + options.formId).find("#c_file_uid").remove();
                
                inputFileField.val("");
            });
        };
        
        this.publishTemplate = function(){
            
            var inputFieldClone = inputFileField.clone().attr("style", "display:none;");
            
            // Creates template HTML
            var templateString = template.join("");
            
            templateString = templateString.replace("{{TEXT}}", options.inputFileButtonText);            
            templateString = templateString.replace("{{ID}}", options.fileNameId);
            templateString = templateString.replace("{{FILENAMECLASS}}", options.fileNameClass);
            templateString = templateString.replace("{{FILENAMECLASS}}", options.fileNameClass);
            templateString = templateString.replace("{{FILENAMEPLACEHOLDER}}", options.filenamePlaceholder);
                      
            inputFileField.replaceWith(templateString);
            
            $(inputFieldClone)
                .appendTo($("#c_fileInputContainer"));
            $(infoHTML)
                .insertAfter($("#c_fileUploadControlsContainer"));
        };
        
        this.appendIFrame = function(){                                   
                                    
            iFrame.addInputControlToForm(options.formId);
            
            iFrame.appendToForm(options.formId);
            
            iFrame.createHTML(options.iFrameUploadFormId, options.iFrameUploadFormAction);                                                                      
                       
        };
    };
    
    $.fn.ajaxFileUpload = function(options) {
        
        var options = $.extend({
            fileTextFieldId: 'c_filename',
            fileNameClass: 'span4',
            fileNameId: 'c_filename',
            filenamePlaceholder: 'File name',
            inputFileButtonText: 'Browse',
            formId: "myForm",
            iFrameUploadFormAction: "fileUpload.php",          
            iFrameUploadFormId: "uploadFileForm",            
            iFrameId: "fileUploadIFrame"
        }, options);
        
        iFrame.id = options.iFrameId;
        
        iFrame.uploadForm.id = options.iFrameUploadFormId;
        
        iFrame.options = options;
        
        if (this.attr("type") !== "file") {
            throw new Error("This plugin must be attached to an input element of type file");
        }
        
        if ($.isEmptyObject(instances) || instances[this.selector] === undefined) {                        
            
            instances[this.selector] = new AjaxFileUpload(this, options);
            
            instances[this.selector].publishTemplate();
            
            instances[this.selector].attachEventHandlers();
            
            instances[this.selector].appendIFrame();
        }
        
        return this;
    };            
    
}(jQuery));