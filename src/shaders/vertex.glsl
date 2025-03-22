#include simplexNoise4d.glsl


attribute vec3 tangent;
uniform float uTime;
uniform float uPositionFrequnecy;
uniform float uPositionStrength;

uniform float uTimeFrequnecy;


uniform float uSmallWavePositionFrequency;
uniform float uSmallWavePositionStrength;
uniform float uSmallWaveTimeFrequency;

float getBlob(vec3 position)  {
    vec3 wrappedPosition = position;
    wrappedPosition += snoise(vec4(position * uPositionFrequnecy, uTime * uTimeFrequnecy)) * uPositionStrength;
    return snoise(vec4(wrappedPosition * uSmallWavePositionFrequency, uTime * uSmallWaveTimeFrequency)) * uSmallWavePositionStrength;
}

void main() {
    vec3 bitangent = cross(tangent.xyz, normal); // cross product jisse dono k normal bitangent mile
    float shift = .07;//kitna variation chahiye

    // vec3 A = csm_Position + shift * bitangent; // most upr point k liye plus 
    vec3 A = csm_Position + shift * tangent.xyz; // most upr point k liye plus 
    // vec3 B = csm_Position - shift * bitangent;// most niche point k liye minus
    vec3 B = csm_Position + shift * bitangent;// most niche point k liye minus

    float blob = getBlob(csm_Position);//
    csm_Position += blob * normal;

    A += getBlob(A) * normal;
    B += getBlob(B) * normal;

vec3 shadowA = normalize(A - csm_Position);
vec3 shadowB = normalize(B - csm_Position);

csm_Normal = -cross(shadowA, shadowB);
}