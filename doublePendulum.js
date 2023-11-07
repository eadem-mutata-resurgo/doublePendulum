const pi = Math.PI;
function sin(a) { return Math.sin(a); }
function cos(a) { return Math.cos(a); }

const canvas = document.getElementById("pendulumCanvas");
const context = canvas.getContext("2d");
const startButton = document.getElementById("startButton"); 
    startButton.addEventListener("click", startStop);
const p1AngleSlider = document.getElementById("p1AngleSlider");
    p1AngleSlider.addEventListener("input", reset);
const p1MassSlider = document.getElementById("p1MassSlider");
    p1MassSlider.addEventListener("input", reset);
const p2AngleSlider = document.getElementById("p2AngleSlider");
    p2AngleSlider.addEventListener("input", reset);
const p2MassSlider = document.getElementById("p2MassSlider");
    p2MassSlider.addEventListener("input", reset);
const tailLengthSlider = document.getElementById("tailLengthSlider");
    tailLengthSlider.addEventListener("input", tailUpdate);
const infTailSwitch = document.getElementById("infTailSwitch");
    infTailSwitch.addEventListener("input", tailUpdate);

const w = canvas.width;
const h = canvas.height;
const axMax = 3; //maximum axis value
let running = false;

const g = 1;            //gravitational constant
const dt = 0.05;        //time step
const l = [1.25, 1.25];       //length of pendulums: [l1, l2]
let m, ang, prevAng, vel, maxVel;

let tailLength, tailAngVals, curAng;
let tailCol = [255, 100, 0];

window.onload = (event) => {
    context.scale(1, -1)
    context.translate(w/2, -h/2);
    context.scale(w/(2*axMax), -h/(2*axMax));
    curAng = [];
    maxVel = [1, 1];
    reset();
}

function reset() {
    if (running) { startStop(); }
    m = [p1MassSlider.value, p2MassSlider.value];
    ang = [p1AngleSlider.value*pi/180, p1AngleSlider.value*pi/180 + p2AngleSlider.value*pi/180];
    prevAng = [p1AngleSlider.value*pi/180, p1AngleSlider.value*pi/180 + p2AngleSlider.value*pi/180];
    vel = [0, 0];
    tailUpdate();
    context.clearRect(-axMax, -axMax, 2*axMax, 2*axMax);
    drawAxes();
    drawPendulums();

}

function tailUpdate() {
    tailLength = tailLengthSlider.value;
    tailAngVals = [];
    for (let i = 0; i < tailLength; i++) {
        tailAngVals[i] = [l[1]*sin(ang[1]) + l[0]*sin(ang[0]), l[1]*cos(ang[1]) + l[0]*cos(ang[0])];
    }
}

function startStop() {
    running = !running;
    if (!running) { startButton.value = "start"; }
    else {
        startButton.value = "stop"
        draw();
    };
    
}

//drawing
function draw() {
    context.clearRect(-axMax, -axMax, 2*axMax, 2*axMax);
    drawAxes();
    drawTail();
    drawPendulums();
    compute();
    if (running) { window.requestAnimationFrame(draw); }
}

function drawPendulums() {
    let p1 = [l[0]*sin(ang[0]), l[0]*cos(ang[0])];
    let p2 = [l[1]*sin(ang[1]) + p1[0], l[1]*cos(ang[1]) + p1[1]];

    context.save();
    context.strokeStyle = "black";
    context.fillStyle = "black";
    context.lineWidth = 6*axMax/w;

    //anchor
    context.beginPath();
    context.arc(0, 0, 8*axMax/w, 0, 2*pi);
    context.fill();
    context.closePath();

    //bars
    context.beginPath();
    context.moveTo(0,0);
    context.lineTo(p1[0], p1[1]);
    context.lineTo(p2[0], p2[1]);
    context.stroke();
    context.closePath();

    //weights
    context.lineWidth = 4*axMax/w;
    context.beginPath();
    context.fillStyle = colorGrad([0, 0, 255], [255, 0, 0], Math.abs(vel[0])/maxVel[0]);
    context.arc(p1[0], p1[1], (m[0]*axMax/w/5)**(1/3), 0, 2*pi);
    context.fill();
    context.stroke();
    context.closePath();

    context.beginPath();
    context.fillStyle = colorGrad([0, 0, 255], [255, 0, 0], Math.abs(vel[1])/maxVel[1]);
    context.arc(p2[0], p2[1], (m[1]*axMax/w/5)**(1/3), 0, 2*pi);
    context.fill();
    context.stroke();
    context.closePath();

    context.restore();
}

function drawAxes() {
    context.save()

    //grid lines
    context.strokeStyle = "gray";
    context.lineWidth = 2*axMax/w;
    context.beginPath()
    for (let i = 0; i <= 2*axMax; i++) {
      context.moveTo(i-axMax, -axMax);
      context.lineTo(i-axMax, axMax);
      context.moveTo(-axMax, i-axMax);
      context.lineTo(axMax, i-axMax);
    }
    context.stroke();
    context.closePath();

    context.restore();
}

function drawTail() {
    tailAngVals.push([l[1]*sin(ang[1]) + l[0]*sin(ang[0]), l[1]*cos(ang[1]) + l[0]*cos(ang[0])]);
    if (!infTailSwitch.checked) { tailAngVals.shift(); }
    context.save();
    context.lineWidth = 2*axMax/w;
    for (let i=1; i<tailAngVals.length; i++ ) {
        context.beginPath();

        
        if (!infTailSwitch.checked) {
            context.lineWidth = (4*axMax/w) * i/tailLength;
            context.strokeStyle = colorGrad([255, 255, 255], tailCol, i/tailLength);
        }
        else  {
            context.strokeStyle = colorGrad([255, 255, 255], tailCol, 1);
        }
        context.moveTo(tailAngVals[i-1][0], tailAngVals[i-1][1]);
        context.lineTo(tailAngVals[i][0], tailAngVals[i][1]);
        context.stroke();

        context.closePath();
    }
    context.restore();
}

function colorGrad(c1, c2, d) {
    let r = (1-d)*c1[0] + d*c2[0];
    let g = (1-d)*c1[1] + d*c2[1];
    let b = (1-d)*c1[2] + d*c2[2];
    return "rgb(" + r.toString() + " " + g.toString() + " " + b.toString() + ")";
}

//math
function compute() {
    curAng[0] = ang[0];
    curAng[1] = ang[1];

    vel[0] = (curAng[0] - prevAng[0])/dt;
    vel[1] = (curAng[1] - prevAng[1])/dt;

    ang[0] = 2*ang[0]-prevAng[0]+(dt**2)*motionEq1(curAng[0], curAng[1], vel[0], vel[1]);
    ang[1] = 2*ang[1]-prevAng[1]+(dt**2)*motionEq2(curAng[0], curAng[1], vel[0], vel[1]);

    prevAng[0] = curAng[0];
    prevAng[1] = curAng[1];

    Math.abs(vel[0]) > maxVel[0] ? maxVel[0] = Math.abs(vel[0]) : void(0);
    Math.abs(vel[1]) > maxVel[1] ? maxVel[1] = Math.abs(vel[1]) : void(0);
}

function motionEq1(a1, a2, v1, v2) {
    //equation of motion for the first pendulum

    let m1 = m[0]; let m2 = m[1]; let l1 = l[0]; let l2 = l[1];
    
    let n1 = -g*(2*m1+m2)*sin(a1);
    let n2 = -m2*g*sin(a1-2*a2);
    let n3 = -2*sin(a1-a2)*m2*((v2**2)*l2+(v1**2)*l1*cos(a1-a2));

    let d = l1*(2*m1+m2-m2*cos(2*a1-2*a2));

    return (n1+n2+n3)/d;
}

function motionEq2(a1, a2, v1, v2) {
    //equation of motion for the second pendulum
    let m1 = m[0]; let m2 = m[1]; let l1 = l[0]; let l2 = l[1];

    let n1 = (v1**2)*l1*(m1+m2);
    let n2 = g*(m1+m2)*cos(a1);
    let n3 = (v2**2)*l2*m2*cos(a1-a2);

    let d = l2*(2*m1+m2-m2*cos(2*a1-2*a2));

    return 2*sin(a1-a2)*(n1+n2+n3)/d;
}

