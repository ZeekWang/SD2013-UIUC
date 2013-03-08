// Models

var LightModel = ModelWS.extend({
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
    	
    	console.log(hex)
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
    	console.log(value)

		this.save({
			value: value
		});
    }
  },
  updateColor: function(value){


	color = this.getcolor()
	
	console.log(color.h, color.s, color.l)

	color.h = value;
	color.s = 1;
	color.l = 0.5;

	console.log(color.h, color.s, color.l)

	rgb = hslToRgb(color);
	hex = rgbToHex(rgb);
		
	console.log(hex)
	
	this.save({
		value: hex
	});
	
	return hex;
  }
});
