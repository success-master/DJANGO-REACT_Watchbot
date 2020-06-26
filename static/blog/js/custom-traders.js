$(document).ready(function() {
    $( ".dizzy-container" ).delay( 1200 ).fadeOut();
    
    $( '.nav-bar' ).hide();
    
    $("input[type='checkbox']").change(function(){
    if($(this).is(":checked")){
        $(this).parent().parent().parent().addClass("orangeBackground"); 
    }else{
        $(this).parent().parent().parent().removeClass("orangeBackground");  
    }
    });
    
    var isFullscreen = false;
    
    $( '#handle' ).click(function() {
        
        
        var prop = {};
        var speed = 680;
        var speed2 = 340;
        if(!isFullscreen){ // MAXIMIZATION
           $( "#toggle" ).toggle( "slide"); 
           
           /* var box = $('#toggle');
        var targetWidth = box.width() > 0 ? 0 : 150;
        box.animate({width: targetWidth + "px"}, 1000); */
           
           prop.width = "95%";
           
           /* prop.height = "100vh"; */
           isFullscreen = true;
          $(".beight").animate(prop,speed); 
          /* setTimeout(function() { 
            $(".beight").css("position","relative");
          }, 920); */
        }
        else{         
          prop.width = "66.667%";
          /* prop.height = "250px"; */         
          isFullscreen = false;
          $(".beight").animate(prop,speed2); 
          setTimeout(function() { 
            $(".beight").css("position","relative"); 
          }, 920);
          $( "#toggle" ).toggle( "slide");
        }
        
    });
    
    var startDate = moment().set({ 'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0 });
var endDate = moment().set({ 'hour': 23, 'minute': 59, 'second': 59, 'millisecond': 0 });

var startObj = moment(startDate, "DD/MM/YYYY HH:mm:ss");
var endObj = moment(endDate, "DD/MM/YYYY HH:mm:ss");

$("#slider").roundSlider({
  radius: 100,
  startAngle: 90,
  sliderType: "min-range",
  readOnly: true,
  width: 12,
  editableTooltip: false,

  min: +startObj,
  max: +endObj,
  step: 1000,
  value: +moment(),

  tooltipFormat: function (e) {
    var dateObj = moment.utc(endObj.diff(moment(e.value)));
    var days = +dateObj.format("D") - 1;
    var time = dateObj.format("HH:mm:ss");

    if (days > 0) {
      return "<span>" + days + " days</span>" + time;
    }
    else {
      return time;
    }
  }
});

setInterval(function () {
  slider.option("value", +moment()); 
}, 1000);
 
});