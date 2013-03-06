// Collection definitions

var LightCollection = CollectionWS.extend({
  model: LightModel,
  url: '/light',
  getLightsByZone: function(zone) {
  	lightsToBeReturned = {};
  	_.each(this.models, function(model){
  		if(model.get('zone') == zone){
  			lightsToBeReturned[model.id] = model;
  		}
  	});

  	return lightsToBeReturned;
  }
});
