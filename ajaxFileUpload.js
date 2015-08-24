"use strict";
(function($){
    
    var iFrame = {
        
        id: "",
        
        uploadForm : {                       
            
            id: "",
                                 
            addFileInput: function(fileInput) {                
                $("#" + iFrame.id).contents().find("#" + this.id).append(fileInput.clone());
            },
            
            submit: function(){               
                $("#" + iFrame.id).contents().find("#" + this.id).submit();
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
        
        addChangeListener: function(eventType, callback) {
            console.log(eventType);
            console.log(this.id);
            $("#" + this.id)[eventType](this.eventHandler);
            if (typeof callback === "function") {
                callback.call($("#" + id));
            }
        },
        
        addReadyListener: function(inputFieldId){
            $("#" + inputFieldId).on("change", function(e) {                
                if (parseInt($(e.target).val()) === 1) {
                    console.log("iFrame was loaded");
                    var jsonData = $.parseJSON($("#" + iFrame.id).contents().find("json").text());
                    
                    if (jsonData.error === null){
                        $("#uploadInfoText")
                            .html("<strong>File type</strong>:&nbsp;" 
                                + jsonData.mimeType 
                                + "&nbsp;-&nbsp;<strong>Size</strong>:&nbsp;"
                                + jsonData.size)
                            .parent("p")
                            .fadeIn(300);
                    }
                }
            });
        }
    };
    
    var instances = {};
    
    var infoHTML = "" +
            '<p id="uploadAnim" class="text-warning" style="display:none;"><i class="fa fa-cog faa-spin animated"></i>&nbsp;&nbsp;Uploading file...</p>' +
            '<p id="uploadError" class="text-error" style="display:none;"><i class="fa fa-exclamation-triangle faa-flash animated"></i>&nbsp;&nbsp;<span id="uploadErrorText">Unexpected error...</span></p>'+
            '<p id="uploadInfo" class="text-muted" style="display:none;"><i class="fa fa-file-code-o"></i>&nbsp;&nbsp;<span id="uploadInfoText">Generic file informations...</span></p>';
    
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
        };
        
        this.publishTemplate = function(){
            
            var inputFieldClone = inputFileField.clone().attr("style", "display:none;");
            
            // Creates template HTML
            var templateString = template.join("");
            
            templateString = templateString.replace("{{TEXT}}", options.inputFileButtonText);            
            templateString = templateString.replace("{{ID}}", options.fileNameId);
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
            
            iFrame.addChangeListener("load");                      
                       
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