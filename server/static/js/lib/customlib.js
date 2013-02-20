var cachedTemplates = {};
function loadTemplate(url) {
  if (cachedTemplates[url]) {
    return cachedTemplates[url];
  }
  var text;
 
  $.ajax({
   url: url,
   success: function(t) {
     //console.log(t);
     text = t;
   },
   async: false
  });
  var tpl = _.template(text);
  cachedTemplates[url] = tpl;
  return tpl;
}

function loadData(url) {
   var data;
   $.ajax({
       url: url,
       success: function(d) {
           //console.log(d);
           data = d;
       },
       async: false
    });
  return data;
}

var componentToHex = function(c) {
   var hex = c.toString(16);
   return hex.length == 1 ? "0" + hex : hex;
}

var rgbToHex = function(r, g, b) {
   return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var hexToRgb = function(hex) {
   var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
   hex = hex.replace(shorthandRegex, function(m, r, g, b) {
       return r + r + g + g + b + b;
   });

   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? {
       r: parseInt(result[1], 16),
       g: parseInt(result[2], 16),
       b: parseInt(result[3], 16)
   } : null;
}

var loxoneToRgb = function(bigdisgustingnumber){
  var logicalrepresentation = [];

  logicalrepresentation.r = (bigdisgustingnumber %100) * 255;
  logicalrepresentation.g = (Math.floor(bigdisgustingnumber/1000) %100) * 255;
  logicalrepresentation.b = (Math.floor(bigdisgustingnumber/1000000) %100) * 255;

  return logicalrepresentation;

}

var rgbToLoxone = function(logicalrepresentation){


  var bigdisgustingnumber = 0;

  bigdisgustingnumber += Math.floor(logicalrepresentation.b/255*100)*1000000

  bigdisgustingnumber += Math.floor(logicalrepresentation.g/255*100)*1000

  bigdisgustingnumber += Math.floor(logicalrepresentation.r/255*100)

  return bigdisgustingnumber;

}



