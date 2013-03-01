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