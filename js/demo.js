// ***************************  PAGE SETTING  **************************

String.prototype.format = function () {
    var values = arguments;
    return this.replace(/\{(\d+)\}/g, function (match, index) {
        if (values.length > index) {
            return values[index];
        } else {
            return "";
        }
    });
};

var bar1 = document.getElementById("bar1");
var bar2 = document.getElementById("bar2");
var bar3 = document.getElementById("bar3");
var bar4 = document.getElementById("bar4");
var tilte = document.getElementById("title");
var slider1 = document.getElementById("slider1");
var slider2 = document.getElementById("slider2");
var nump1 = document.getElementById("nump1");
var demo  = document.getElementById("demo");
var button1 = document.getElementById("button1div");
var fun1 = document.getElementById("fun1div");
var fun2 = document.getElementById("fun2div");
var fun3 = document.getElementById("fun3div");
var canvas = document.createElement("canvas");
canvas.width = 0;
canvas.height = 0;
demo.appendChild(canvas);

button1.onclick = function() {
	window.location.href = 'http://www.phycai.net/preview/';
}

window.onresize = resize;
slider1.oninput = update;

var tcxt = title.getContext("2d");
tcxt.font = "normal 24px Times";
tcxt.textAlign = "center";
tcxt.fillStyle = "#000";
tcxt.fillText(document.title, 512, 33);

var cxt = canvas.getContext("2d");

demo.setAttribute("width", "668");
demo.setAttribute("height", "668");

var ox, oy;
resize();

function resize()
{
	var width = document.documentElement.clientWidth;
	var height = document.documentElement.clientHeight;
	bar1.style = "width: {0}px".format(width);
	bar2.style = "height: {0}px; left: 351px".format(height-50);
	bar3.style = "left: 356px; top: {0}px; width: {1}px".format(height-55, width-356);
	bar4.style = "width: {0}px; top: -5px".format(width);
	title.style = "left: {0}px".format((width-1024)/2);
	demo.style = "width: {0}px; height: {1}px; left: 356px".format(width-356, height-105);
	canvas.width = width-356;
	canvas.height = height-105;
	button1.style = "top: {0}px; left: 356px".format(height-50);
	fun1.style = "top: {0}px; left: {1}px".format(height-50, width-50);
	fun2.style = "top: {0}px; left: {1}px".format(height-50, width-100);
	fun3.style = "top: {0}px; left: {1}px".format(height-50, width-150);

	ox = canvas.width/2;
	oy = canvas.height/2;
}

update();

function update()
{
	nump1.value = slider1.value;
}

// ****************************  EMULATION  ****************************

var b2Vec2 = Box2D.Common.Math.b2Vec2
,b2AABB = Box2D.Collision.b2AABB
,b2BodyDef = Box2D.Dynamics.b2BodyDef
,b2Body = Box2D.Dynamics.b2Body
,b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,b2Fixture = Box2D.Dynamics.b2Fixture
,b2World = Box2D.Dynamics.b2World
,b2MassData = Box2D.Collision.Shapes.b2MassData
,b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,b2DebugDraw = Box2D.Dynamics.b2DebugDraw
,b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
;

var world;
const scale = 300;
const centerx = 215;
const centery = 310;
const gap = 20;
const num_gaps = 17;
const board_width = 5;
const base_y = 310;
const clap_height = 225;
const side_height = 380;
const baffle_height = side_height+120;
const ball_r = 3;
const hole_size = 20;
const num_cyls = [4, 5, 6, 9, 10, 11, 14, 15, 16, 15, 16, 15, 16, 15, 16, 15, 16, 15, 16];
const cyl_y = -155;
const cyl_r = 3;
const funnel_height = baffle_height+120;
const funnel_size = 300;

const base_width = (gap+board_width)*num_gaps+board_width;
const cyl_gap = (board_width+gap)/2;//*Math.sqrt(3);

var stat_balls = new Array(num_gaps);
var stat_value = new Array(num_gaps);
var stat_total = 0;
const threshold = 0.001;
const smooth_speed = 0.05;
const num_points = 100;
const tau = 0.5;

var device = new Image();
device.src = "img/device.png";

function main()
{
	world = new b2World(new b2Vec2(0, 9.8), true);

	var i, j;
	create_rect(
		0,
		base_y+board_width/2,
		base_width,
		board_width
	);

	for(i = -1; i < 2; i+=2)
	{
		create_rect(
			(gap+board_width)*i*num_gaps/2,
			base_y-side_height/2,
			board_width,
			side_height
		);
		create_rect(
			(base_width+hole_size)/4 * i,
			base_y-(side_height+baffle_height)/2,
			Math.sqrt(Math.pow(baffle_height-side_height,2) + Math.pow((base_width-hole_size)/2,2)),
			board_width,
			Math.atan2(baffle_height-side_height, (base_width-hole_size)/2) * i
		);
		create_rect(
			(hole_size+funnel_size)/4 * i,
			base_y-(baffle_height+funnel_height)/2,
			Math.sqrt(Math.pow(funnel_height-baffle_height,2) + Math.pow((hole_size-funnel_size)/2,2)),
			board_width,
			Math.atan2(funnel_height-baffle_height, (hole_size-funnel_size)/2) * i
		);
	}

	for(i = 1; i < num_gaps; i++)
		create_rect((gap+board_width)*(i-num_gaps/2), base_y-clap_height/2, board_width, clap_height);

	for(j = 0; j < num_cyls.length; j++)
		for(i = 0; i < num_cyls[j]; i++)
			create_circle(
				(gap+board_width)*(i-num_cyls[j]/2+0.5),
				cyl_y+cyl_gap*j,
				cyl_r,
				0
			);

	//create_debug();

	for(i = 0; i < num_gaps; ++i)
	{
		stat_balls[i] = 0;
		stat_value[i] = 0;
	}

	window.requestAnimationFrame(loop);
}

function create_circle(x, y, r, dynamic=1)
{
	var bodyDef  = new b2BodyDef();
	if(dynamic) bodyDef.type = b2Body.b2_dynamicBody;
	else bodyDef.shape = b2Body.b2_staticBody;
	bodyDef.position.Set(x/scale, y/scale);
	var shape = new b2CircleShape(r/scale);
	var fixtureDef = new b2FixtureDef();
	fixtureDef.shape = shape;
	fixtureDef.density = 1;
	fixtureDef.restitution = .3;
	fixtureDef.friction = .5;
	//if(dynamic) fixtureDef.filter.groupIndex = -1;
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
	body.userData = 0;
	return body;
}

function create_rect(x, y, w, h, r=0)
{
	var bodyDef  = new b2BodyDef();
	bodyDef.type = b2Body.b2_staticBody;
	bodyDef.position.Set(x/scale, y/scale);
	var shape = new b2PolygonShape();
	shape.SetAsBox(w/2/scale, h/2/scale);
	var fixtureDef = new b2FixtureDef();
	fixtureDef.shape = shape;
	fixtureDef.friction = .5;
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
	body.SetAngle(r);
	return body;
}

function create_debug()
{
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(cxt);
	debugDraw.SetDrawScale(scale);
	debugDraw.SetFillAlpha(0.5);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit);
	world.SetDebugDraw(debugDraw);
}

var num_balls = 0;
var drop_time = 0;
fun1.onclick = function() {
	if(!num_balls) num_balls += slider1.value;
};

var del_ball = false;
fun2.onclick = function() {
	if(del_ball)
	{
		del_ball = false;
		document.getElementById("fun2").value = "delete";
	}
	else
	{
		del_ball = true;
		document.getElementById("fun2").value = "keep";
	}
};

fun3.onclick = function() {
	for(var body = world.GetBodyList(); body; body = body.GetNext())
	{
		if(body.GetType() == b2Body.b2_dynamicBody)
		{
			world.DestroyBody(body);
		}
	}
	for(var i = 0; i < num_gaps; i++)
	{
		stat_balls[i] = 0;
		stat_value[i] = 0;
	}
	stat_total = 0;
	num_balls = 0;
}

function loop()
{
	window.requestAnimationFrame(loop);

	if(drop_time == 0)
	{
		if(num_balls)
		{
			create_circle(-funnel_size/8+Math.random()*funnel_size/4, base_y-funnel_height, ball_r);
			--num_balls;
			drop_time = 1;
		}
	}
	else drop_time--;

	world.Step(1/(150-slider2.value), 10, 10);
	world.ClearForces();
	//world.DrawDebugData();

	cxt.clearRect(0, 0, canvas.width, canvas.height);
	cxt.drawImage(device, ox-centerx-1, oy-centery);

	for(var body = world.GetBodyList(); body; body = body.GetNext())
	{
		if(body.GetType() == b2Body.b2_dynamicBody)
		{
			cxt.beginPath();
			cxt.arc(body.GetPosition().x*scale+ox, body.GetPosition().y*scale+oy, ball_r-0.5, 0, 2*Math.PI);
			cxt.strokeStyle = '#000000';
			cxt.stroke();
			cxt.fillStyle = '#FF0000';
			cxt.fill();
			if(body.GetPosition().y*scale >= base_y-board_width/2-clap_height+ball_r && body.userData == 0)
			{
				stat_balls[Math.floor((body.GetPosition().x*scale+(gap+board_width)*num_gaps/2)/(gap+board_width))]++;
				stat_total++;
				body.userData = 1;
			}
			if(body.GetPosition().y*scale >= base_y-board_width/2-ball_r && del_ball)
			{
				world.DestroyBody(body);
			}
		}
		else
		{
			try
			{
				if(body.GetFixtureList().GetShape().GetType() == 0)
				{
					cxt.beginPath();
					cxt.arc(body.GetPosition().x*scale+ox, body.GetPosition().y*scale+oy, cyl_r-0.5, 0, 2*Math.PI);
					cxt.strokeStyle = '#000000';
					cxt.stroke();
					cxt.fillStyle = '#FCFFE4';
					cxt.fill();
				}
				else if(body.GetPosition().y*scale > base_y-clap_height/2-10 && body.GetPosition().y*scale < base_y-clap_height/2+10)
				{
					cxt.beginPath()
					cxt.rect(body.GetPosition().x*scale+ox-board_width/2, body.GetPosition().y*scale+oy-clap_height/2, board_width, clap_height);
					cxt.strokeStyle = '#000000';
					cxt.stroke();
					cxt.fillStyle = '#FCFFF4';
					cxt.fill();
				}
			}
			catch(e) {}
		}
	}

	var i;

	if(stat_total)
	{
		for(i = 0; i < num_gaps; i++)
		{
			if(Math.abs(stat_balls[i]/stat_total-stat_value[i]) < threshold)
				stat_value[i] = stat_balls[i]/stat_total;
			else
				stat_value[i] += (stat_balls[i]/stat_total-stat_value[i])*smooth_speed;
		}
	}

	for(i = 0; i < num_gaps; i++)
	{
		cxt.beginPath();
		cxt.rect(
			(gap+board_width)*(i-num_gaps/2)+ox+1+board_width/2,
			base_y-clap_height*4*stat_value[i]+oy,
			gap,
			clap_height*4*stat_value[i]
		);
		cxt.stroke();
		cxt.fillStyle = "rgba(100,150,185,0.5)";
		cxt.fill();
	}

	var weighted_value = Array(num_points);
	for(i = 0; i < num_points; i++)
	{
		weighted_value[i] = 0;
		for(var j = 0; j < num_points; j++)
		{
			weighted_value[i] += stat_value[Math.floor(j/num_points*num_gaps)] * Math.exp(-Math.pow((i-j)/num_points*num_gaps,2)/2/tau/tau) / 10;
		}
	}
	cxt.beginPath();
	for(i = 0; i < num_points; i++)
	{
		if(i == 0) cxt.lineTo((gap+board_width)*(i/num_points*num_gaps-num_gaps/2)+gap/2+ox-board_width, base_y-clap_height*4*weighted_value[i]+oy);
		else cxt.lineTo((gap+board_width)*(i/num_points*num_gaps-num_gaps/2)+gap/2+ox-board_width, base_y-clap_height*4*weighted_value[i]+oy);
	}
	//if(stat_total) alert(weighted_value);
	cxt.stroke();
}

main();