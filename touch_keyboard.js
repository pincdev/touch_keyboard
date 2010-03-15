// This is a js module to put a touch keyboard on screen.

// The main function is TouchKeyboard.display().  It takes an optional argument that is an object with any of the following 3 things:
// If you pass it a div, it uses that div to display the keyboard; if not then it tries to create its own div.  
// If you pass it a text element it starts with the current value of that text element and sets it when it is done.
// If you pass it a callback function, it calls that function when it is done with one argument, which is the string that was typed in.
// Example: TouchKeyboard.display({"div": $("the_div"), "text": $("the_text_element"), "callback": cb_func});
// You can also call other functions on it to control it.

// It inherits the css size stuff from the parent.
// It has a css file that you can use or replace.

// Currently it is all caps.

TouchKeyboard = {
  display: function(args){
    if (args != undefined){
      if (args.div != undefined){
	// set up a div
	TouchKeyboard.the_div = args.div;
	// TouchKeyboard.set_div(args.div);
      }
      if (args.callback != undefined){
	// set the callback
	TouchKeyboard.set_callback(args.callback);
      }
    }

    if (TouchKeyboard.the_div == undefined){
      // create a new div that hides everything else
      var new_div = new Element("div");
      new_div.className = "touch_keyboard_div";
      new_div.align = "center";
      document.body.insert(new_div);
      TouchKeyboard.the_div = new_div;
    }
    //If the video mode is set tot dark it should also continue in keyboard
    if (TouchKeyboard.is_dark){
        TouchKeyboard.the_div.style.color = "white";
        TouchKeyboard.the_div.style.backgroundColor = "black";
    } else {
        TouchKeyboard.the_div.style.color = "black";
        TouchKeyboard.the_div.style.backgroundColor = "white";
    }

    TouchKeyboard.create_keyboard();

    if (args != undefined && args.text != undefined){
      // set the text element
      TouchKeyboard.set_text(args.text);
    }

    TouchKeyboard.the_div.show();
    $("kb_string").focus();
  },

  set_text: function(in_text){
    TouchKeyboard.the_text_element = in_text;
    $("kb_string").value = TouchKeyboard.the_text_element.value;
  },

  set_callback: function(in_callback){
    TouchKeyboard.the_callback = in_callback;
  },

  hide: function(){
    TouchKeyboard.the_div.hide();
  }, // hide

  clear: function(){
    var pos = TouchKeyboard.getSelectionStart();
    var val = $("kb_string").value;
    $("kb_string").value = val.substring(0, pos -  1) + val.substring(pos, val.length);    
    if (TouchKeyboard.the_text_element != undefined){
      TouchKeyboard.the_text_element.value = $("kb_string").value;
    }
    $("kb_string").focus();
    TouchKeyboard.setCaretTo(pos - 1);
  }, // clear

  fwd: function(){
    $("kb_string").focus();
    TouchKeyboard.setCaretTo(TouchKeyboard.getSelectionStart() + 1);
  },

  back: function(){
    $("kb_string").focus();
    TouchKeyboard.setCaretTo(TouchKeyboard.getSelectionStart() - 1);
  },

  key_press: function(letter){
    var pos = TouchKeyboard.getSelectionStart();
    var val = $("kb_string").value;
    $("kb_string").value = val.substring(0, pos) + letter + val.substring(pos, val.length);    
    if (TouchKeyboard.the_text_element != undefined){
      TouchKeyboard.the_text_element.value = $("kb_string").value;
    }
    $("kb_string").focus();
    TouchKeyboard.setCaretTo(pos + 1);
  }, // key_press

  done: function(){
    if (TouchKeyboard.the_text_element != undefined){
      TouchKeyboard.the_text_element.value = $("kb_string").value;
    }
    TouchKeyboard.hide();
    if (TouchKeyboard.the_callback != undefined){
      TouchKeyboard.the_callback($("kb_string").value);
    }
  },

  letters: "0123456789*QWERTYUIOP*ASDFGHJKL*ZXCVBNM*^ -%<>",
  is_dark: true,
  upper: true,

  kb_case: function(){
    var pos = TouchKeyboard.getSelectionStart();
    if (TouchKeyboard.upper) {
      TouchKeyboard.letters = TouchKeyboard.letters.toLowerCase();
      TouchKeyboard.upper = false;
    } else {
      TouchKeyboard.letters = TouchKeyboard.letters.toUpperCase();
      TouchKeyboard.upper = true;
    }
    TouchKeyboard.create_keyboard();
    TouchKeyboard.setCaretTo(pos);
    
  },

  create_keyboard: function(){
    if (TouchKeyboard.the_text_element != undefined) {
      var cur_text = TouchKeyboard.the_text_element.value;
    }else{
      var cur_text = "";
    }
    TouchKeyboard.the_div.update("");
    TouchKeyboard.the_div.insert({'bottom': new Element("input", {"type": 'text', "id":'kb_string'})});
    TouchKeyboard.the_div.insert({'bottom': "<br />"});
    $("kb_string").value = cur_text;
    var letter_string = '';
    for (var i=0;i<TouchKeyboard.letters.length;i++){
      if (TouchKeyboard.letters.charAt(i) == '*'){
	letter_string += "<br />";
      } else if (TouchKeyboard.letters.charAt(i) == ' '){
	letter_string += "<button class='touch_keyboard_widekey' onclick='TouchKeyboard.key_press(\" \");'>Space</button> ";
      } else if (TouchKeyboard.letters.charAt(i) == '%'){
	letter_string += "<button class='touch_keyboard_widekey' onclick='TouchKeyboard.clear();'>Backspace</button> ";
      } else if (TouchKeyboard.letters.charAt(i) == '<'){
	letter_string += "<button class='touch_keyboard_widekey' onclick='TouchKeyboard.back();'>&lt;</button> ";
      } else if (TouchKeyboard.letters.charAt(i) == '>'){
	letter_string += "<button class='touch_keyboard_widekey' onclick='TouchKeyboard.fwd();'>&gt;</button> ";
      } else if (TouchKeyboard.letters.charAt(i) == '^'){
	letter_string += "<button class='touch_keyboard_widekey' onclick='TouchKeyboard.kb_case();'>" + ((TouchKeyboard.upper) ? "lower" : "UPPER") + "</button> ";
      } else {
	letter = TouchKeyboard.letters.charAt(i);
	// screen_log("Adding letter " + letter);
	letter_string += "<button class='touch_keyboard_kbkey' onclick='TouchKeyboard.key_press(\"" + letter + "\")'>" + letter + "</button> ";
      }
    }
    TouchKeyboard.the_div.insert({'bottom': letter_string});
    TouchKeyboard.the_div.insert({'bottom': "<button class='touch_keyboard_widekey' onclick='TouchKeyboard.done();'>Done</button>"});
  }, // create_keyboard

  getSelectionStart: function() {
    var o = $("kb_string");
    if (o.createTextRange) {
      var r = document.selection.createRange().duplicate();
      r.moveEnd('character', o.value.length);
      if (r.text == '') return o.value.length;
      return o.value.lastIndexOf(r.text);
    } else return o.selectionStart;
  },
  
  getSelectionEnd: function() {
    var o = $("kb_string");
    if (o.createTextRange) {
      var r = document.selection.createRange().duplicate();
      r.moveStart('character', -o.value.length);
      return r.text.length;
    } else return o.selectionEnd;
  },
  
  setCaretTo: function(pos) {
    var obj = $("kb_string");
    if(obj.selectionStart) {
      obj.focus(); 
      obj.setSelectionRange(pos, pos); 
    } else if(obj.createTextRange) {
      var range = obj.createTextRange(); 
      range.move("character", pos); 
      range.select(); 
    }
  } 
};
