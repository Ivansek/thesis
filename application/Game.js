var Game = function(canvasID, konfiguracija)
{
	this.draw = function()
	{	
		this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);	
		for(var i=0; i<this.entities.length; i++)
		{
			this.entities[i].draw(konfiguracija_semaforjev);
		}
	}

	this.update = function(startTime)
	{	
		for(var i=0; i<this.entities.length; i++)
		{
			this.entities[i].update(startTime);
		}
	}

	this.addEntity = function(obj)
	{
		this.entities.push(obj);
	}

	this.animate = function() 
	{
	
		var self = this;
		var startTime = new Date().getTime();
	    setInterval(function() 
        {
			if( !running )
			{
	        	self.draw();
    	    	self.update(startTime, konfiguracija_semaforjev);
			}

          // Update fps counter
//          stats.update();
        }, 1000 / Game.fps);
	}
	
	this.stop = function()
	{
		running = true;
	}
	
	function generateCars(nodes, count)
	{
		var cars = [];
		for( var i =0; i<count; i++)
		{
			var delay = ~~(Math.random()*60);
			var startNode = nodes.get(~~(Math.random()*nodes.size()));
			var destNode = nodes.get(~~(Math.random()*nodes.size()));
			cars.push(new Car(canvasID, konfiguracija, nodes, delay, startNode, destNode));
			self.addEntity(cars[i]);
		}
		
		return cars;
	}
	
	function init()
	{
		var nodes = new Nodes(level);
		var cars = generateCars(nodes, 20);
		
		return cars;
	}
	
	this.getCars = function()
	{
		return cars;
	}
	
	var running = false;
	this.fps = 50;	
	this.canvasWidth = document.getElementById(canvasID).width;
	this.canvasHeight = document.getElementById(canvasID).height;
	this.context = document.getElementById(canvasID).getContext("2d");
	this.entities = [];
	var self = this;	
	var cars = init();
}