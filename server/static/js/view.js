// Views, all inherit BaseView
var BaseView = Backbone.View.extend({
  initialize: function() {
  },

  assign: function(view, selector) {
    //console.log(view,selector)
    view.setElement(this.$(selector));
  },

  route: function(part, remaining) {
    return {};
  },

  dispose: function() {
    this.remove();
    this.off();
    if (this.model) {
      this.model.off(null, null, this);
    }
  },

  animateIn: function(){
    //console.log('No Animation In');
  },

  animateOut: function(){
    //console.log('No Animation Out');
  }
});

var HomeView = BaseView.extend({
  el: "#viewport",
  events: {
    "click .nav-button":  "navigateTo"
  },
  initialize: function() {
    //IMPORTANT LINE OF CODE 
    this.on("assign", this.animateIn);
    this.template = loadTemplate("/static/views/nav.html");
    var data = loadData("/static/panes.json");
    this.panes = JSON.parse(data);
    this.render(); // never changes
  },
  route: function(part, remaining) {
    
    if (!part) {
      navigate("home", true); // don't trigger nav inside route
    }

    var viewMap = {
      'home' : StatusView,
      'lights': LightingView,
      'power': PowerView
    }

    if(this.panes[part]){
      this.currentpane = this.panes[part];
    } else {
      //404 routes home
      this.currentpane = {
        "id": 'home'
      };      
    }

    if (viewMap[this.currentpane.id]){
      viewToBeReturned = new viewMap[this.currentpane.id](this.currentpane);
    } else {
      viewToBeReturned = new PageView(this.currentpane)
    }

  
    return {
      "#dashboard-wrapper": viewToBeReturned
    };    
    

  },
  render: function() {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
  },
  animateIn: function(click){
    
    if(!this.currentpane)
      return;

    var slider = $('.' + this.currentpane.id + '.icon-nav .slider');
    slider.animate({
      width: '100%'
    },{
      duration: 500, 
      queue: true
    });

  },
  navigateTo: function(click){
    
    that = click.currentTarget;

    //How do I improve this This information is written in HTML
    var next = $(that).context.classList[2];

    if(this.currentpane == next)
      return;

    navigate(next, false); 
  }
});



var PageView = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    //console.log(data);
    //console.log(this);
    this.on("assign", this.animateIn);
    this.currentpane = data;
    this.template = loadTemplate("/static/views/pageview.html");
  },
  animateIn: function(){
    this.$el.animate({
      opacity: 1
    },{
      queue: false,
      duration: 1000
    });
  },
  route: function(part) {
    //console.log(part)
    return{};
  },
  render: function() {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
  }
});


var StatusView = PageView.extend({
  el: 'div',
  initialize: function(data) {
    //console.log(data)
    this.on("assign", this.animateIn);
    this.statustemplate = loadTemplate("/static/views/status.html");
  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  route: function(part) {
    //console.log(part)
    return{};
  },
  render: function() {
    var renderedTemplate = this.statustemplate();
    this.$el.html(renderedTemplate);
  }
});

var LightingView = PageView.extend({
  el: 'div',
  initialize: function(data) {
    PageView.prototype.initialize.apply(this, [data]);
    this.lighttemplate = loadTemplate("/static/views/lightspage.html");
    data = loadData("/static/paths.json");
    this.floorplanpaths = JSON.parse(data);
    this.collection = window.Lights;
    //this.collection = window.bullshit;
    //console.log('hey look here')
  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  selectzone: function(zone){
    //console.log('hello')
    navigate('lights/' + zone, false);
  },
  route: function(part) {
    //console.log(part)
    if (!part) {
      navigate("lights/home" , true); // don't trigger nav inside route
    }

    data = {}
    data['id'] = part;
    data.lights = this.collection.getLightsByZone(part);

    //console.log(data);

    if(!part || part == 'home'){
      //console.log('wut')
      return{};
    }else{
      lightcontrolview = new LightControlView(data);
      return{
        "#overlaywrapper" : lightcontrolview
      };
    }
  },
  render: function() {
    PageView.prototype.render.apply(this);
    var renderedTemplate = this.lighttemplate();
    
    this.$('#pagecontent').html(renderedTemplate);

    var that = this;

    this.$('#floorplanholder').height('90%');
    this.$('#floorplanholder').width('100%');

    h = this.$('#floorplanholder').height();
    w = this.$('#floorplanholder').width();

    var floorplancanvas = new ScaleRaphael( "floorplanholder", 350, 300);

    var zones = [];

    var raphzones = floorplancanvas.set();

    _.each(this.floorplanpaths.zones, function(zone){
        var thing = zones[zone.id] = floorplancanvas.path(zone.path).attr({
          "id": zone.id, 
          "fill": "#3E3E3E", 
          "stroke": "#000000", 
          "stroke-width": 0, 
          "opacity": .75, 
          'stroke-opacity':'0'
        }); //creates the raphael objects then stores them to an array zones
        zones[zone.id].id = zone.id;    //setting the ids of the raphael objects
        raphzones.push(thing)           //pushing the zones to a raphael group object for easier manipulation
    })


    var outerWalls = floorplancanvas.path(this.floorplanpaths.outerwalls).attr({
      'fill':'#000',
      'fill-opacity':'0', 
      'stroke':'#000',
      'stroke-width':'3',
      'stroke-opacity':'1'
    });
    
    var innerWalls = floorplancanvas.path(this.floorplanpaths.innerwalls).attr({
      'fill':'#000',
      'fill-opacity':'0', 
      'stroke':'#000',
      'stroke-width':'2',
      'stroke-opacity':'1'
    });


    //BINDINGS
    raphzones.mouseover(function (event) {
        if(this.id != that.selectedlight)
            this.attr({"opacity": 1});
    });
    raphzones.mouseout(function (event) {
        if(this.id != that.selectedlight){
            this.attr({"opacity": .75});
        }
    });
    raphzones.click(function (event) {
        that.selectzone(this.id)
    });  

    this.floorplancanvas = floorplancanvas;
    this.zones = zones;
    this.raphzones = raphzones;
    
      
    floorplancanvas.changeSize(w, h)
  }
});

var LightControlView = BaseView.extend({
  el: 'div',
  initialize: function(zone) {
    //console.log(zone)
    this.data = zone
    this.on("assign", this.animateIn);
    this.template = loadTemplate("/static/views/lightcontrol.html");
  },
  animateIn: function(){
    this.$('.modal').height('0');

    this.$('.modal').animate({
      height: '67%'
    },{
      queue: true,
      duration: 1000
    });
  },
  route: function(part) {
    var that = this;

    //pointers for this view
    this.lights = {};

    //views to be returned
    lightstoberendered = {};

    var sum = 0;
    var count = 0;

    _.each(this.data.lights, function(light) {

      lightview = new LightView(light);
      lightstoberendered['#'+light.id] = lightview;
      that.lights[light.id] = {};
      that.lights[light.id].id = light.id;
      that.lights[light.id].view = lightview;
      that.lights[light.id].type = light.get('type') 
      that.lights[light.id].model = light;
      that.lights[light.id].attached = true;

      switch(that.lights[light.id].type){
        case 'rgb':
          value = light.getcolor().l*100;
          break;
        case 'digital':
          value = light.get('value')*100;
          break;
        default:
          value = light.get('value');
      }

      value = parseInt(value);
      sum += value;

      count++;
    });

    this.data['value'] = sum/count;


    return lightstoberendered;    
  },
  render: function() {
    
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
    this.renderZoneDimmer();
    var elems = this.$('.lightlist').children('li').remove();
    elems.sort(function(a,b){
        return parseInt(a.type) > parseInt(b.type);
    });
    this.$('.lightlist').append(elems);

  },
  renderZoneDimmer: function() {
    var that = this;

    this.$("#zonedimmer").slider({
        orientation: "vertical",
        range: "min",
        min: 0,
        max: 100,
        value: this.data['value'],
        start: function(event, ui) {
          that.dragging = true;
        },
        stop: function(event, ui) {
          that.dragging = false;
        },
        slide: function(event, ui) {
          //console.log(ui.value);
        }
      });

      this.$("#zoneon").click(function() {
        //console.log('on')
        /*
        var lastvalue = that.model.get('last');

        that.model.save({
          last: null
        });
        if (lastvalue != null) that.model.save({
          current: lastvalue
        });
        */
      });

      this.$("#toggleoff").click(function() {
        //console.log('off')
        /*
        var currentvalue = that.model.get('current');
        that.model.save({
          current: 0
        });
        */
      });
  }
});

var  LightView = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    this.model = data;

    this.id = this.model.id;

    this.lighttemplate = loadTemplate("/static/views/light.html");
  },
  animateIn: function(){

  },
  route: function(part) {
    this.listenTo(this.model, 'change', this.render);
    return{};
  },
  render: function(pane, subpane) {
    switch(this.model.get('type')){
    case 'rgb':
      this.value = this.model.getcolor().l*100;
      this.color = true;
      this.colorhex = '#' + this.model.get('value');
      this.colorhue = this.model.getcolor().h;
      break;
    case 'digital':
      this.value = this.model.get('value')*100;
      this.color = false;
      break;
    default:
      this.value = parseInt(this.model.get('value'));
      this.color = false;
    }

    var renderedTemplate = this.lighttemplate();
    this.$el.html(renderedTemplate);
    this.renderLightDimmer();

  },
  renderLightDimmer: function() {
    var that = this;

    this.$('.sliderholder').slider({
      range: "min",
      min: 0,
      max: 100,
      value: that.value,
      start: function(event, ui) {
        that.dragging = true;
      },
      stop: function(event, ui) {
        that.dragging = false;
      },
      slide: function(event, ui) {
        
        that.model.updateValue(ui.value)
      }

    });

    if(this.color){
      this.$('.hslslider').slider({
        range: "min",
        min: 0,
        max: 360,
        value: this.colorhue,
        start: function(event, ui) {
          that.dragging = true;
        },
        stop: function(event, ui) {
          that.dragging = false;
        },
        slide: function(event, ui) {
          
          that.colorhex = that.model.updateColor(ui.value);
        }
      });
    }
  }
});

var  PowerView = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    PageView.prototype.initialize.apply(this, [data]);
    this.powertemplate = loadTemplate("/static/views/power.html");
  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  route: function(part) {
    return{};
  },
  render: function(pane, subpane) {
    PageView.prototype.render.apply(this);
    var renderedTemplate = this.powertemplate();
    this.$('#pagecontent').html(renderedTemplate);

  }
});