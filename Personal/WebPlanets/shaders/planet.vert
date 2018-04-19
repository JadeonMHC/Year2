uniform mat4 transform;
uniform mat4 scale;
uniform mat4 projection;
uniform vec4 color;
attribute highp vec4 vertexPosition;
varying lowp vec4 fragmentColor;

void main() {
   fragmentColor = color;
   gl_Position = projection * transform * scale * vertexPosition;
}
