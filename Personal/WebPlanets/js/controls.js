var backup_universe;

var isPlaying = false;
var isPaused = false;

function intval(e) {
   e.value=e.value.replace(/[^\d]/,'')
}

function floatval(e) {
   var v = e.value;

   var tr = "";
   var dec = false;

   for (var i = 0; i < v.length; i++){
      var c = v.charAt(i);

      if (c == '0' || c == '1' || c == '2' || c == '3' || c == '4' || c == '5' || c == '6' || c == '7' || c == '8' || c == '9'){
         tr += c;
      }
      else if (c == '.' && dec == false){
         tr += c;
         dec = true;
      }
      else
      console.log(c);
   }

   e.value = tr;
}

function Control_Main(){
   $("#btnPlay").click(function(){
      if (!isPlaying){
         if (!isPaused){
            backup_universe = current_universe.Clone();
         }

         current_universe.Simulate = true;

         isPlaying = true;
         isPaused = false;
         $("#btnPlay").html("Pause");
      }
      else {
         current_universe.Simulate = false;

         isPlaying = false;
         isPaused = true;

         $("#btnPlay").html("Play");
      }
   });

   $("#btnRevert").click(function(){
      current_universe = backup_universe;

      isPlaying = false;
      isPaused = false;

      current_universe.Simulate = false;

      $("#btnPlay").html("Play");
   });

   $("#btnSet").click(function(){
      if (selected_planet != null){
         current_universe.mass[selected_planet] = $("#partMass").val();
         current_universe.fixed[selected_planet] = $("#partFixed").is(":checked");
      }
   });
}
