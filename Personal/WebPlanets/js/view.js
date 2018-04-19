var middle_down = false;
var last_mouse = [0, 0];


function MiddleClick(x, y){
   middle_down = true;
   last_mouse = [x, y];
}

function MiddleUp(x, y){
   middle_down = false;
   last_mouse = [x, y];
}

function MouseMove(x, y){
   if (middle_down){
      var diff = [x - last_mouse[0], y - last_mouse[1]];

      view_position[0] -= diff[0];
      view_position[1] -= diff[1];
   }

   last_mouse = [x, y];
}

function RollMouse(x){
   var xx = Math.abs(x / 120.0);

   xx *= 0.25;
   xx += 1;

   var mult = 1.0;

   if (x > 0.0)
      mult /= xx;
   else mult *= xx;

   var global_mouse = [last_mouse[0] + view_position[0],
                       last_mouse[1] + view_position[1]];

   if (selected_planet != null){
      var mt = last_mouse;
      global_mouse = current_universe.position[selected_planet];
      last_mouse[0] = global_mouse[0];
      last_mouse[1] = global_mouse[1];
      last_mouse[0] -= view_position[0];
      last_mouse[1] -= view_position[1];
   }


   view_position = [-last_mouse[0] * mult + global_mouse[0],
                    -last_mouse[1] * mult + global_mouse[1]];

   last_mouse[0] *= mult;
   last_mouse[1] *= mult;

   view_scale *= mult;
}

function FixMouse(e) {
   var aspect = canvas.width / canvas.height;

   var rx = e.clientX;
   var ry = canvas.height - e.clientY;

   var x = ((rx / canvas.width) * view_scale * aspect) - (view_scale * aspect * 0.5);
   var y = ((ry / canvas.height) * view_scale) - (view_scale * 0.5);

   return [x, y];
}

function ScreenSpace(a) {
   var aspect = canvas.width / canvas.height;

   var x = ((rx / canvas.width) * view_scale * aspect) - (view_scale * aspect * 0.5);
   var y = ((ry / canvas.height) * view_scale) - (view_scale * 0.5);

   return [x, y];
}

function ViewProjectionMatrix(){
   var aspect = canvas.width / canvas.height;

   return mat4.ortho([],
      -aspect * view_scale * 0.5 + view_position[0],
      aspect * view_scale * 0.5 + view_position[0],
      -view_scale * 0.5 + view_position[1],
      view_scale * 0.5 + view_position[1],
      -10,
      10);
}
