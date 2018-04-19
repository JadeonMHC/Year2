var gl;
var canvas;

var planet_shader;
var planet_position;

var line_shader;
var line_position;

var circleVBO;
var circle_verts = 35;

var lineVBO;

var current_universe;
var view_scale = 100.0;
var view_position = [0, 0];

var last_time = (new Date()).getTime();

var selected_planet = null;
var selected_cycle = 0.0;

function OpenFile(file){
   try {
      return $.ajax({url: file, async: false}).responseText;
   }
   catch (e){
      return null;
   }
}

function resize() {
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {

    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

function RightClick(x, y){
   current_universe.AddPlanet(x + view_position[0], y + view_position[1], 0, 0, Math.random() * 30.0 + 1.0);
}

function GL_Main () {
   canvas = document.getElementById("MainWindow");
   gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

   current_universe = new Universe();

   resize(canvas);
   init();

   setup_events();

   setInterval(function () {
      Update();
      Draw();
   }, 1000/60);
}

function setup_events() {
   window.onresize = function() {
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
   };

   canvas.onmousedown = function(e) {
      var pos = FixMouse(e);

      if (e.which == 1){
         selected_planet = current_universe.SelectPlanet(pos[0] + view_position[0], pos[1] + view_position[1]);
         selected_cycle = 0.0;

         if (selected_planet != null){
            $("#partFixed").prop("checked", current_universe.fixed[selected_planet]);
            $("#partMass").val(Math.floor(current_universe.mass[selected_planet]));
         }
         else {
            $("#partFixed").prop("checked", false);
            $("#partMass").val("0");
         }
      }
      else if (e.which == 2)
         MiddleClick(pos[0], pos[1]);
      else if (e.which == 3)
         RightClick(pos[0], pos[1]);
   };

   canvas.addEventListener('contextmenu', function(ev) {
      ev.preventDefault();
      return false;
   }, false);

   canvas.onmouseup = function(e) {
      var pos = FixMouse(e);

      if (e.which == 2)
         MiddleUp(pos[0], pos[1]);
   };

   $("#MainWindow").mouseleave(function(){
      middle_down = false;
   });

   var rollFunc = function(e){
      var rolled = 0;
      if ('wheelDelta' in e) {
          rolled = e.wheelDelta;
      }
      else {
          rolled = -40 * e.detail;
      }

      RollMouse(rolled);
   };

   canvas.addEventListener("DOMMouseScroll", rollFunc, false);
   canvas.onmousewheel = rollFunc;

   canvas.onmousemove = function(e) {
      var pos = FixMouse(e);

      MouseMove(pos[0], pos[1]);
   }
}

function init () {
   gl.viewport(0, 0, canvas.width, canvas.height);

   planet_shader = new Shader("planet");
   planet_position = planet_shader.Att("vertexPosition");

   line_shader = new Shader("line");
   line_position = line_shader.Att("vertexPosition");

   genCircleMesh();
   genLineMesh();
}

function genLineMesh(){
   lineVBO = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, lineVBO);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0]), gl.STATIC_DRAW);
}

function genCircleMesh(){
   var verts = [];

   for (var i = 0; i < circle_verts; i++){
      var rot = (3.14159 * 2) / circle_verts;
      rot *= i;

      verts.push(Math.cos(rot), Math.sin(rot), 0);
   }

   circleVBO = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, circleVBO);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
}

function Update() {
   var current_time = (new Date()).getTime();
   var delta = current_time - last_time;
   delta /= 1000.0;
   last_time = current_time;

   current_universe.Update(delta);
   selected_cycle += delta;
}

function Draw () {
   gl.clearColor(0.66, 0.84, 0.96, 1);
   gl.clear(gl.COLOR_BUFFER_BIT);

   current_universe.Draw();
}
