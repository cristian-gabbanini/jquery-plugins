(function ($){
    
    var settings;
    
    var ZSESwitch = function() {                          
        
        this.inputElement = undefined;
        
        this.element = undefined;
                              
        this.createHtml = function(value){
           
            var template = settings.template.replace("{OFFLABEL}", settings.offLabel).replace("{ONLABEL}", settings.onLabel);
           
            var obj = $(template);
            obj.attr("id", settings.id);
            
            if (parseInt(value) === settings.offValue){
                obj.children(":first").addClass("btn-primary");               
            } else if (parseInt(value) === settings.onValue) {
                obj.children(":last").addClass("btn-primary");                  
            } else {                 
                throw "Input field value provide does not match settings offValue or onValue";
            }
            
            return obj;
        };               
        
    };
                                      
    var instance = undefined;
               
    $.fn.ZSESwitch = function(options) {                                       
        
        // Initialization code executed only once
        if (instance === undefined) {
            
            settings = $.extend({
               id: "zse-switch"              
            }, $.fn.ZSEFlashMessage.defaults, options);
            
            instance = new ZSESwitch();
            
            // Rendiamo hidden il campo di input
            this.attr("type", "hidden");
            
            $(instance.createHtml(this.val())).insertAfter(this);                        
            
            instance.element = this.next();
            
            // We attach our plugin to the following hidden input field
            var inputField = this;
            
            $(document).on("click", "#" + settings.id, function(e){                
                if (!$(e.target).hasClass("btn-primary")) {                    
                    $(e.target).addClass("btn-primary");
                    
                    if ($(e.target).attr("off") !== undefined) {
                         $(e.target).next("button").removeClass("btn-primary");
                         
                         // change input field value
                         inputField.val(settings.offValue);
                    } else {
                        $(e.target).prev("button").removeClass("btn-primary");
                        
                        // change input field value
                        inputField.val(settings.onValue);
                    }
                        
                     
                }
            });
            
        } else {
            settings = $.extend($.fn.ZSEFlashMessage.defaults, options);
        } 
                       
        return instance;                
        
    };
    
    // Impostiamo alcuni valori di default
    // disponibili "pubblicamente"
    $.fn.ZSEFlashMessage.defaults = (function() {
        return {
            template: '<div class="btn-group"><button type="button" class="btn" off>{OFFLABEL}</button><button type="button" class="btn" on>{ONLABEL}</button></div>',
            offLabel: 'Off',
            onLabel: 'On',
            offValue: 0,
            onValue: 1
        };
    }());
    
}(jQuery));