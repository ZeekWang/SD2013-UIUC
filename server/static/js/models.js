// Models
var BaseModel = ModelWS.extend({
  defaults: function() {
    return {
      id: null,
      zone: "home",
      value: 0 
    }
  },
})

var LightModel = BaseModel.extend({
  defaults: function() {
    return {
      id: null,
      zone: "home",
      type: 'analog',
      value: 0 // between 0 and 100
    }
  },
  getcolor: function(){
  	var hex = this.get('value');
  	
  	var rgb = hexToRgb(hex);
    var hsl = rgbToHsl(rgb)
  	return hsl;

  },
  updateValue: function(value){
	type = this.get('type');

  	switch(type){
    case 'rgb':
    	color = this.getcolor()
    	color.l = value/100;
    	rgb = hslToRgb(color);

    	hex = rgbToHex(rgb);
    	
    	this.save({
			value: hex
		});
		
      break;
    case 'digital':
      if(value < 50){
      	this.save({
    			value: 0
    		});
      }else{
      	this.save({
    			value: 100
    		});
      }
      break;
    default:
  		this.save({
  			value: value
  		});
    }
  },
  updateColor: function(value){
  	color = this.getcolor()
  	
  	color.h = value;
  	color.s = 1;
  	color.l = 0.5;

  	rgb = hslToRgb(color);
  	hex = rgbToHex(rgb);
  		
  	this.save({
  		value: hex
  	});
	
    return hex;
  }
});

var HVACModel = ModelWS.extend({
  defaults: function() {
    return {
      id: null,
      zone: null, //id = room
      tar_temp: null,
      humidity: null,
    }
  }
});

var TemperatureModel = ModelWS.extend({
  defaults: function(){
    return{
      name: null,
      id: null,
      value: null,
      units: 'C',
      timestamp: null
    }
  }
});

var PVModel = ModelWS.extend({
  defaults: function() {
    return {
      id: null,
      value: null,
      unit: 'kW'
    }
  }
});

var DevicesModel = ModelWS.extend({ //2 or 3 devices for each room. 
  defaults: function() {
    return {
      id: null,
      zone: null,
      value: null,
      unit: 'W'
    }
  }
});

var WaterModel = ModelWS.extend({
  defaults: function() {
    return {
      id: null,
      room: null,
      value: null,
      unit: 'L'
    }
  }
});

var SensorModel = ModelWS.extend({
  defaults: function(){
    return{
      id:null,
    }
  }
});

var WindoorModel = ModelWS.extend({
  defaults: function(){
    return{
      id:null,
      zone: null,
      value: null,
    }
  }
});

var AlertModel = ModelWS.extend({
  defaults: function(){
    return{
      id:null,
    }
  }
});
