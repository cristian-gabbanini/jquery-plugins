(function ($){
       
    var instance = undefined;
    
    var cachedData = undefined;
    
    var editPanel = function(objRef, options){                
        var objRef = objRef;
        
        var loadUrl = function(url) {
            $.get(url, {}, function(data) {
                objRef.html(data);
                cachedData = data;
                options.onAfterLoad.call(this, data);
            });
        };
        
        this.url = function(url) {           
            loadUrl(url);         
        };
       
        this.reload = function() {
            if (options.useCache === true) {
                objRef.html(cachedData);
                options.onAfterLoad.call(this, cachedData);
            } else {
                loadUrl(options.url);
            }
        };
        
        this.show = function(){
            
            options.onBeforeShow.call(undefined, objRef);
            
            objRef[options.animIn](options.animInDuration, function(){
                options.onAfterShow.call(undefined, objRef);
            });
        };
        
        this.cloack = function(){
            options.onBeforeHide.call(undefined, objRef);
            
            objRef[options.animExit](options.animExitDuration, function(){
                options.onAfterHide.call(undefined, objRef);
            });
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
            
                
        this.hide();                
        
        if (instance === undefined) {
            instance = new editPanel(this, settings);
        }
        
        if (settings.url !== undefined) {
            instance.url(settings.url);
        }
        
        // After the first execution this is the function which is 
        // executed
        $.fn.ZSEEditPanel = function(options) {
            
            settings = $.extend(settings, options);
            
            // Style setup
            var css = {
                padding: "10px",
                backgroundColor: settings.backgroundColor
            };
            
            var borderSettings = settings.borders.split("|");
             
            if (borderSettings.indexOf("top") !== -1) {
                css["border-top"] = "1px solid " + settings.borderColor;
            } else {
                css["border-top"] = "0px";
            }
            if (borderSettings.indexOf("bottom") !== -1) {
                css["border-bottom"] = "1px solid " + settings.borderColor;
            }else {
                css["border-bottom"] = "0px";
            }
            if (borderSettings.indexOf("left") !== -1) {
                css["border-left"] = "1px solid " + settings.borderColor;
            }else {
                css["border-left"] = "0px";
            }
            if (borderSettings.indexOf("right") !== -1) {
                css["border-right"] = "1px solid " + settings.borderColor;
            }else {
                css["border-right"] = "0px";
            }

            this.css(css);
            
            

            return instance;
        };
        
        $.fn.ZSEEditPanel.defaults = settings;
        
        return instance;
               
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