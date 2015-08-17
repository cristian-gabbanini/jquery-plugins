(function ($){        
    
    /***
     * 
     * @param {type} objectRef
     * @param {type} options
     * @returns {ZSEAjaxForm_L1.ZSEAjaxForm}
     */
    var ZSEAjaxForm = function(objRef, options) {                          
        
        function submitHandler (e, data){
            e.preventDefault();
            if (!$(self.form.selector).find("button[type='submit']").hasClass("disabled")){
                var method = $(this).attr("method").toLowerCase(),
                    saveUrl = $(this).attr("action");

                      

                var jqxhr = $[method](saveUrl, $(this).serialize(), function(data){
                    options.saveHandler.call(self.form, data);
                    options.onAfterSave.call(self, data);
                });

                jqxhr.fail(function(){
                    options.onSaveFailed.call(self, data);
                    options.onAfterSave.call(self, data);
                });  
            }
        };
        
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
        $(document).on("submit", this.form.selector, submitHandler);                        
                
        
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
            
    var instance = {};
               
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
                renewInstance: false,
                onAfterPopulate: function(){},
                loadUrl: 'info1.php'
            }, options);
                                 
        
        if (options.renewInstence || $.isEmptyObject(instance) || instance[this.selector] === undefined) {            
            // Detach event handler
            $(document).off("submit", this.selector, "**");
            
            // instantiate object
            instance[this.selector] = new ZSEAjaxForm(this, settings);
        }                      
        
        return instance[this.selector];
               
    };
    
}(jQuery));

(function ($){
       
    var instance = {};
    
    var cachedData = {};
    
    var editPanel = function(objSelector, options){                
        
        var objSelector = objSelector;
        
        var self = this;
        
        var loadUrl = function(url, params) {
            
            if (options.useCache === true && !$.isEmptyObject(cachedData)) {
                $(objSelector).html(cachedData[url]);
                 
                options.onAfterLoad.call(self, cachedData[url]);
            } else {
                
                $.get(url, params, function(data) {
                    $(objSelector).html(data);
                    if (options.useCache === true) {
                        cachedData[url] = data;
                    }
                   
                    options.onAfterLoad.call(self, data);                   
                });  
            }
            
        };
        
        this.url = function(url, params) {           
            loadUrl(url, params);         
        };
       
        this.reload = function(url, params) {             
            loadUrl(url, params);                
        };
        
        this.debug = function(){
            console.log(instance);
        };
        
        this.show = function(){
            
            options.onBeforeShow.call(self, $(objSelector));
            
            $(objSelector)[options.animIn](options.animInDuration, function(){
                options.onAfterShow.call(self, $(objSelector));
            });
        };
        
        this.cloack = function(){
            options.onBeforeHide.call(self, $(objSelector));           
            $(objSelector)[options.animExit](options.animExitDuration, function(){
                options.onAfterHide.call(self, $(objSelector));
            });
        };
        
        this.setUpCss = function(){
            // Style setup
            var css = {
                padding: "10px",
                backgroundColor: options.backgroundColor
            };
            
            var borderSettings = options.borders.split("|");
             
            if (borderSettings.indexOf("top") !== -1) {
                css["border-top"] = "1px solid " + options.borderColor;
            } else {
                css["border-top"] = "0px";
            }
            if (borderSettings.indexOf("bottom") !== -1) {
                css["border-bottom"] = "1px solid " + options.borderColor;
            }else {
                css["border-bottom"] = "0px";
            }
            if (borderSettings.indexOf("left") !== -1) {
                css["border-left"] = "1px solid " + options.borderColor;
            }else {
                css["border-left"] = "0px";
            }
            if (borderSettings.indexOf("right") !== -1) {
                css["border-right"] = "1px solid " + options.borderColor;
            }else {
                css["border-right"] = "0px";
            }

            $(objSelector).css(css);  
        };
    };
    
    
    $.fn.ZSEEditPanel = function(options) {
        
        // Initialization code executed only once
        var settings = $.extend({
                onBeforeShow: function(){},
                onAfterShow: function(){},
                onBeforeHide: function(){},
                onAfterHide: function(){},
                onAfterLoad: function(){},
                url: undefined
            }, $.fn.ZSEEditPanel.default, options);
                                                
        if ($.isEmptyObject(instance) || instance[this.attr("id")] === undefined) {            
            instance[this.attr("id")] = new editPanel(this.selector, settings);
            instance[this.attr("id")].setUpCss();
            this.hide();
        }
        
        if (settings.url !== undefined) {
            instance[this.attr("id")].url(settings.url);
        }
                
        return instance[this.attr("id")];
             
    };
    
     $.fn.ZSEEditPanel.default = {
            borders: "top|right|left|bottom",
            borderColor: "#DEDEDE",
            backgroundColor: "#FCFCFC",
            animInDuration: 400,
            animExitDuration: 400,
            animExit: 'slideUp',
            animIn: 'slideDown'
    };
}(jQuery));

(function ($){
    
    var settings;
    
    /***
     * Mostra un flash message
     * @param {type} objectRef
     * @param {type} options
     * @returns {ZSEAjaxForm_L1.ZSEAjaxForm}
     */
    var ZSEFlashMessage = function() {                          
        
        this.element = undefined;
        
        var updateElement = function(element){
            var obj = $(element);
        
                obj.attr("id", settings.id);               
                obj.attr("class", settings.containerCssClass);                
                obj.find("h4")
                        .attr("class", settings.messageCssClass)
                        .html("&nbsp;&nbsp;" + settings.message)
                        .prepend($("<i>", {
                            class: settings.icon
                        }));
        };
        
        
        
        this.createHtml = function(){
            var obj = $(settings.template);
            obj.attr("id", settings.id);
            obj.hide();
            obj.attr("style", obj.attr("style") + "margin-top:45px;");
            obj.addClass(settings.containerCssClass);            
            obj.find("h4")
                    .addClass(settings.messageCssClass)
                    .text(settings.message)
                    .prepend($("<i>", {
                        class: settings.icon
                   }));
 
            return obj;
        };
        
        this.show = function(){
            var self = this;
            updateElement(this.element);
            
            $(this.element)[settings.animIn.type](settings.animIn.duration, function(){
                
                // Se è impostato l'auto hide lo effettuiamo 
                if (settings.autoHideIn !== undefined && typeof(settings.autoHideIn) === "number") {
                    
                    setTimeout(function(){
                        self.hide();
                    }, settings.autoHideIn);
                    
                }
                
            });
        };
        
        this.hide = function(){            
            $(this.element)[settings.animOut.type](settings.animOut.duration);
        };
        
    };
                                      
    var instance = undefined;
               
    $.fn.ZSEFlashMessage = function(options) {                                       
        
        // Initialization code executed only once
        if (instance === undefined) {
            
            settings = $.extend({
               id: "zse-flash-message"              
            }, $.fn.ZSEFlashMessage.defaults, options);
            
            instance = new ZSEFlashMessage();
            
            $(instance.createHtml()).insertAfter(this);
        
            instance.element = this.next();
            
        }
               
        return instance;                
        
    };
    
    // Impostiamo alcuni valori di default
    // disponibili "pubblicamente"
    $.fn.ZSEFlashMessage.defaults = (function() {
        return {
            template: '<div><h4></h4></div>',
            animIn: {type: 'fadeIn', duration: 300},
            animOut: {type: 'fadeOut', duration: 300},
            containerCssClass: "alert-message",
            messageCssClass: "text-info",
            message: "Hello! This is a default message",
            icon: "fa fa-hourglass-o",
            autoHideIn: 4000             
        };
    }());
    
}(jQuery));


(function ($){
     
    var handler = undefined;
    var settings;
    var instance = undefined;
    
    var ZSESwitch = function() {                          
        
        this.inputElement = undefined;
        
        this.element = undefined;
                              
        this.createHtml = function(value){           
            var template = settings.template.replace("{OFFLABEL}", settings.offLabel).replace("{ONLABEL}", settings.onLabel);
           
            var obj = $(template);
            obj.attr("id", settings.id);
            
            if (parseInt(value) === settings.offValue){
                obj.children(":first").addClass(settings.offClass);               
            } else if (parseInt(value) === settings.onValue) {
                obj.children(":last").addClass(settings.onClass);                  
            } else {                 
                throw "Input field value provide does not match settings offValue or onValue";
            }
            
            return obj;
        };
        
        this.exists = function(){
            //if (this.element === undefined) return false;
            var exists =  $("#" + settings.id).attr("id") === undefined ? false : true;
            
            return exists;
        };
        
        this.remove = function() { 
            
            $("#" + settings.id).remove();
            
            // unregisters the event handler
            //$(document).off("click", "#" + settings.id, false);
           
            // The next time a new instance will be created
            //instance = undefined;            
        };
        
        this.getId = function(){
            return settings.id;
        };
        
        this.draw = function(){
            instance.inputElement = $(settings.elementSelector);
           
            instance.element = instance.createHtml($(instance.inputElement).val());
            $(instance.element).insertAfter($(instance.inputElement));
            
            $(document).on("click", "#" + settings.id, function(e){
             
            // Click on OFF
            if ($(e.target).attr("off") !== undefined) {

                if (!$(e.target).hasClass(settings.offClass)) {
                    $(e.target).addClass(settings.offClass);
                }

                $(e.target).next().removeClass(settings.onClass);

                $(settings.elementSelector).val(settings.offValue);
            // Click on ON
            } else {

                if (!$(e.target).hasClass(settings.onClass)) {
                    $(e.target).addClass(settings.onClass);
                }

                $(e.target).prev().removeClass(settings.offClass);
                $(settings.elementSelector).val(settings.onValue);
            }               
        }); 
        };
    };
                                      
    
               
    $.fn.ZSESwitch = function(options) {                                       
        options = options === undefined ? {} : options
        settings = $.extend($.fn.ZSESwitch.defaults, options);
        settings.elementSelector = this;
        
        if (instance !== undefined && settings.draw === true) {
                if (!instance.exists()) {
                     
                    instance.draw();    
                }
                
        } else if (instance === undefined) {
           
            instance = new ZSESwitch();
             
            if (settings.draw === true) {
                
                
                instance.draw();
                 
            }
           
            
            /*
             *  var target = document.querySelector(this.selector);
            var config = { attributes: false, childList: true, characterData: false };
            mutation = new MutationObserver(function(mutations, observerInstance){                
                if (mutations[0].type === "childList") {
                     
                    var inputElement = $(mutations[0].addedNodes[0][1]);
                    
                    instance["inputElement"] = inputElement;
                    
                    $(instance.createHtml($(instance.inputElement).val())).insertAfter($(instance.inputElement));
                    
                    mutation.disconnect();
                    
                    
                    
                }                                
            });
            
            mutation.observe(target, config);
               */          
        }  
        
        
        return instance;
        
    };
    
    // Impostiamo alcuni valori di default
    // disponibili "pubblicamente"
    $.fn.ZSESwitch.defaults = (function() {
        return {
            template: '<div class="btn-group"><button type="button" class="btn" off>{OFFLABEL}</button><button type="button" class="btn" on>{ONLABEL}</button></div>',
            offLabel: 'Off',
            onLabel: 'On',
            offValue: 0,
            onValue: 1,
            onClass: "btn-success",
            offClass: "btn-danger",
            id: "zse_switch",
            draw: false,
            elementSelector: "input#ZSELoginOptionsValues_option_value"           
        };
    }());
    
}(jQuery));