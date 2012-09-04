function Animation(canvas1, canvas2)
{
	this.ctx = document.getElementById(canvas1).getContext("2d");
	this.ctx_anim = document.getElementById(canvas2).getContext("2d");
}

Animation.prototype.animate_crossover = function(index, o1, o2)
{
	this.ctx.clearRect(0,0, 1024, 768);

	var start = {x:0, y:0};
	var box = {w:25, h: 20}
	for( var i in intersections)
	{
		this.ctx.strokeRect(start.x, start.y, box.w,box.h);
		this.ctx.fillText(o1.configuration[i].red+", "+o1.configuration[i].green, start.x+3, start.y+13);
		start.x+=box.w;
	}
	
	start.y=0;
	start.x=intersections.length*box.w+50;
	for( var i in intersections)
	{
		this.ctx.strokeRect(start.x, start.y, box.w,box.h);
		this.ctx.fillText(~~(o2.configuration[i].red)+", "+~~(o2.configuration[i].green), start.x+3, start.y+13);
		start.x+=box.w;
	}
	
	start.y=50;
	start.x=0;
	for( var i in intersections)
	{
		this.ctx.strokeRect(start.x, start.y, box.w,box.h);
		//this.ctx.fillText(o2.configuration[i].red+", "+o2.configuration[i].green, start.x+2, start.y+10);
		start.x+=box.w;
	}
	
	start.y=50;
	start.x=intersections.length*box.w+50;
	for( var i in intersections)
	{
		this.ctx.strokeRect(start.x, start.y, box.w,box.h);
		//this.ctx.fillText(~~(o2.configuration[i].red)+", "+~~(o2.configuration[i].green), start.x+3, start.y+13);
		start.x+=box.w;
	}
	
	var end = 50;
	start.y = 0;
	start.x = 0;
	var self = this;
//	this.foo(start, end, self, "rgba(127, 127, 227, 0.5", 0)
	// Animiraj prvi del prenosa gena
	var f = setInterval(function(){
		self.ctx_anim.clearRect(0,0,1024,768)
		self.ctx_anim.save();
		self.ctx_anim.fillStyle="rgba(127,127,227, 0.5)";
		for( var i=0; i<index; i++)
		{
			self.ctx_anim.fillRect(start.x, start.y, box.w, box.h)
			self.ctx_anim.save();
			self.ctx_anim.fillStyle="#000000";
			self.ctx_anim.fillText(~~(o1.configuration[i].red)+", "+~~(o1.configuration[i].green), start.x+3, start.y+13);
			self.ctx_anim.restore();
			start.x+=box.w;
		}
		
		start.x=intersections.length*box.w+50;
		for( var i=0; i<index; i++)
		{
			self.ctx_anim.fillRect(start.x, start.y, box.w, box.h)
			self.ctx_anim.save();
			self.ctx_anim.fillStyle="#000000";
			self.ctx_anim.fillText(~~(o2.configuration[i].red)+", "+~~(o2.configuration[i].green), start.x+3, start.y+13);
			self.ctx_anim.restore();
			start.x+=box.w;
		}
		
		
		if( start.y == end)
		{
			clearInterval(f);
			self.ctx_anim.clearRect(0,0, 1024, 768);
			self.ctx.save();
			self.ctx.fillStyle = "rgba(127,127,227, 0.5)";
			start.x = 0;
			for( var i=0; i<index; i++)
			{
				self.ctx.fillRect(start.x, start.y, box.w, box.h)
				self.ctx.save();
				self.ctx.fillStyle="#000000";
				self.ctx.fillText(~~(o1.configuration[i].red)+", "+~~(o1.configuration[i].green), start.x+3, start.y+13);
				self.ctx.restore();
				start.x+=box.w;
			}
			start.x=intersections.length*box.w+50;
			for( var i=0; i<index; i++)
			{
				self.ctx.fillRect(start.x, start.y, box.w, box.h)
				self.ctx.save();
				self.ctx.fillStyle="#000000";
				self.ctx.fillText(~~(o2.configuration[i].red)+", "+~~(o2.configuration[i].green), start.x+3, start.y+13);			
				self.ctx.restore();
				start.x+=box.w;
			}
			self.ctx.restore();
			
			start.x = index*box.w;
			start.y = 0;
			
			// Animiraj prenos drugega dela gena
			var c = 0;
			var x2 = index*box.w;
			var f2 = setInterval(function(){
				self.ctx_anim.clearRect(0, 0, 1024, 768)
				self.ctx_anim.save();
				self.ctx_anim.fillStyle = "rgba(127, 227, 127, 0.5)";
				for( var i=index; i<intersections.length; i++)
				{
					self.ctx_anim.fillRect(start.x, start.y, box.w, box.h)
					self.ctx_anim.save();
					self.ctx_anim.fillStyle="#000000";
					self.ctx_anim.fillText(~~(o2.configuration[i].red)+", "+~~(o2.configuration[i].green), start.x+3, start.y+13);			
					self.ctx_anim.restore();
					start.x+=box.w;
				}
				
				start.x=x2+intersections.length*box.w+50;
				for( var i=index; i<intersections.length; i++)
				{
					self.ctx_anim.fillRect(start.x, start.y, box.w, box.h)
					self.ctx_anim.save();
					self.ctx_anim.fillStyle="#000000";
					self.ctx_anim.fillText(~~(o1.configuration[i].red)+", "+~~(o2.configuration[i].green), start.x+3, start.y+13);			
					self.ctx_anim.restore();
					start.x+=box.w;
				}
				
				if( start.y == end)
				{
					clearInterval(f2);
					self.ctx_anim.clearRect(0,0,1024,768);
					self.ctx.save();
					self.ctx.fillStyle = "rgba(127, 227, 127, 0.5)";
					start.x = index*box.w;
					for( var i=index; i<intersections.length; i++)
					{
						self.ctx.fillRect(start.x, start.y, box.w, box.h)
						self.ctx.save();
						self.ctx.fillStyle="#000000";
						self.ctx.fillText(~~(o2.configuration[i].red)+", "+~~(o2.configuration[i].green), start.x+3, start.y+13);			
						self.ctx.restore();
						start.x+=box.w;
					}
					
					start.x=index*box.w+intersections.length*box.w+50;
					for( var i=index; i<intersections.length; i++)
					{
						self.ctx.fillRect(start.x, start.y, box.w, box.h)
						self.ctx.save();
						self.ctx.fillStyle="#000000";
						self.ctx.fillText(~~(o1.configuration[i].red)+", "+~~(o1.configuration[i].green), start.x+3, start.y+13);			
						self.ctx.restore();
						start.x+=box.w;
					}
					
					self.ctx.restore();
				}
				else
				{
					c+=4.5;
					start.x = c+index*box.w
					x2-=4.5;
					start.y++;
					self.ctx_anim.restore();
				}

			}, 20)

		}
		else
		{
			start.x=0;
			start.y++;
			self.ctx_anim.restore()
		}
		

	}, 20)
}

Animation.prototype.animate_tournament_selection = function()
{
	ctx.clearRect(0, 0, 1024, 768)
}

Animation.prototype.animate_configuration = function(cars, configuration)
{
	var context = document.getElementById(canvasID).getContext("2d");
	var total_loop = 0;
	var running_time = 0;
	var conf = configuration;
	var startTime = new Date();
	var c = 0;
	setInterval(function()
	{
		/*if( cars_reached_dest(cars) )
		{
			conf = population[best_confs[c]];
			c++;
		}*/
		context.clearRect(0, 0, 1024, 800);
		conf.draw(context, running_time);
		conf.update(context, running_time);
//		semaforji.draw(context, running_time);
//		semaforji.update(context, running_time);
		for( var i in cars)
		{
			var car = cars[i];
			car.draw(context)
			car.update(startTime, conf);
		}
		
		for( var i in cars_to_remove )
		{
			cars.splice(cars.indexOf(cars_to_remove[i]), 1);
			cars_to_remove.splice(0,1);
		}
		running_time += ANIM_SPEED/FPS;
	}, 10)
	
}

/*Animation.prototype.foo = function(start, end, self, fill, counter){
	
	var interval = setInterval(function(){
		self.ctx_anim.clearRect(0,0,1024,768)
		self.ctx_anim.save();
		self.ctx_anim.fillStyle=fill;
		for( var i=0; i<index; i++)
		{
			self.ctx_anim.fillRect(start.x, start.y, box.w, box.h)
			start.x+=box.w;
		}
	
		start.x=intersections.length*box.w+50;
		for( var i=0; i<index; i++)
		{
			self.ctx_anim.fillRect(start.x, start.y, box.w, box.h)
			start.x+=box.w;
		}
	
		if( start.y == end)
		{
			clearInterval(interval);
			self.ctx_anim.clearRect(0,0, 1024, 768);
			self.ctx.save();
			self.ctx.fillStyle = "rgba(127,127,227, 0.5)";
			start.x = 0;
			for( var i=0; i<index; i++)
			{
				self.ctx.fillRect(start.x, start.y, box.w, box.h)
				start.x+=box.w;
			}
			start.x=intersections.length*box.w+50;
			for( var i=0; i<index; i++)
			{
				self.ctx.fillRect(start.x, start.y, box.w, box.h)
				start.x+=box.w;
			}
			self.ctx.restore();
			
			if( counter < 2 )
			{
				start.x = index*box.w;
				start.y = 0;
			}
			
			if( counter < 4)
			{
				foo({x:0, y: 0}, end, self, fill, counter+1)
			}
		}
	}
}*/
		