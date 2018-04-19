function Shader(name) {
   this.Setup = ShaderSetup;
   this.Att = function (x) { return gl.getAttribLocation(this.program, x); };
   this.Uni = function (x) { return gl.getUniformLocation(this.program, x); };

   this.program = ShaderSetup(name);
}

function ShaderSetup(name) {
   var verttxt = OpenFile("shaders/" + name +".vert");
   var fragtxt = OpenFile("shaders/" + name +".frag");

   var vertexShader = gl.createShader(gl.VERTEX_SHADER);
   gl.shaderSource(vertexShader, verttxt);
   gl.compileShader(vertexShader);

   var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
   gl.shaderSource(fragmentShader, fragtxt);
   gl.compileShader(fragmentShader);

   var program = gl.createProgram();
   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);

   return program;
}
