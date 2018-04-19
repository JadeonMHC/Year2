uniform mat4 transform;
uniform mat4 scale;
uniform mat4 projection;
attribute highp vec4 vertexPosition;
varying lowp vec4 fragmentColor;

void main() {
   fragmentColor = vec4(1.0, 0.5, 0.5, 1.0);
   gl_Position = projection * transform * scale * vertexPosition;
}
