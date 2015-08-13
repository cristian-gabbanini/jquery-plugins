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
                obj.children(":first").addClass(settings.onClass);               
            } else if (parseInt(value) === settings.onValue) {
                obj.children(":last").addClass(settings.onClass);                  
            } else {                 
                throw "Input field value provide does not match settings offValue or onValue";
            }
            
            return obj;
        };
        
        this.remove = function() {
            $(this.element).remove();
        };
        
        this.getId = function(){
            return settings.id;
        };
    };
                                      
    var instance = undefined;
               
    $.fn.ZSESwitch = function(options) {                                       
        
        // Initialization code executed only once
        if (instance === undefined) {
            
            settings = $.extend({
               id: "zse-switch"              
            }, $.fn.ZSESwitch.defaults, options);
            
            instance = new ZSESwitch();
            
            // Rendiamo hidden il campo di input
            this.attr("type", "hidden");
            
            $(instance.createHtml(this.val())).insertAfter(this);                        
            
            instance.element = this.next();
            
            // We attach our plugin to the following hidden input field
            var inputField = this;
            
            $(document).on("click", "#" + settings.id, function(e){                
                if (!$(e.target).hasClass(settings.onClass)) {                    
                    $(e.target).addClass(settings.onClass);
                    
                    if ($(e.target).attr("off") !== undefined) {
                         $(e.target).next("button").removeClass(settings.onClass);
                         
                         // change input field value
                         inputField.val(settings.offValue);
                    } else {
                        $(e.target).prev("button").removeClass(settings.onClass);
                        
                        // change input field value
                        inputField.val(settings.onValue);
                    }
                        
                     
                }
            });
            
        } else {
            settings = $.extend($.fn.ZSESwitch.defaults, options);
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
            onClass: "btn-primary"
        };
    }());
    
}(jQuery));