// 4D Perlin Noise (Basic Implementation)

vec4 permute(vec4 t) {
  return mod((t * 34.0 + 1.0) * t, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373473456387 * r;
}

float snoise(vec4 v) {
  const vec4 C = vec4(0.10132118364234, 0.30396355092699, 0.49467878873724, 1.0);
  vec4 i = floor(v + dot(v, C.yyyy));
  vec4 x0 = v - i + dot(i, C.xxxx);
  vec4 i1 = i + C.yyyy;
  vec4 x1 = x0 - C.yyyy;
  vec4 i2 = i + C.zzzz;
  vec4 x2 = x0 - C.zzzz;
  vec4 i3 = i + C.wwww;
  vec4 x3 = x0 - C.wwww;
  i1 = i1 + dot(fract(x0.wzxy), C.wwww);
  i2 = i2 + dot(fract(x0.wyzx), C.wwww);
  i3 = i3 + dot(fract(x0.wzyx), C.wwww);
  x1 = x1 + dot(floor(x0.wzxy), C.xxxx);
  x2 = x2 + dot(floor(x0.wyzx), C.xxxx);
  x3 = x3 + dot(floor(x0.wzyx), C.xxxx);
  vec4 x0_ = fract(x0);
  vec4 x1_ = fract(x1);
  vec4 x2_ = fract(x2);
  vec4 x3_ = fract(x3);
  x0 = x0_ - 0.5;
  x1 = x1_ - 0.5;
  x2 = x2_ - 0.5;
  x3 = x3_ - 0.5;
  vec4 a, b;
  float h = dot(x0, x0);
  vec4 mask = step(h, vec4(0.5));
  a = x0 * mask;
  b = x1 * (1.0 - mask);
  h = dot(x1, x1);
  mask = step(h, vec4(0.5));
  a += x1 * mask;
  b += x2 * (1.0 - mask);
  h = dot(x2, x2);
  mask = step(h, vec4(0.5));
  a += x2 * mask;
  b += x3 * (1.0 - mask);
  a += x3;
  vec3 g = vec3(a.x + a.y + a.z + a.w, a.y + a.z + a.w, a.z + a.w);
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  vec4 m2 = m * m;
  vec4 m3 = m2 * m;
  vec4 p = permute(i + vec4(0.0, 1.0, 2.0, 3.0));
  vec4 j = p * C.x + C.yyyy;
  vec4 k = p * C.y + C.zzzz;
  vec4 grad = vec4(dot(j, x0), dot(k, x1), dot(j, x2), dot(k, x3));
  return 49.0 * dot(m3, grad);
}

// void main() {
//   vec4 position = vec4(gl_FragCoord.xy, 0.0, 1.0); // Example 4D input
//   float noiseValue = snoise(position * 0.01); // Scale the input for smoother noise
//   gl_FragColor = vec4(vec3(noiseValue), 1.0);
// }