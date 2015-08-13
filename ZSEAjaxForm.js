(function ($){
    
    /***
     * 
     * @param {type} objectRef
     * @param {type} options
     * @returns {ZSEAjaxForm_L1.ZSEAjaxForm}
     */
    var ZSEAjaxForm = function(objRef, options) {                          
        
        var self = this;
        
        var cachedData;
                
        var getFormFields = function() {
            
            var fields = $(self.form.selector).find("[form-id]"),                
                returnObj = {};
           
           $(fields).each(function(i,v) {
               returnObj[$(v).attr("form-id")] = {value: $(v).val(), reference: $(v)};
           });
           
            
            return returnObj;
        };
        
        this.form = objRef;
         
        this.options = options;
        
        
        // Init
        // Intercettiamo l'evento submit
        $(document).on("submit", this.form.selector, function (e, data){
            
            var method = $(this).attr("method").toLowerCase(),
                saveUrl = $(this).attr("action");
             
            e.preventDefault();            
             
            var jqxhr = $[method](saveUrl, $(this).serialize(), function(data){
                options.saveHandler.call(self.form, data);
                options.onAfterSave.call(self, data);
            });
            
            jqxhr.fail(function(){
                options.onSaveFailed.call(self, data);
                options.onAfterSave.call(self, data);
            });  
            
        });                      
        
        
        
        /***
         * Popola il form con i dati passati attraverso data
         * @param object data
         * @returns {undefined}
         */
        this.populate = function(data){
           
            var formFields = getFormFields();
            
            for (var fieldName in data) {                  
                
                $(formFields[fieldName].reference).val(data[fieldName]);
                
            }
            
            options.onAfterPopulate.call(this, data);
        };
        
        /**
         * Pulisce i campi del form e seleziona il primo valore
         * delle select
         * @returns {undefined}
         */
        this.restore = function(){
        //    $(this.form.selector).find("input[type='hidden']").val("");
            $(this.form.selector).find("input").val("");
            $(this.form.selector).find("select").each(function(i,v) {
               $(this).val($(this).find("option:first").val());
            });
        };
        
        this.load = function(params){
            
            var loadParams = params || {};                     
           
            options.onBeforeLoad.call(self);
            
            // Se richiesto, vengono utilizzati eventuali dati in cache
            // per rendere il form
            if (loadParams && loadParams.useCache === true && cachedData !== undefined) {
                
                options.onLoadSucceeded.call(self, cachedData);
                options.onAfterLoad.call(self);
                
            } else {
                
                // Ajax request per il caricamento del form
                var jqxhr = $.get(options.loadUrl, loadParams, function(data){
                    
                    // cache dei dati
                    cachedData = data;
                    options.onLoadSucceeded.call(self, data);
                    options.onAfterLoad.call(self);
                });

                jqxhr.fail(function(){
                    options.onLoadFailed.call(self);
                    options.onAfterLoad.call(self);
                });     
            }
                                              
        };
        
        this.save = function(){
            var formFields = getFormFields();
            options.onBeforeSave.call(self, formFields);
           
            self.form.trigger("submit", formFields);          
        };
        
    };
            
    var instance = undefined;
               
    $.fn.ZSEAjaxForm = function(options) {
        
        // Initialization code executed only once
        var settings = $.extend({
                onBeforeLoad: function(){},
                onAfterLoad: function(){},
                onBeforeSave: function(){},
                onAfterSave: function(){},
                onLoadSucceeded: function(data) {                    
                    $(this.form).empty().html(data);
                },
                onLoadFailed: function(){
                    throw new Error("Form loading from " + this.loadUrl +  " has failed");
                },
                saveHandler: function(data) {                                               
                   var jsonData = $.parseJSON(data);                   
                   $(this).empty().html(jsonData.data);
                },
                onAfterPopulate: function(){},
                loadUrl: 'info1.php'
            }, options);
                                 
        
        if (instance === undefined) {
            instance = new ZSEAjaxForm(this, settings);
        }                      
        
        return instance;
               
    };
    
}(jQuery));