function Universe(){
   // Member declarations //
   this.position = [];
   this.velocity = [];
   this.mass = [];
   this.fixed = [];

   this.Simulate = false;


   // Planet functions //
   this.AddPlanet = function (x, y, vx, vy, mass){
      this.position.push([x, y, 0]);
      this.velocity.push([vx, vy]);
      this.mass.push(Math.floor(mass));
      this.fixed.push(false);
   };

   this.SelectPlanet = function (x, y) {
      for (var i = 0; i < this.position.length; i++){
         var diff = [this.position[i][0] - x, this.position[i][1] - y]; //Relative position
         var dist = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]); //Radial distance
         var rad = Math.sqrt(current_universe.mass[i] / 3.14159); //Radius of planet based on mass

         // Return first planet found
         if (dist <= rad)
            return i;
      }

      // No planet found
      return null;
   };

   // Update functions //
   this.Update = function (delta){
      if (this.Simulate){
         var steps = 2;
         var ds = delta / steps;
         for (; steps > 0; steps--){
            this.Step(ds);
         }
      }
   };

   this.Step = function (delta) {
      var Restitiution = parseFloat($("#physRest").val());
      var GravitationalConstant = parseFloat($("#physGrav").val());

      for (var a = 0; a < this.position.length; a++){
         for (var b = a + 1; b < this.position.length; b++){
            //Calculate the relative position vector
            var diff = [];
            vec3.subtract(diff, this.position[b], this.position[a]);

            //Calculate distance
            var dis = vec3.length(diff);

            if (dis < 0.002)
               dis = 0.002;


            //Calculate force
            var grav = GravitationalConstant * 60.0 * this.mass[a] * this.mass[b];
            var force = grav / (dis * dis);

            //Update velocities
            if (!this.fixed[a]){
               this.velocity[a][0] += force * diff[0] * delta / this.mass[a];
               this.velocity[a][1] += force * diff[1] * delta / this.mass[a];
            }

            if (!this.fixed[b]){
               this.velocity[b][0] += force * -diff[0] * delta / this.mass[b];
               this.velocity[b][1] += force * -diff[1] * delta / this.mass[b];
            }


            var rada = Math.sqrt(this.mass[a] / 3.14159);
            var radb = Math.sqrt(this.mass[b] / 3.14159);

            if (dis < rada + radb) {
               var norm = [diff[0] / dis, diff[1] / dis];

               var mtd = MultPoint(norm, (rada + radb - dis) / dis);// norm;

               var im1 = 1.0 / this.mass[a]; //First Mass
               var im2 = 1.0 / this.mass[b]; //Second Mass

               // impact speed
               var v = SubPoint(this.velocity[a], this.velocity[b]); //velocity[a] //(this.velocity.subtract(ball.velocity));
               var vn = DotPoint(v, NormalizePoint(mtd));// v.dot(mtd.normalize());

               if (vn > 0.0){

                   // collision impulse
                   var i = (-(1.0 + Restitiution) * vn);// / (im1 + im2);
                   var impulse = MultPoint(mtd, i);// mtd.multiply(i);

                   // change in momentum
                   this.velocity[a] =  AddPoint(this.velocity[a], MultPoint(impulse, im1));
                   this.velocity[b] =  SubPoint(this.velocity[b], MultPoint(impulse, im2));

               }
/*
               var repelforce = ((rada + radb) / dis) * this.mass[a] * this.mass[b] * 1.1;
               this.velocity[a][0] -= norm[0] * (repelforce * im1) * delta;
               this.velocity[a][1] -= norm[1] * (repelforce * im1) * delta;

               this.velocity[b][0] += norm[0] * (repelforce * im2) * delta;
               this.velocity[b][1] += norm[1] * (repelforce * im2) * delta;*/
            }
         }
      }

      //Update positions
      for (var i = 0; i < this.position.length; i++){
         this.position[i][0] += this.velocity[i][0] * delta;
         this.position[i][1] += this.velocity[i][1] * delta;
      }
   };

   // Drawing functions //
   this.Draw = function (){
      this.DrawPlanets();

      if ($("#showVel").is(':checked'))
         this.DrawLines();
   };

   this.DrawPlanets = function (){
      //Setup common values
      gl.useProgram(planet_shader.program);

      gl.uniformMatrix4fv(planet_shader.Uni("projection"), false, ViewProjectionMatrix());
      gl.uniform4fv(planet_shader.Uni("color"), [1, 1, 1, 1]);

      gl.bindBuffer(gl.ARRAY_BUFFER, circleVBO);
      gl.enableVertexAttribArray(planet_position);
      gl.vertexAttribPointer(planet_position, 3, gl.FLOAT, false, 0, 0);

      for (var i = 0; i < current_universe.position.length; i++) {
         //Calculate radius
         var s = Math.sqrt(current_universe.mass[i] / 3.14159);
         var scalemat = mat4.fromScaling([], [s, s, s]);

         //Set individual values
         gl.uniformMatrix4fv(planet_shader.Uni("transform"), false, mat4.fromTranslation([], current_universe.position[i]));
         gl.uniformMatrix4fv(planet_shader.Uni("scale"), false, scalemat);

         //Draw Particle
         gl.drawArrays(gl.TRIANGLE_FAN, 0, circle_verts);

         if (selected_planet == i) {
            var sc = s + (1.2 * ((-Math.cos(selected_cycle * 3.0 + Math.PI * 0.25) * 0.5) + 0.5)) + 0.5;
            sc *= Math.max(view_scale / 100.0, 1.0);
            scalemat = mat4.fromScaling([], [sc, sc, 1.0]);

            gl.uniformMatrix4fv(planet_shader.Uni("scale"), false, scalemat);
            gl.drawArrays(gl.LINE_LOOP, 0, circle_verts);
         }
      }
   };

   this.DrawLines = function() {
      gl.useProgram(line_shader.program);
      for (var i = 0; i < current_universe.position.length; i++){

         var s = Math.sqrt(current_universe.velocity[i][0] * current_universe.velocity[i][0] + current_universe.velocity[i][1] * current_universe.velocity[i][1]) / 2.0;
         var scalemat = mat4.fromScaling([], [s, s, s]);
         var modelmat = mat4.create();

         var rot = Math.atan2(current_universe.velocity[i][1], current_universe.velocity[i][0]);
         if (isNaN(rot))
            rot = 0.0;

         mat4.rotateZ(modelmat, scalemat, rot);

         gl.uniformMatrix4fv(line_shader.Uni("projection"), false, ViewProjectionMatrix());
         gl.uniformMatrix4fv(line_shader.Uni("transform"), false, mat4.fromTranslation([], current_universe.position[i]));
         gl.uniformMatrix4fv(line_shader.Uni("scale"), false, modelmat);

         gl.bindBuffer(gl.ARRAY_BUFFER, lineVBO);
         gl.enableVertexAttribArray(planet_position);
         gl.vertexAttribPointer(planet_position, 2, gl.FLOAT, false, 0, 0);

         gl.drawArrays(gl.LINES, 0, 2);
      }
   };

   // Universe functions //
   this.Clone = function(){
      var tr = new Universe();

      for (var i = 0; i < this.position.length; i++){
         tr.AddPlanet(
            this.position[i][0],
            this.position[i][1],
            this.velocity[i][0],
            this.velocity[i][1],
            this.mass[i]);
      }

      return tr;
   };
}

function RotatePoint(point, angle){
    var s = Math.sin(angle);
    var c = Math.cos(angle);

    return [
        c * point[0] - s * point[1],
        s * point[0] + c * point[1]];
}

function AddPoint(a, b){
    return [a[0] + b[0], a[1] + b[1]];
}

function SubPoint(a, b){
    return [a[0] - b[0], a[1] - b[1]];
}

function MultPoint(a, b){
    return [a[0] * b, a[1] * b];
}

function NormalizePoint(p){
    var l = Math.max(Math.sqrt((p[0] * p[0]) + (p[1] * p[1])), 0.01);
    return [p[0] / l, p[1] / l];
}

function DotPoint(a, b){
    return (a[0] * b[0]) + (a[1] * b[1]);
}
