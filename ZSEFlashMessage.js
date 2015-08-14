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