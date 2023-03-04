/*
 * Responsee JS - v7 - 2020-09-30
 * https://www.myresponsee.com
 * Copyright 2020, Vision Design - graphic zoo
 * Free to use under the MIT license.
*/
jQuery(document).ready(function($) {
  //Responsee tabs
  $('.tabs').each(function(intex, element) {
    current_tabs = $(this);       
    $('.tab-label').each(function(i) {
      var tab_url = $(this).attr('data-url');                   
      if ($(this).attr('data-url')) {        
        $(this).closest('.tab-item').attr("id", tab_url);
        $(this).attr("href", "#" + tab_url);          
      }else{                  
        $(this).closest('.tab-item').attr("id", "tab-" + (i + 1));
        $(this).attr("href", "#tab-" + (i + 1));         
      }
    });  
    $(this).prepend('<div class="tab-nav line"></div>');
    var tab_buttons = $(element).find('.tab-label');
    $(this).children('.tab-nav').prepend(tab_buttons);      
    function loadTab() {   
        $(this).parent().children().removeClass("active-btn");
        $(this).addClass("active-btn");
        var tab = $(this).attr("href");
        $(this).parent().parent().find(".tab-item").not(tab).css("display", "none");
        $(this).parent().parent().find(tab).fadeIn();
        $('html,body').animate({scrollTop: $(tab).offset().top - 200},'slow'); 
      if ($(this).attr('data-url')) { 
      }else{
        return false;
      }  
    } 
    $(this).find(".tab-nav a").click( loadTab );
    $(this).find('.tab-label').each(function() {
      if ($(this).attr('data-url')) {  
        var tab_url = window.location.hash;      
        if( $(this).parent().find('a[href="' + tab_url + '"]').length ) {
            loadTab.call($(this).parent().find('a[href="' + tab_url + '"]')[0]);
        }
      }
    }); 
    var url = window.location.hash;
    if( $(url).length ) {
      $('html,body').animate({scrollTop: $(url).offset().top - 160},'slow');
    }
  });
  //Slide nav
  $('<div class="slide-nav-button"><div class="nav-icon"><div></div></div></div>').insertBefore(".slide-nav");
  $(".slide-nav-button").click(function() {
    $("body").toggleClass("active-slide-nav");
  });
  //Responsee eside nav
  $('.aside-nav > ul > li ul').each(function(index, element) {
    var count = $(element).find('li').length;
    var content = '<span class="count-number"> ' + count + '</span>';
    $(element).closest('li').children('a').append(content);
  });
  $('.aside-nav > ul > li:has(ul)').addClass('aside-submenu');
  $('.aside-nav > ul ul > li:has(ul)').addClass('aside-sub-submenu'); 
    $('.aside-nav > ul > li.aside-submenu > a').attr('aria-haspopup', 'true').click(function() {
    //Close other open sub menus
    $('.aside-nav ul li.aside-submenu:not(:hover) > ul').removeClass('show-aside-ul', 'fast');
    $('.aside-nav ul li.aside-submenu:hover > ul').toggleClass('show-aside-ul', 'fast'); 
  }); 
  $('.aside-nav > ul ul > li.aside-sub-submenu > a').attr('aria-haspopup', 'true').click(function() { 
    //Close other open sub menus
    $('.aside-nav ul ul li:not(:hover) > ul').removeClass('show-aside-ul', 'fast');
    $('.aside-nav ul ul li:hover > ul').toggleClass('show-aside-ul', 'fast');
  });
  //Mobile aside navigation
  $('.aside-nav-text').each(function(index, element) {
    $(element).click(function() { 
      $('.aside-nav > ul').toggleClass('show-menu', 'fast');
    });
  });  
  //Responsee nav
  // Add nav-text before top-nav
  $('.top-nav').before('<p class="nav-text"><span></span></p>');   
  $('.top-nav > ul > li ul').each(function(index, element) {
    var count = $(element).find('li').length;
    var content = '<span class="count-number"> ' + count + '</span>';
    $(element).closest('li').children('a').append(content);
  });
  $('.top-nav > ul li:has(ul)').addClass('submenu');
  $('.top-nav > ul ul li:has(ul)').addClass('sub-submenu').removeClass('submenu');
  $('.top-nav > ul li.submenu > a').attr('aria-haspopup', 'true').click(function() { 
    //Close other open sub menus
    $('.top-nav > ul li.submenu > ul').removeClass('show-ul', 'fast'); 
    $('.top-nav > ul li.submenu:hover > ul').toggleClass('show-ul', 'fast');
  }); 
  $('.top-nav > ul ul > li.sub-submenu > a').attr('aria-haspopup', 'true').click(function() {  
    //Close other open sub menus
    $('.top-nav ul ul li > ul').removeClass('show-ul', 'fast');  
    $('.top-nav ul ul li:hover > ul').toggleClass('show-ul', 'fast');   
  });
  //Mobile navigation
  $('.nav-text').click(function() { 
    $("body").toggleClass('show-menu');
  });  
  //Custom forms
  $(function() {
    var input = document.createElement("input");
    if (('placeholder' in input) == false) {
      $('[placeholder]').focus(function() {
        var i = $(this);
        if (i.val() == i.attr('placeholder')) {
          i.val('').removeClass('placeholder');
          if (i.hasClass('password')) {
            i.removeClass('password');
            this.type = 'password';
          }
        }
      }).blur(function() {
        var i = $(this);
        if (i.val() == '' || i.val() == i.attr('placeholder')) {
          if (this.type == 'password') {
            i.addClass('password');
            this.type = 'text';
          }
          i.addClass('placeholder').val(i.attr('placeholder'));
        }
      }).blur().parents('form').submit(function() {
        $(this).find('[placeholder]').each(function() {
          var i = $(this);
          if (i.val() == i.attr('placeholder')) i.val('');
        })
      });
    }
  });
  //Tooltip
  $(".tooltip-container").each(function () {
    $(this).hover(function(){  
      var pos = $(this).position();  
      var container = $(this);
      var pos = container.offset();
      tip = $(this).find('.tooltip-content');
      tip_top = $(this).find('.tooltip-content.tooltip-top');
      tip_bottom = $(this).find('.tooltip-content.tooltip-bottom');
      
      var height = tip.height();
      tip.fadeIn("fast"); //Show tooltip
      tip_top.css({
        top: pos.top - height,
        left: pos.left + (container.width() /2) - (tip.outerWidth(true)/2)
      })
      tip_bottom.css({
        top: pos.top,
        left: pos.left + (container.width() /2) - (tip.outerWidth(true)/2)
      })
      }, function() {
          tip.fadeOut("fast"); //Hide tooltip
    });
  });
  // Accordion
  var accordion = $('.accordion');
  $('.active-accordion-section > .accordion-content').slideDown();
  $('.active-accordion-section').parents(".accordion-content").slideDown();  
  accordion.on('click', '.accordion-title', function (e) {
    if (e.stopPropagation) {
  		e.stopPropagation();
  	} else {
  		e.returnValue = false;
  	} 	    
    var section = $(e.currentTarget);
    section.siblings('.accordion-content').stop(true, false).slideToggle('fast');
    $('.accordion-section:not(:hover)').removeClass('active-accordion-section');
    section.parent('.accordion-section').toggleClass('active-accordion-section'); 
    section.closest('.accordion-section').siblings().find('.accordion-content').slideUp().end();
  });  
  // Modal
  $('.modal-button').each(function() {
    $(this).click(function() {
      var modal_id = $(this).attr('data-modal');
      $( "body" ).append( '<div class="modal-wrap"><div class="modal-content"></div><div class="modal-close"></div></div>' );
      var modal_content = $( "#"+modal_id ).html();
      $( ".modal-content" ).append( '<div class="modal-append modal"><a class="modal-close-icon"><i class="icon-cross_mark"></i></a>'+modal_content+'</div>' );
      $( ".modal-wrap" ).fadeIn( 'fast' );
      $( ".modal-append" ).fadeIn( 'fast' );
      $( "body" ).addClass( 'modal-active' );
      $( ".modal-append" ).addClass( 'active-modal' );
    });
  });
  $("body").on('click', '.modal-close,.modal-close-button,.modal-close-icon', function() {
    $( ".modal-append" ).removeClass( 'active-modal' );
    $( ".modal-wrap" ).fadeOut( 'fast', function() {
      $( ".modal-wrap" ).remove();      
      $( "body" ).removeClass( 'modal-active' );
    });  
  });
  //Active item
  var url = window.location.href;
  $('a').filter(function() {
    return this.href == url;
  }).parent('li').addClass('active-item');
  var url = window.location.href;
  $('.aside-nav a').filter(function() {
    return this.href == url;
  }).parent('li').parent('ul').addClass('active-aside-item');
  var url = window.location.href;
  $('.aside-nav a').filter(function() {
    return this.href == url;
  }).parent('li').parent('ul').parent('li').parent('ul').addClass('active-aside-item');
  var url = window.location.href;
  $('.aside-nav a').filter(function() {
    return this.href == url;
  }).parent('li').parent('ul').parent('li').parent('ul').parent('li').parent('ul').addClass('active-aside-item');
});