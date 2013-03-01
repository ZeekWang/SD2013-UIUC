// Views, all inherit BaseView
var BaseView = Backbone.View.extend({
  initialize: function() {
    console.log('whendoes this happen')
  },

  assign: function(view, selector) {
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
    console.log('No Animation In');
  },

  animateOut: function(){
    console.log('No Animation Out');
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
    this.panes = data;
    this.render(); // never changes
  },
  route: function(part, remaining) {
    //console.log("HomeView routing to", part, remaining);
    
    this.currentpane = part;
    
    this.views = [];
    if (part == "home" || !part) {

      if (!part) {
        navigate("home", true); // don't trigger nav inside route
      }

      this.views[0] = new StatusView();

      return {
        "#dashboard-wrapper": this.views[0]
      };

    } else {
      this.views[0] = new SubNavView(this.panes[part]);

      return {
        "#sub-nav-wrapper" : this.views[0]
      };
    
    }

  },
  render: function() {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
  },
  animateIn: function(click){
    
    if(!this.currentpane)
      return;

    var slider = $('.' + this.currentpane + '.icon-nav .slider');
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

var StatusView = BaseView.extend({
  el: 'div',
  initialize: function() {
    this.on("assign", this.animateIn);
    this.template = loadTemplate("/static/views/status.html");
  },
  route: function(part, remaining) {
    return {};
  },
  render: function() {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
  },
  animateIn: function(){

    this.$el.animate({
      opacity: 1,
    },{
      duration: 1000, 
      queue: true
    });
  }
});

var SubNavView = BaseView.extend({
  el: 'div',
  events: {
    "click  .sub-nav-button":   "navigateTo"
  },
  initialize: function(data) {
    this.on("assign", this.animateIn);
    this.data = data;
    this.template = loadTemplate("/static/views/subnav.html");
    this.currentpane = this.data.id;
    this.currentsubpane = this.data.children[0];
    this.currentsubpaneindex = 0;
  },
  route: function(part) {
    this.views = [];
    if (!part) {
      navigate(this.currentpane + '/' + this.currentsubpane.id, false);
    }else{

      this.views[0] = retrieveView(this.currentpane, part, this.currentsubpaneindex);
      return {
        "#dashboard-wrapper": this.views[0]
      };
    }
  },
  render: function() {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
  },
  animateIn: function(){
    this.$('.sub-sidebar-wrapper').animate({
      'margin-left': 0,
    },{
      duration: 500, 
      queue: true
    });
  },
  navigateTo:function(click){
    that = click.currentTarget;

    console.log($(that).context.classList[1]);
    this.currentsubpane = $(that).context.classList[1];
    this.currentsubpaneindex = $(that).index();
    //How do I improve this This information is written in HTML
    var next = this.currentpane + '/' + $(that).context.classList[1];

    navigate(next, false); 
  }
});

var PageView = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    this.on("assign", this.animateIn);
    this.currentpane = data[0];
    this.currentsubpane = data[1];
    this.template = loadTemplate("/static/views/pageview.html");
    if(this.specificInitialize)
      this.specificInitialize();
  },
  route: function(part) {
    return{};
  },
  render: function() {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
    if(this.specificRender)
      this.specificRender();
  },
  animateIn: function(){
    this.$el.animate({
      opacity: 1
    },{
      queue: false,
      duration: 1000
    });
  }
});

var LightControlView = PageView.extend({
  el: 'div',
  specificInitialize: function(pane, subpane) {
    this.template = loadTemplate("/static/views/lightcontrol.html");
    this.floorplanpaths = loadData("/static/paths.json");
    console.log(this.collection)
    console.log("Success!")
  },
  selectroom: function(thing){
    console.log(thing)
  },
  specificRender: function(pane, subpane) {
    var that = this;

    h = this.$('#floorplanholder').css('height');
    w = this.$('#floorplanholder').css('width');

    h = parseFloat(h.substring(0, h.length-2));
    w = parseFloat(w.substring(0, w.length-2));

    console.log(h,w)

    var floorplancanvas = new ScaleRaphael( "floorplanholder", 350, 300);

    var rooms = [];
    var lights = [];

    var raphrooms = floorplancanvas.set();
    var raphlights = floorplancanvas.set();

    _.each(this.floorplanpaths.rooms, function(room){
        var thing = rooms[room.id] = floorplancanvas.path(room.path).attr({
          "id": room.id, 
          "fill": "#3E3E3E", 
          "stroke": "#000000", 
          "stroke-width": 0, 
          "opacity": .75, 
          'stroke-opacity':'0'
        }); //creates the raphael objects then stores them to an array rooms
        lights[room.id] = thing;
        rooms[room.id].id = room.id;    //setting the ids of the raphael objects
        raphrooms.push(thing)           //pushing the rooms to a raphael group object for easier manipulation
    })


    _.each(this.floorplanpaths.lights, function(light){
        //console.log(that.collection)
        //lightmodel = that.collection.get(light.id);
        //var color = rgbToHex(lightmodel.get('color'));
        
        if(false){
          console.log('color ', light.id)

            var thing = lights[light.id] = floorplancanvas.path(light.path).attr({
              "id": light.id, 
              "fill": color, 
              "stroke": "#000000", 
              "stroke-width": .5, 
              "fill-opacity": 0, 
              'stroke-opacity': 0
            }); //creates the raphael objects then stores them to an array rooms
        }else{
          console.log('not color ', light.id)

            var thing = lights[light.id] = floorplancanvas.path(light.path).attr({
              "id": light.id, 
              "fill": "#3E3E3E", 
              "stroke": "#000000", 
              "stroke-width": .5, 
              "fill-opacity": 1, 
              'stroke-opacity': 0
            }); //creates the raphael objects then stores them to an array rooms
        }

        lights[light.id].id = light.id;    //setting the ids of the raphael objects

        raphlights.push(thing)  //pushing the rooms to a raphael group object for easier manipulation           
        thing.toFront();
    })

    var outerWalls = floorplancanvas.path(this.floorplanpaths.outerwalls).attr({
      fill:'#000',
      'fill-opacity':'1', 
      'stroke':'#d9d9d9',
      'stroke-width':'0',
      'stroke-opacity':'0.4'
    });
    
    var innerWalls = floorplancanvas.path(this.floorplanpaths.innerwalls).attr({
      fill:'#000',
      'fill-opacity':'0', 
      'stroke':'#000',
      'stroke-width':'2',
      'stroke-opacity':'1'
    });


    //BINDINGS
    raphrooms.mouseover(function (event) {
        if(this.id != that.selectedlight)
            this.attr({"opacity": 1});
    });
    raphrooms.mouseout(function (event) {
        if(this.id != that.selectedlight){
            this.attr({"opacity": .75});
        }
    });
    raphrooms.click(function (event) {
        that.selectroom(this.id)
    });  
    raphlights.mouseover(function (event) {
        if(this.id != that.selectedlight)
            this.attr({"fill-opacity": 1});
    });
    raphlights.mouseout(function (event) {
        if(this.id != that.selectedlight){
            this.attr({"fill-opacity": 1});
        }
    });
    raphlights.click(function (event) {
        that.selectroom(this.id)
    });

    //Tying objects to this scope
    this.floorplancanvas = floorplancanvas;
    this.rooms = rooms;
    this.raphrooms = raphrooms;
    this.lights = lights;
    this.raphlights = raphlights;


    //Scales raphael drawing by multiplyer specified, size        
    floorplancanvas.changeSize(w, h)
  }
});





















