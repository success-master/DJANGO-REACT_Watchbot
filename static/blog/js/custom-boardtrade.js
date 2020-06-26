$(document).ready(function() {
    $( ".dizzy-container" ).delay( 1200 ).fadeOut();
    
    var isFullscreen = false;
    var isAlertshown = false;
    
    $( '.nav-bar' ).hide();
    
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
           
           $( '#handle' ).fadeOut( "fast" );
           
          $(".beight").animate(prop,speed); 
          /* setTimeout(function() { 
            $(".beight").css("position","relative");
          }, 920); */
          
          $( '#handle' ).html( "<img src='images/board_open.png' />" );
          $( '#handle' ).fadeIn( "slow" );
        }
        else{         
          prop.width = "66.667%";
          
          $( '#handle' ).fadeOut( "fast" );
          
          /* prop.height = "250px"; */         
          isFullscreen = false;
          $(".beight").animate(prop,speed2); 
          setTimeout(function() { 
            $(".beight").css("position","relative"); 
          }, 920);
          $( "#toggle" ).toggle( "slide");
          
          setTimeout(function() {
    $( '#handle' ).html( "<img src='images/board_close.png' />" );
    $( '#handle' ).fadeIn( "slow" );
}, 300);
          
          
          
          
          
        }
        
    });
    
    
    $('.m1').click(function() {
        
    
        $( '.ico2' ).hide();
        $( '.ico3' ).hide();
        $( '.ico4' ).hide();
        $( '.ico5' ).hide();
       
        $( '.ico1' ).fadeIn("slow");
    });
    
    $('.m2').click(function() {
    
        
    
        $( '.ico1' ).hide();
        $( '.ico3' ).hide();
        $( '.ico4' ).hide();
        $( '.ico5' ).hide();
        
        $( '.ico2' ).fadeIn("slow");
       
    });
    
    $('.m4').click(function() {
        
    
        $( '.ico1' ).hide();
        $( '.ico2' ).hide();
        $( '.ico3' ).hide();
        $( '.ico5' ).hide();
        
        $( '.ico4' ).fadeIn("slow");
       
    });
    
    $('.m5').click(function() {
        
    
        $( '.ico1' ).hide();
        $( '.ico2' ).hide();
        $( '.ico3' ).hide();
        $( '.ico4' ).hide();
        
        $( '.ico5' ).fadeIn("slow");
       
    });
    
    $('#alertshow').click(function() {
        
        if(!isAlertshown){
            isAlertshown = true;
            $( '.alert_box' ).fadeIn("fast");
            
        } else {
            isAlertshown = false;
            $( '.alert_box' ).fadeOut("fast");
        }
        
    });
    
    $('#pclo').click(function() {
        
            isAlertshown = false;
            $( '.alert_box' ).fadeOut("fast");
       
    });
    
    $('#pdec').click(function() {
        
            isAlertshown = false;
            $( '.alert_box' ).fadeOut("fast");
       
    });
});