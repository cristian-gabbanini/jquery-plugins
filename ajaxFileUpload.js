"use strict";
(function($){
    
    var instances = {};
    
    // The following script is used to inform the parent page that
    // the iframe was loaded
    var iFrameHTML = "" + 
       
            '<form id="uploadFileForm" method="post" action="" enctype="multipart/form-data">' +
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
      '<div class="input-prepend">',
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
            
            $(inputFieldClone).appendTo($("#c_fileInputContainer"));         
        };
        
        this.appendIFrame = function(){                                   
            
            $("<input>", {
                id: "iFrameLoaded",
                type: "hidden",
                value: 0
            }).appendTo("#" + options.formId);
            
            $("<iframe>", {
                id: "fileUploadIframe",
                style: "display:none;"                
            }).appendTo($("#" + options.formId));
       
            var iFrameDoc = $("#fileUploadIframe").contents()[0];
                iFrameDoc.open();
                iFrameDoc.write('<!doctype html><html><head></head><body></body></html>');
                iFrameDoc.close();
                
            $('body', $("#fileUploadIframe").contents()).append(iFrameHTML); 
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
            iFrameUploadFormUrl: 'uploadFileForm.php'
        }, options);
        
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