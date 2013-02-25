// Views, all inherit BaseView
var BaseView = Backbone.View.extend({
  initialize: function() {

  },

  assign: function(view, selector) {
    view.setElement(this.$(selector));
    console.log(view)
    console.log(this.$(selector))
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
    "click .nav-button":  "animateOut"
  },
  initialize: function() {
    this.template = loadTemplate("/static/views/nav.html");
    var data = loadData("/static/panes.json");
    this.panes = data;
    this.render(); // never changes
  },
  route: function(part, remaining) {
    //console.log("HomeView routing to", part, remaining);
    this.currentpane = part;
    console.log('home')
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
    this.animateIn();
  },
  animateIn: function(click){

    var slider = $('.' + this.currentpane + '.icon-nav .slider');
    slider.animate({
      width: '100%'
    },{
      duration: 500, 
      queue: true
    });

  },
  animateOut: function(click){
    
    that = click.currentTarget;
    var next = $(that).context.classList[2];

    if(this.currentpane == next)
      return;

    var slider = $('.' + this.currentpane + '.icon-nav .slider');
    slider.animate({
      width: '0%'
    },{
      duration: 500, 
      queue: true
    });

    _.each(this.views, function(view){
      view.animateOut(next)
    })    
  }
});

var StatusView = BaseView.extend({
  el: 'div',
  initialize: function() {
    this.template = loadTemplate("/static/views/status.html");
  },
  route: function(part, remaining) {
    // no subviews, but zoom in to the selected room (if any)
    return {};
  },
  render: function() {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
    this.animateIn();
  },
  animateIn: function(){
    this.$el.animate({
      opacity: 1,
    },{
      duration: 1000, 
      queue: true
    });
  },
  animateOut:function(next){
    this.$el.animate({
      opacity: 0
    },{
      queue: true,
      duration: 500,
      done: function() {
        navigate(next, false);
      }
    });
  }
});

var SubNavView = BaseView.extend({
  el: 'div',
  events: {
    "click  #sub-nav-wrapper":   "animateOut",
    "click  .sub-sidebar-wrapper":   "animateOut",
    "click  .sub-sidebar":   "animateOut",
    "click  .sub-nav":   "animateOut",
    "click  .text-wrapper":   "animateOut",
    "click  .sub-nav-button":   "animateOut",
  },
  initialize: function(data) {
    this.data = data;
    this.template = loadTemplate("/static/views/subnav.html");
    this.currentpane = this.data.id;
    this.currentpanel = this.data.children[0];
  },
  route: function(part) {
    this.views = [];
    console.log('subnav')
    if (!part) {
      navigate(this.currentpane + '/' + this.currentpanel.id, false);
    }else{
      console.log('initializing the pageview');
      this.views[0] = new PageView( this.data );
      console.log(this.views[0])
      return {
        "#dashboard-wrapper": this.views[0]
      };
    }
  },
  render: function() {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
    this.animateIn();
  },
  animateIn: function(){
    this.$('.sub-sidebar-wrapper').animate({
      'margin-left': 0,
    },{
      duration: 500, 
      queue: true
    });
  },
  animateOut:function(next){
    console.log(next)

    _.each(this.views, function(view){
      view.animateOut(next)
    })

    console.log(next) 

    this.$('.sub-sidebar-wrapper').animate({
      'margin-left': '-250px',
    },{
      queue: true,
      duration: 500,
      done: function() {
        navigate(next, false);
      }
    });
  }
});

var PageView = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    this.data = data;
    this.template = loadTemplate("/static/views/pageview.html");
    console.log(this.template())
  },
  route: function(part) {
    return{};
  },
  render: function() {
    console.log('shit should be getting rendered')
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
    this.animateIn();
  },
  animateIn: function(){
    this.$el.animate({
      opacity: 1
    },{
      queue: false,
      duration: 500
    });
  },
  animateOut:function(next){
    this.$el.animate({
      opacity: 0
    },{
      queue: false,
      duration: 500
    });
  }
});