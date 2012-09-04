function Semaphore(name, for_anim)
{
	if( !for_anim )
	{
		this.red = 0;
		this.green = 0;
		do{
			this.red = parseFloat(((Math.random()*SEMAPHORE_MAX_TIME)).toFixed(1))
		}while(this.red == 0 )
	
		do{
			this.green = parseFloat(((Math.random()*SEMAPHORE_MAX_TIME)).toFixed(1))
		}while(this.green == 0 || this.green == this.red)
	}
	else
	{
		var rand = new Random();
		this.red = rand.unique_random(1, 6);
		this.green = rand.unique_random(1,6);
	}

	this.name = name;
	this.offset = {x : 8, y : 8};
	this.text = "R";
	this.x = nodes.getByName(name).x-this.offset.x;
	this.y = nodes.getByName(name).y-this.offset.y;
	this.loop = parseFloat(parseFloat(0.1).toFixed(1));
	this.mod = this.red;
	this.direction = "vertical"
	this.green_image = this.init_image("bullet_green_icon.png");
	this.red_image = this.init_image("bullet_red_icon.png");
	this.isWaiting = false;
	this.waiting_time = 2;
}

Semaphore.prototype.init_image = function(filename)
{
	var image = new Image();
	image.src = "images/"+filename;
	return image;
}

Semaphore.prototype.draw = function(ctx, time)
{
	/*if( !this.c )
	{
		this.x += this.offset.x;
		this.y += this.offset.y;
		this.c = true;
	}
	ctx.font = "20px Arial";
	ctx.fillStyle = "white"
	ctx.fillText(this.text, this.x, this.y);
	ctx.font = "11px Arial";
	ctx.fillText(this.loop, this.x+5, this.y+10)
	ctx.fillText("R: "+this.red+", Z: "+this.green, this.x-5, this.y-20);
	ctx.fillText(this.direction, this.x, this.y+15)*/
	/*var image = this.red_image;
	if( this.direction == "horizontal" )
	{
		image = this.green_image;
	}
	ctx.drawImage(image, this.x, this.y);
	ctx.fillStyle = "white"
	ctx.fillText(this.loop, this.x+10, this.y+35);*/
	var h_image = this.red_image;
	var v_image = this.green_image;
	if( this.direction == "horizontal" )
	{
		h_image = this.green_image;
		v_image = this.red_image;
	}
	else if( this.direction == "all")
	{
		h_image = this.red_image;
		v_image = this.red_image;
	}

	var node = nodes.getByName(this.name);
	var directions = [];
	for(var i in nodes.getByName(this.name).connections )
	{
		var desc = nodes.getByName(i);
		if(  desc.x > node.x && desc.y == node.y )
		{
			directions.push("right");
		}

		if( desc.x < node.x && desc.y == node.y )
		{
			directions.push("left");
		}	

		if( desc.x == node.x && desc.y > node.y )
		{
			directions.push("down");
		}

		if( desc.x == node.x && desc.y < node.y )
		{
			directions.push("up");
		}
	}
	ctx.globalAlpha = 0.6;

	if( directions.indexOf("left") > -1 )
	{
		ctx.drawImage(h_image, this.x-30, this.y);
	}

	if( directions.indexOf("right") > -1 )
	{
		ctx.drawImage(h_image, this.x+30, this.y);
	}

	if( directions.indexOf("up") > -1 )
	{
		ctx.drawImage(v_image, this.x, this.y-30);
	}

	if( directions.indexOf("down") > -1)
	{
		ctx.drawImage(v_image, this.x, this.y+30);
	}

	ctx.globalAlpha = 1;
	
}

Semaphore.prototype.update = function(ctx, time)
{
	if( time%~~((1000/(1000/FPS))/SEMAPHORE_FACTOR) == 0 && time != 0)
	{
		if( this.loop%this.mod == 0)
		{
			if( this.isWaiting )
			{
				this.direction = "all";
				if( this.waiting_time <= 0 )
				{
					this.isWaiting = false;
					this.waiting_time = 2;
					this.direction = this.last_direction;
				}
				this.waiting_time--;
			}
			
			if( !this.isWaiting )
			{
				this.isWaiting = true;
				if( this.mod == this.red )
				{
					this.text = "Z";
					this.mod = this.green;
				}
				else if( this.mod == this.green )
				{
					this.text = "R";
					this.mod = this.red;
				}
				this.direction = this.direction == "vertical" ? "horizontal" : "vertical";
				this.last_direction = this.direction;
				this.loop = parseFloat(0.0);
				this.loop = parseFloat(parseFloat(parseFloat(this.loop) + 0.1).toFixed(1));
			}
		}
		else
		{
			this.loop = parseFloat(parseFloat(parseFloat(this.loop) + 0.1).toFixed(1));			
		}
		
	}
}