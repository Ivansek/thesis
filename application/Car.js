
function Car(i)
{
	var rand = new Random();
	this.start = this.get_node_name(rand.unique_random(0, edge_nodes.length));
	
	this.finish = this.get_node_name(rand.unique_random(0, edge_nodes.length));

	this.path = dijkstra.find_path(level.connections, this.start, this.finish);
	/*if( i == 0)
	{
		this.start = "e"
		this.finish = "k"
		this.path = ["e", "f", "j", "k"];
	}*/
	this.path_two_forward = this.path[2];
	this.i=i;
	// Animation
	this.offset = {x : 0, y : 0}
	this.image = this.init_image();
	this.startNode = nodes.getByName(this.start);
	this.destNode = nodes.getByName(this.finish);
	this.position = {"x": this.startNode.x, "y": this.startNode.y};
	this.delay = 0//rand.rand(0, 10);
	this.ctx = document.getElementById(canvasID).getContext("2d");
	this.currNode = nodes.getByName(this.path[0]);
	this.nextNode = nodes.getByName(this.path[1]);
	this.pathCount = 1;
	this.rect = {x : 0, y : 0, w: 0, h : 0}
	this.direction = this.get_direction(this.currNode, this.nextNode, true);
	this.prev_direction = this.direction;
	this.hasGreenLight = false;
	this.pos_delay = {x:0, y:0}
	this.count = 0;
	this.cars_at_front = 0;
	this.dist_to_move_into_intersection = ~~(60/MOVE_STEP)*MOVE_STEP;
	//document.getElementById("debug").innerHTML += "["+path+"], direction: "+direction+", delay: "+this.delay+"\n";
}

Car.prototype.get_distance = function()
{
	var dist = 0;
	
	for( var i=1; i<this.path.length; i++)
	{
		dist+=this.get_cost(this.path[i-1], this.path[i]);
	}
	
	return dist;
}

Car.prototype.init_image = function()
{
	var image = new Image();
	var images = ["car.png", "car_yellow.png", "car_purple.png", "car_red.png", "car_orange.png", "car_green.png", "car_light_green.png"];

	image.src = "images/"+images[~~(Math.random()*images.length)];
	return image;
}


Car.prototype.get_iterations = function(nextNode, nextNextNode)
{
	if( this.path.indexOf(nextNode) > -1 && this.path.indexOf(nextNextNode) > -1)
	{
		if( Math.abs(this.path.indexOf(nextNode) - this.path.indexOf(nextNextNode)) == 1 )
		{
			var prevCurrNode = this.path[this.path.indexOf(nextNode)-1];
			var prevNextNode = nextNode;
			
			this.calculate_when_out_of_intersection(prev_currNode, prevNextNode);
		}
	}
}

Car.prototype.get_lane_travel_time = function(currNode, nextNode)
{
	var dir = this.get_direction(nodes.getByName(currNode), nodes.getByName(nextNode), false);
	var cost = this.get_cost(currNode, nextNode);
	var st_iteracij = (cost-60)-15; // 15 odstejem, ker je ze izven krizisca in potem casi niso cisto natancni.

	if( i == 1) // samo na zacetku, ko smo se v edge node-u
	{
		var cars_at_front = this.get_cars_at_front();
		st_iteracij = (cost-60)+(this.image.width*cars_at_front); // stevilo iteracij, ki jih je potrebno narediti, zato da pridem od enega vozlisca do drugega
	}
	var lane_travel_time = st_iteracij*~~(1000/FPS); // cas potovanja od enega vozlisca do drugega v ms

	// Ali sploh je nextNode krizisce? V primeru, ko bo nextNode ciljno vozlisce ne bo
	if( intersections.indexOf(nextNode) > -1 )
	{
		var light_times = this.get_light_times(nextNode, configuration)
		var tmp_red = light_times.red*10*100;
		var tmp_green = light_times.green*10*100;

		var interval = tmp_red+tmp_green; // celoten cas rdece in zelene luci v ms
	
		if( (lane_travel_time%interval < tmp_red && (dir == "left" || dir == "right")) ||
			(lane_travel_time%interval > tmp_red && (dir == "up" || dir == "down")) ) // smo prsli na rdeco
		{
			// Travel time in cas cakanja sta vsteta v spodnji enacbi
			total_time += (((tmp_red/100)*~~(1000/(1000/FPS)))-~~(1000/(1000/FPS)))*~~(1000/FPS)
		}
		// Smo prisli na zeleno, pristejemo samo cas potovanja od zacetnega vozlisca do koncnega vozlisca
		else
		{
			total_time += lane_travel_time;
		}
	
		// V vsakem primeru se pristejemo cas potovanja cez krizisce
		total_time += (60+20)*20
	}
}
Car.prototype.is_edge_node = function(node)
{
	var node_rank = 0;
	for( var j in level.connections[node] )
	{
		node_rank++;
	}
	
	if( node_rank > 1 )
	{
		return false;
	}
	
	return true;
}

Car.prototype.get_node_name = function(index)
{
	return edge_nodes[index].name;
}

Car.prototype.get_light_times = function(node, configuration)
{
	for( var i in configuration)
	{
		var semaphore = configuration[i]
		if( semaphore.name == node )
		{
			return semaphore;
		}
	}
}

Car.prototype.get_cost = function(node1, node2)
{
	var conns = level.connections[node1];
	
	for( var i in conns )
	{
		if( i == node2 )
		{
			return conns[i];
		}
	}
}

Car.prototype.draw = function(ctx)
{
	this.init_rect();
	var angle = this.get_angle();
	ctx.translate(this.rect.x+this.offset.x, this.rect.y+this.offset.y);
	ctx.font = "11px Arial";
	ctx.fillStyle = "red";
	
	var pos = {};
	if( angle == Math.PI)
	{
		pos.x = -this.image.width/2;
		pos.y = -this.image.height/2;
	}
	else if( angle == 0)
	{
		pos.x = this.image.width/2;
		pos.y = -this.image.height/2;
	}
	else if( angle == Math.PI/2)
	{
		pos.x = -this.image.width/2;
		pos.y = this.image.width/2
	}
	else if( angle == (3*Math.PI)/2 )
	{
		pos.x = this.image.width/2;
		pos.y = -this.image.height/2
	}
	
	ctx.rotate(angle);
	ctx.drawImage(this.image, 0, -this.image.height/2);
	ctx.rotate(-angle);
	//ctx.fillText(this.i, pos.x, pos.y);

	ctx.fillStyle = "black"
	ctx.font = "normal"
	
	ctx.translate(-this.rect.x-this.offset.x,-this.rect.y-this.offset.y);
	/*ctx.fillStyle = "green";
	ctx.fillRect(this.rect.x+(this.rect.w/2)-1, this.rect.y+(this.rect.h/2)-1, 1,1);
	ctx.strokeStyle="red";
	ctx.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);*/
}

var visited_semaphores = {};

Car.prototype.update = function(time, configuration)
{
	var now = new Date();
	var time_diff = now.getTime()-time.getTime();
	this.dist_to_move_into_intersection = ~~(60/MOVE_STEP)*MOVE_STEP;
	
	if( this.currNode != this.destNode )
	{
		if( time_diff > this.delay*1000 )
		{
			// Premaknem se iz edge noda v prvo krizisce
			if(this.is_edge_node(this.currNode.name) && !this.reached_node() )
			{
				if( !this.has_car_at_front() && !this.can_move() )
				{
					this.move();
				}
			}
			// Premikam se od krizisca do krizisca
			else
			{	
				// najprej se premaknem cez krizisce, ce se moram
				if( this.moving_into_intersection )
				{
					this.count+=MOVE_STEP;
					this.move();
					
					if( this.count == this.dist_to_move_into_intersection)
					{
						this.pathCount++;
						this.currNode = this.nextNode;
						this.nextNode = nodes.getByName(this.path[this.pathCount]);
						this.prev_direction = this.direction;
						this.direction = this.get_direction(this.currNode, this.nextNode, true);

						// Popravimo pozicije ob spremembi smeri, da se ne "pokvarijo"
						if( this.prev_direction == "down" || this.prev_direction == "up")
						{
							this.position.y = this.currNode.y;
						}
						else if( this.prev_direction == "left" || this.prev_direction == "right")
						{
							this.position.x = this.currNode.x;
						}

						if( this.currNode.name == this.path_two_forward && this.pathCount >= 2)
						{
							this.path_two_forward = this.path[this.pathCount];
							var prevCurrNode = nodes.getByName(this.path[this.pathCount-2]);
							var prevNextNode = nodes.getByName(this.path[this.pathCount-1]);
						//	var dir = this.get_direction(prevCurrNode, prevNextNode, false);
							visited_intersections[prevCurrNode.name][prevNextNode.name].splice(visited_intersections[prevCurrNode.name][prevNextNode.name].indexOf(this.i), 1);
						}
					}
					else if( this.count == this.dist_to_move_into_intersection+(~~(20/MOVE_STEP)*MOVE_STEP))
					{
						this.count = 0;
						this.moving_into_intersection = false;
						this.hasGreenLight = true;										
					}

				}
				// prisel sem do krizisca, v katerega se lahko premaknem, ce ...
				else if( this.reached_node() )
				{	
					if( this.nextNode == this.destNode )
					{
						this.currNode = this.nextNode;
					}
					else
					{
						this.hasGreenLight = this.is_green_light(this.nextNode, configuration);	
						// ... je na semaforju zelena luc in ce ...
						if( this.hasGreenLight)
						{
							// ... cesta, na katero hocem zaviti/se premakniti ni "zabasana"
							if( this.can_go(this.path[this.pathCount], this.path[this.pathCount+1]) )
							{
								this.moving_into_intersection = true;
								//var dir = this.get_direction(this.nextNode, nodes.getByName(this.path[this.pathCount+1]), false);
								if( visited_intersections[this.nextNode.name][this.path[this.pathCount+1]].indexOf(this.i) == -1 )
								{
									visited_intersections[this.nextNode.name][this.path[this.pathCount+1]].push(this.i);
								}
							}
						}
					}
					
				}
				// se premikam po cesti, po kateri se lahko premaknem ce ...
				else
				{
					// nimam avta pred seboj
					if( !this.has_car_at_front() )
					{
						if( this.hasGreenLight )
						{
							this.move();
						}
						else
						{
							this.hasGreenLight = this.is_green_light(this.nextNode, configuration);					
						}
					}
				}
			}
		}
	}
	else
	{
		
		if( this.reached_node() )
		{
			var prevCurrNode = nodes.getByName(this.path[this.pathCount-2]);
			var prevNextNode = nodes.getByName(this.path[this.pathCount-1]);
			if( !this.is_edge_node(prevCurrNode.name) )
			{
			//var prev_dir = this.get_direction(prevCurrNode, prevNextNode, false);
				visited_intersections[prevCurrNode.name][prevNextNode.name].splice(visited_intersections[prevCurrNode.name][prevNextNode.name].indexOf(this.i), 1);
			}
			cars_to_remove.push(this);
		}
		else
		{
			this.move();
		}
	}
}

Car.prototype.copy = function(car)
{
	this.start = car.start;
	this.finish = car.finish;
	this.path = car.path.slice();
	this.path_two_forward = car.path_two_forward;
	this.i=car.i;
	// Animation
	this.offset = this.clone(car.offset)
	this.image = car.image;
	this.startNode = car.startNode;
	this.destNode = car.destNode;
	this.position = this.clone(car.position);
	this.delay = car.delay;
	this.ctx = car.ctx
	this.currNode = car.currNode;
	this.nextNode = car.nextNode;
	this.pathCount = car.pathCount;
	this.rect = this.clone(car.rect)
	this.direction = car.direction
	this.prev_direction = car.prev_direction;
	this.hasGreenLight = car.hasGreenLight
	this.pos_delay = this.clone(car.pos_delay);
	this.count = car.count;
	this.cars_at_front = car.cars_at_front;
	this.dist_to_move_into_intersection = car.dist_to_move_into_intersection;
}

Car.prototype.reached_node = function()
{
	var offset = this.dist_to_move_into_intersection;
	if( this.currNode == this.destNode )
	{
		offset = 0;
	}
	var reach_node = true;
	if( this.direction == "down" )
	{
		if( this.position.y+offset < this.nextNode.y)
		{
			//this.position.y+=MOVE_STEP;
			reach_node = false;
		}
	}

	if( this.direction == "up" )
	{
		if( this.position.y-offset > this.nextNode.y)
		{
			//this.position.y-=MOVE_STEP;
			reach_node = false;
		}
	}

	if( this.direction == "left")
	{
		if( this.position.x-offset > this.nextNode.x)
		{
			//this.position.x-=MOVE_STEP;
			reach_node = false;
		}
	}

	if( this.direction == "right")
	{
		if( this.position.x+offset < this.nextNode.x)
		{
			//this.position.x+=MOVE_STEP;
			reach_node = false;
		}
	}
	
	return reach_node;
}

Car.prototype.move = function()
{
	if( this.direction == "up")
	{
		this.position.y-=MOVE_STEP;
	}
	else if( this.direction == "down" )
	{
		this.position.y+=MOVE_STEP;
	}
	else if( this.direction == "left" )
	{
		this.position.x -= MOVE_STEP;
	}
	else if( this.direction == "right")
	{
		this.position.x += MOVE_STEP;
	}
}

Car.prototype.can_go = function(s, e)
{
	if( this.is_edge_node(s) || e == this.destNode.name)
	{
		return true;
	}
	
	if( !this.can_move )
	{
		return false;
	}
	

	var cost = this.get_cost(s, e);
	var cars_per_road = ~~((cost-2*20)/(this.image.width+3))
	
	// Spremenimo currNode in nextNode zato da dobimo naslednjo smer
	/*var prevCurrNode = this.currNode;
	var prevNextNode = this.nextNode;
	this.pathCount++;
	this.currNode = this.nextNode;
	this.nextNode = nodes.getByName(this.path[this.pathCount])
	var dir = this.get_direction(false);
	
	// Avto hoce zaviti. Ali lahko zavije?
	if( dir != this.direction)
	{
		var tmp_rect = this.rect;
		this.init_rect();
		var go = !this.collision_detection() && visited_intersections[this.currNode.name][dir].length < cars_per_road;
		this.rect = tmp_rect;
		
		return go;
		//return this.can_turn(s, e)
	}
	// Damo nazaj currNode in nextNode
	this.pathCount--;
	this.currNode = prevCurrNode;
	this.nextNode = prevNextNode;*/
	
	//var dir = this.get_direction(this.nextNode, nodes.getByName(this.path[this.pathCount+1]), false);
	
	if( visited_intersections[s][e].length < cars_per_road )
	{
		return true;
	}
	else if( visited_intersections[s][e].indexOf(this.i) > -1 )
	{
		return true;
	}
	
	return false;
}

/*Car.prototype.can_turn = function(s, e)
{
	var cost = this.get_cost(s, e);
	var cars_per_road = ~~((cost-2*20)/(this.image.width+3))
	
	if( visited_intersections[node].length < cars_per_road || )
	{
		return true;
	}
}*/

Car.prototype.collision_detection = function()
{
	for(var i in cars)
	{
		var car = cars[i]
		if( car != this &&  this.collide(car))
		{
			return true;
			/*var m = this.get_dist_to_node(this.nextNode);
			var c = car.get_dist_to_node(car.nextNode);
			
			if( m < c )
			{
				return true;
			}*/
		}
	}
	
	return false;
}

Car.prototype.collide = function(car)
{
	var r1 = car.rect;
	var r2 = this.rect;
	
	var r1_c = {
		x : r1.x+(r1.w/2),
		y : r1.y+(r1.h/2)
	}

	var r2_c = {
		x : r2.x + (r2.w/2),
		y : r2.y + (r2.h/2)
	}

	var n = {
		x : r2.x - r1.x,
		y : r2.y - r1.y
	}
	
	if( r1.x + r1.w > r2.x && r1.x < r2.x + r2.w && 	r1.y + r1.h > r2.y && r1.y < r2.y + r2.h )
	{
		var collision_direction = [];
		if( n.x > 0 )
		{
			collision_direction.push("left")
		}
		else if( n.x < 0 )
		{
			collision_direction.push("right");
		}
		
		if( n.y > 0)
		{
			collision_direction.push("up");
		}
		else if( n.y < 0)
		{
			collision_direction.push("down");
		}	
		
		if( collision_direction.indexOf(this.direction) > -1)	
		{
			return true;
		}
	}
	
	return false;
//	return r2.left < r1.right && r2.right > r1.left && r2.top < r1.bottom && r2.bottom > r1.top
}

Car.prototype.has_car_at_front = function()
{
	this.tmp_rect = this.clone(this.rect);
	for( var i in cars )
	{
		var car = cars[i];
		
		if( car.direction == this.direction && car !== this)
		{
			if( this.direction == "down")
			{

				this.rect.y+=1;
				
/*				if( car.position.x == this.position.x && this.position.y+this.image.width-car.position.y == 0  )
				{
					return true;
				}*/
			}
			
			else if( this.direction == "up")
			{
				this.rect.y-=1;
			
/*				if( car.position.x ==  this.position.x && this.position.y-this.image.width-car.position.y == 0)
				{
					return true;
				}*/
			}
			
			else if( this.direction == "left" )
			{
				this.rect.x-=1;
				/*if( car.position.y == this.position.y && (car.rect.x+(car.rect.w/2)) - (this.rect.x-(this.rect.w/2)) == 0)
				{
					return true;
				}*/
			}
			else if( this.direction == "right" )
			{
				this.rect.x+=1;
				/*if( car.position.y == this.position.y && this.position.x+this.image.width-car.position.x == 0)
				{
					return true;
				}*/
			}
			
			//ctx.strokeStyle="pink";
			//ctx.strokeRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h);
			if( this.collide(car) )
			{
				this.rect = this.clone(this.tmp_rect);
				return true;
			}
			this.rect = this.clone(this.tmp_rect);
		}
	}
	this.rect = this.clone(this.tmp_rect);
	return false;
}

Car.prototype.can_move = function()
{
	this.tmp_rect = this.clone(this.rect);
	for( var i in cars )
	{
		var car = cars[i];
		
		if( car.direction == this.direction && car !== this)
		{
			if( this.direction == "down")
			{

				this.rect.y+=MOVE_STEP;
				
/*				if( car.position.x == this.position.x && this.position.y+this.image.width-car.position.y == 0  )
				{
					return true;
				}*/
			}
			
			else if( this.direction == "up")
			{
				this.rect.y-=MOVE_STEP;
			
/*				if( car.position.x ==  this.position.x && this.position.y-this.image.width-car.position.y == 0)
				{
					return true;
				}*/
			}
			
			else if( this.direction == "left" )
			{
				this.rect.x-=MOVE_STEP;
				/*if( car.position.y == this.position.y && (car.rect.x+(car.rect.w/2)) - (this.rect.x-(this.rect.w/2)) == 0)
				{
					return true;
				}*/
			}
			else if( this.direction == "right" )
			{
				this.rect.x+=MOVE_STEP;
				/*if( car.position.y == this.position.y && this.position.x+this.image.width-car.position.x == 0)
				{
					return true;
				}*/
			}
			
			//ctx.strokeStyle="pink";
			//ctx.strokeRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h);
			if( this.collide(car) )
			{
				this.rect = this.clone(this.tmp_rect);
				return true;
			}
			this.rect = this.clone(this.tmp_rect);
		}
	}
	this.rect = this.clone(this.tmp_rect);
	return false;
}

Car.prototype.clone = function(obj) 
{
    if(obj == null || typeof(obj) != 'object')
        return obj;    
    var temp = new obj.constructor(); 
    for(var key in obj)
        temp[key] = this.clone(obj[key]);    
    return temp;
}

Car.prototype.init_position = function()
{
	this.cars_at_front = this.get_cars_at_front();
	if( this.direction == "down")
	{
		/*if( car.position.x == this.position.x && Math.abs(car.position.y-this.position.y) <= 0)
		{*/
			this.position.y-=((this.image.width+1)*(this.cars_at_front));
		//}
	}

	else if( this.direction == "up")
	{
		//if( car.position.x ==  this.position.x && Math.abs(this.position.y-car.position.y) <= 0)
		//{
			this.position.y+=((this.image.width+1)*(this.cars_at_front))
		//}
	}

	else if( this.direction == "left" )
	{
		//if( car.position.y == this.position.y && Math.abs(this.position.x-car.position.x) <= 0)
		//{
			this.position.x+=((this.image.width+1)*(this.cars_at_front))
		//}
	}
	else if( this.direction == "right" )
	{
		//if( car.position.y == this.position.y && Math.abs(this.position.x-car.position.x) <= 0)
		//{
			this.position.x-=((this.image.width+1)*(this.cars_at_front))
		//}
	}
	
	return false;
}

Car.prototype.get_cars_at_front = function()
{
	var n = 0;
	for( var i in cars )
	{
		var car = cars[i];
		if( car !== this && car.direction == this.direction)
		{
			if( Math.abs(car.position.x%(this.image.width+1)) == this.position.x%(this.image.width+1) && 
			this.position.y%(this.image.width+1) == Math.abs(car.position.y%(this.image.width+1)) )
			{
				if( car.i < this.i )
				{
					n++;	
				}
			}
		}
	}

	/*for(var i=this.i; i>=0; i--)
	{
		var car = cars[i];
		if( car != this )
		{
			if( car.direction == this.direction)
			{
				var offset = 0;
				if( i > 0 )
				{
					offset = i;
				}
				if( this.direction == "left" || this.direction == "right")
				{
					if( car.position.y == this.position.y && Math.abs(car.position.x%this.image.width) == (this.position.x%this.image.width)+offset )
					{
						n++;
					}
				}
			
				else if( this.direction == "up" || this.direction == "down")
				{
					if( car.position.x == this.position.x && Math.abs(car.position.y%this.image.width) == (this.position.y%this.image.width)+offset )
					{
						n++;
					}
				}
			}
		}
	}*/
	
	return n;
}

Car.prototype.get_angle = function()
{
	if( this.direction == "left")
	{
		// Rotate for 180 degrees in radians - nose left
		
		
		return Math.PI;
	}
	
	if( this.direction == "up" )
	{
		// Rotate for 270 degrees in radians - nose up 
	
		return (3*Math.PI)/2;
	}
	
	if( this.direction == "right")
	{
		// Don't rotate - nose right
		
		return 0;			
	}
	
	if( this.direction == "down" )
	{
		// Rotate for 90 degrees in radians - nose down
		
		return Math.PI/2;
	}
}

Car.prototype.is_green_light = function(node, semaforji)
{
	var semafor = semaforji.get(node.name);
	if( semafor == undefined)
	{
		return true;
	}
	
	else if( (this.direction == "up" || this.direction == "down") && semafor.direction == "vertical" )
	{
		return true;
	}
	
	else if( (this.direction == "left" || this.direction == "right") && semafor.direction == "horizontal")
	{
		return true;
	}
	
	return false;
}

Car.prototype.init_rect = function()
{
	if( this.direction == "left" )
	{
		this.rect.x = this.position.x-this.image.width;
		this.rect.y = this.position.y-this.image.height;
		this.rect.w = this.image.width;
		this.rect.h = this.image.height;
	}
	else if( this.direction == "right" )
	{
		this.rect.x = this.position.x+this.image.width-20
		this.rect.y = this.position.y;
		this.rect.w = this.image.width
		this.rect.h = this.image.height;
	}
	else if( this.direction == "up" )
	{
		this.rect.x = this.position.x
		this.rect.y = this.position.y-this.image.width
		this.rect.w = this.image.height
		this.rect.h = this.image.width;
	}
	else if( this.direction == "down" )
	{
		this.rect.x = this.position.x-this.image.height;
		this.rect.y = this.position.y;
		this.rect.w = this.image.height;
		this.rect.h = this.image.width;
	}
}

Car.prototype.get_direction = function(currNode, nextNode, change_offset)
{	
	var direction;
	
	if( currNode.x > nextNode.x && currNode.y == nextNode.y)
	{
		direction = "left";
		
		
		
		if( change_offset )
		{
			this.offset.x = 24;
			this.offset.y = 5;
		}
	}
	else if( currNode.x < nextNode.x && currNode.y == nextNode.y)
	{
		direction = "right";
		
				
		if( change_offset )
		{
			this.offset.x = 0;
			this.offset.y = 5;
		}
	}
	else if( currNode.x == nextNode.x && currNode.y > nextNode.y)
	{
		direction = "up";
		
	
		if( change_offset )
		{
			this.offset.x = 5;
			this.offset.y = 24;
		}
	}
	else if( currNode.x == nextNode.x && currNode.y < nextNode.y)
	{
		direction = "down";
			

		if( change_offset )
		{
			this.offset.x = 5;
			this.offset.y = 0;
		}
	}
	
	return direction;
}

/*var Car = function(i, canvasID, nodes, delay, startNode, destNode)
{	
	this.draw = function()
	{
		var self = this;
		var canvas = document.getElementById(canvasID);

		var angle = getAngle();
		
		ctx.translate(position.x, position.y);
		ctx.font = "11px Arial";
		ctx.fillStyle = "red";
		ctx.fillText(i, image.width/2, (-image.height/2));
		ctx.rotate(angle);
		ctx.drawImage(image, 0, -image.height/2);
		ctx.rotate(-angle);
		ctx.fillStyle = "black"
		ctx.font = "normal"
		ctx.translate(-position.x,-position.y);

	}
	
	var hasGreenLight = true;
	this.update = function(time, configuration)
	{
		var now = new Date();
		var time_diff = now.getTime()-time.getTime();
//		console.log("Current time: "+now+", start time: "+time)
//		console.log("Difference: "+tidiff);
		if( currNode !== destNode && time_diff > this.delay*level.animation_speed)
		{
			if( hasGreenLight )
			{
				var c_position_x = Math.round(position.x/level.car_speed);
				var c_position_y = Math.round(position.y/level.car_speed);
				var n_position_x = Math.round(nextNode.x/level.car_speed);
				var n_position_y = Math.round(nextNode.y/level.car_speed);
				if( c_position_x != n_position_x || c_position_y != n_position_y)
				{
					// We haven't come to the nextNode yet. Slowly move to the nextNode!
					if( direction == "right" )
					{
						position.x += level.car_speed;
					}
					else if( direction == "left" )
					{
						position.x -= level.car_speed;
					}
					else if( direction == "down" )
					{
						position.y += level.car_speed;
					}
					else if( direction == "up" )
					{
						position.y -= level.car_speed;
					}
				}
				else
				{
					// We came to the nextNode. It's time to change direction and get nextNode!
					//changeDirection();
					console.log()
					currNode = nodes.getByName(path[pathCount]);
					if( currNode !== destNode )
					{
						pathCount++;
						hasGreenLight = is_green_light(currNode, configuration);
						nextNode = nodes.getByName(path[pathCount]);
					//if( nextNode != undefined )
					//{
						direction = getDirection();
					}
					else
					{
						console.log("Time travel: "+(now-time)/level.animation_speed);
					}
					//}
					//getNextNode(nextNode);
				}
			}
			else
			{
				hasGreenLight = is_green_light(currNode, configuration);
			}
		}
		
	}
	
	function is_green_light(node, semaforji)
	{
		var semafor = semaforji.get(node.name);
		if( semafor == undefined)
		{
			return true;
		}
		return semafor.text == "R" ? false : true;
	}
	
	function getAngle()
	{
		var canvas = document.getElementById(canvasID);
		if( direction == "left")
		{
			// Rotate for 180 degrees in radians - nose left
			return Math.PI;
		}
		
		if( direction == "up" )
		{
			// Rotate for 270 degrees in radians - nose up 
			return (3*Math.PI)/2;
		}
		
		if( direction == "right")
		{
			// Don't rotate - nose right
			return 0;			
		}
		
		if( direction == "down" )
		{
			// Rotate for 90 degrees in radians - nose down
			return Math.PI/2;
		}
	}
	
	function initImage()
	{
		var image = new Image();
		image.src = "images/car.png";
		return image;
	}
	
	function getDirection()
	{
		var canvas = document.getElementById(canvasID);
		
		var direction;
		
		try
		{
		if( currNode.x > nextNode.x && currNode.y == nextNode.y)
		{
			direction = "left";
		}
		else if( currNode.x < nextNode.x && currNode.y == nextNode.y)
		{
			direction = "right";
		}
		else if( currNode.x == nextNode.x && currNode.y > nextNode.y)
		{
			direction = "up";
		}
		else if( currNode.x == nextNode.x && currNode.y < nextNode.y)
		{
			direction = "down";
		}
		}
		catch(err)
		{
			console.log( err.message )
		}
		
		return direction;
	}
	
	
	this.travel_time = function(configuration)
	{
		var total_time = 0
		
		for( var i = 1; i < path.length; i++ )
		{
			var prevNode = nodes.getByName(path[i-1]);
			var currNode = nodes.getByName(path[i]);
			
			var cost = get_cost(prevNode, currNode);
			
			var time = (cost/level.speed)//+this.delay;
			var light_times = get_light_times(path[i], configuration)
			// currNode ni krizisce
			if( light_times != undefined )
			{
				var lights_interval = light_times.green_light+light_times.red_light;
				var light_time = time % lights_interval;
				var light_is_red = (light_time < light_times.red_light) ? true : false;
				if( light_is_red )
				{
					light = "R";
					time += light_times.red_light;
				}
				else
				{
					light = "Z";
				}
				console.log("["+currNode.name+" : "+light+"]");
			}
			total_time += time;
		}
		
		var conf = "";
		for( var i in configuration )
		{
			conf += "[R:"+configuration[i].red_light+", G: "+configuration[i].green_light+", "+configuration[i].name+"]\n"
		}
		console.log(" = "+total_time);
		return total_time;
	}
	
	function get_lights_cycle(light_times)
	{
		var lights_cycle = [];
		for( var i=0; i< light_times.red_light; i++ )
		{
			lights_cycle.push("R");
		}
		
		for( var i=0; i<light_times.green_light; i++)
		{
			lights_cycle.push("Z");
		}
		
		return lights_cycle;
	}
	
	function get_light_times(name, configurations)
	{
		for( var i in configurations.semaphores)
		{
			var conf = configurations.semaphores[i];
			if( conf.name == name)
			{
				return conf;
			}
		}
	}
	function get_cost(prevNode, currNode)
	{
		for( var i in prevNode.connections)
		{
			if( i == currNode.name) 
			{
				return prevNode.connections[i];
			}
		}
	}
	
	var speed = 1;
	var position = {"x": startNode.x, "y": startNode.y};
	this.delay = delay;
	var path = dijkstra.find_path(level.connections, startNode.name, destNode.name);
	var ctx = document.getElementById(canvasID).getContext("2d");
	var image = initImage();
	var currNode = nodes.getByName(path[0]);
	var nextNode = nodes.getByName(path[1]);
	var pathCount = 1;
	var direction = getDirection();
	document.getElementById("debug").innerHTML += "["+path+"], direction: "+direction+", delay: "+this.delay+"\n";
}*/