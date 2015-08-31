var EventDirector = (function() {
	
	var instance = undefined;
	
	var PrivateEventDirector = function(){
		
		var events = {};
	
		var manageEvent = function(selector, delegateSelector, eventName, handler, attach){
                    if (attach) {
			$(selector).on(eventName, handler);
                    } else {
                        $(selector).off(eventName, handler);
                    }
		};                              

		this.EventObject = function(){
			
                    var selector, delegateSelector, handlers;
		
                        this.getSelector = function(){
                            return selector;                            
                        };
                        
                        this.getDelegate = function(){
                            return delegateSelector;
                        };
                        
                        this.getHandlers = function(){
                            return handlers;
                        };
                        
			this.delegate = function(selectorString){
				delegateSelector = selectorString;
				return this;
			};
			
			this.selector = function(selectorString){
				selector = selectorString;
				return this;
			};
		
			this.handlers = function(handlersObject){                           
                            handlers = {};
                                
				for (var evt in handlersObject){                                   
					if (typeof evt === "string"){                                            
						handlers[evt] = handlersObject[evt];
					} else if (typeof evt === "array"){
						for (var i=0; i < handlersObject[evt].lenght; i++){
							handlers[evt].push(handlersObject[evt][i]); 
						}
					}
				}
				return this;
			};		
		};
	
		var eventsManager = function(eventObject, attach){
                    var eventObjectHandlers = eventObject.getHandlers(),
                        eventMethod = attach === true ? "attachEvent" : "detachEvent";
                    
			for (var handler in eventObjectHandlers){
		
				if (typeof handler === "array"){
					for (var i=0; i < eventObjectHandlers[handler].lenght; i++){
						manageEvent(selector, handler, eventObjectHandlers[handler][i], attach);
					}
				} else if (typeof handler === "string"){
					manageEvent(eventObject.getSelector(),
                                            eventObject.getDelegate(),
                                            handler, 
                                            eventObjectHandlers[handler],
                                            attach);
				} else {
					throw new Error("Events arguments format not supported");
				}
			}
		};
                
                this.attachEvents = function(eventObject){
                    eventsManager(eventObject, true);
                };
		this.detachEvents = function(eventObject){
                    eventsManager(eventObject, false);
		};
        
		this.triggerEvents = function(selector, eventsArray){
                    for(var i=0; i < eventsArray.lenght; i++){
                            $(selector).trigger(eventsArray[i]);
                    }
                };
	};
	
	if (typeof instance === "undefined"){
		instance = new PrivateEventDirector;
	}
	
	return instance;
})();

Object.seal(EventDirector);