/**
 * GLSL shaders for the hero point field. Kept in their own module so the
 * React component stays readable. GLSL runs on the GPU, once per point
 * (vertex shader) and once per pixel (fragment shader).
 */

export const vertexShader = /* glsl */ `
      uniform float uTime,uScroll,uSize,uIntro; uniform vec2 uMouse;
      attribute float aRnd; varying float vA; varying float vTint;
      // Ashima 3D simplex noise
      vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;}
      vec4 m289(vec4 x){return x-floor(x*(1./289.))*289.;}
      vec4 perm(vec4 x){return m289(((x*34.)+1.)*x);}
      vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}
      float snoise(vec3 v){
        const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
        vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
        vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
        vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=m289(i);
        vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
        float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.*floor(p*ns.z*ns.z);
        vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_); vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy;
        vec4 h=1.-abs(x)-abs(y); vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
        vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
        vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
        vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
        vec4 norm=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
        vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
        return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
      }
      void main(){
        vec3 p = position;
        float t = uTime*.12;
        float n = snoise(p*1.35 + vec3(t, t*.6, -t));
        float n2 = snoise(p*3.2 - vec3(t*1.4));
        float disp = n*.22 + n2*.05;
        // mouse ripple: push points facing the cursor
        float face = max(dot(normalize(p), normalize(vec3(uMouse, .9))), 0.);
        disp += pow(face, 6.) * .18;
        // scroll: sphere dissolves outward into a field
        float burst = uScroll * (1.2 + aRnd*2.6);
        p *= 1. + disp + burst;
        p *= mix(.0, 1., uIntro);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (0.55 + aRnd*.9) * (6. / -mv.z);
        float depth = smoothstep(-8.5, -4.6, mv.z);
        vA = (.12 + depth*.75) * (1. - uScroll*.85) * uIntro * (.55 + n*.45 + .3);
        // far side and noise valleys lean blue, near side stays light
        vTint = clamp((1. - depth) * .9 + (.5 - n) * .35, 0., 1.);
      }
`;

export const fragmentShader = /* glsl */ `
      uniform vec3 uColor; uniform vec3 uColorB; varying float vA; varying float vTint;
      void main(){
        float d = length(gl_PointCoord - .5);
        if(d > .5) discard;
        float a = smoothstep(.5, .0, d);
        gl_FragColor = vec4(mix(uColor, uColorB, vTint), a * vA);
      }
`;
