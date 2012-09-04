function Configuration(seq_number, for_anim, calculate_f)
{
	this.configuration = this.init(for_anim);
	this.n = seq_number;
	if( calculate_f === undefined || calculate_f === true)
	{
		this.fitness = this.calculate_fitness();
	}
}

Configuration.prototype.init = function( for_anim)
{
	var configuration = [];
	for( var i=0; i<intersections.length; i++)
	{
		configuration.push(new Semaphore(intersections[i], for_anim))
	}
	return configuration;
}

Configuration.prototype.calculate_fitness = function()
{
	/*var fitness = 0;
	for( var i in cars )
	{
		var car = cars[i];
		fitness += car.fitness(this.configuration);
	}
	
	return fitness;*/
	
	var tmp_ANIM_SPEED = ANIM_SPEED;
	var tmp_SEMAPHORE_FACTOR = SEMAPHORE_FACTOR
	var tmp_MOVE_STEP = MOVE_STEP;
	
	ANIM_SPEED = 20;
	SEMAPHORE_FACTOR = SEMAPHORE_SPEED*ANIM_SPEED
	MOVE_STEP = ~~((CAR_SPEED*ANIM_SPEED)/FPS);
	
	var running_time = 0;
	var start_time = new Date();
	
	
	while( cars.length > 0 )
	{
		//ctx.clearRect(0, 0, 1024, 800);
		this.update(ctx, running_time)
		for(var i in cars )
		{
			var car = cars[i];
			car.delay = 0;
			car.update(start_time, this)
		} 
		
		for( var i in cars_to_remove )
		{
			var index = cars.indexOf(cars_to_remove[i]);
			if( index > -1 )
			{
				cars.splice(index, 1);
			}
		}
		cars_to_remove.splice(0, cars_to_remove.length);
		running_time++;
	}
//	var end_time = new Date();
	cars = copy_cars(tmp_cars)

	var meters_per_hour = CAR_SPEED * 1000;
	var meters_per_minute = parseFloat((meters_per_hour/60).toFixed(2));
	var meters_per_second = parseFloat((meters_per_minute/60).toFixed(2));

	var traveled_distance = running_time * MOVE_STEP;
	var fitness = parseFloat((traveled_distance/meters_per_second).toFixed(2));
		
	ANIM_SPEED = tmp_ANIM_SPEED;
	SEMAPHORE_FACTOR = tmp_SEMAPHORE_FACTOR;
	MOVE_STEP = tmp_MOVE_STEP;
	//console.log("Za "+this.n+" sem potreboval "+(end_time.getTime()-start_time.getTime())+" ms za izracun fintessa");
	//console.log(this.to_string()+", FITNESS: "+fitness);
	return fitness;
}

Configuration.prototype.to_string = function()
{
	var log = "";
	for( var j in this.configuration)
	{
		log+= "("+this.configuration[j].red+", "+this.configuration[j].green+"), ";
	}
	return log;
}

Configuration.prototype.draw = function(context, runningTime)
{
	for( var i in this.configuration)
	{
		var semaphore = this.configuration[i];
		
		semaphore.draw(context, runningTime);
	}
}

Configuration.prototype.update = function(context, runningTime)
{
	for( var i in this.configuration)
	{
		var semaphore = this.configuration[i];
		semaphore.update(context, runningTime);
	}	
}

Configuration.prototype.get = function(s_name)
{
	for( var i in this.configuration)
	{
		var semaphore = this.configuration[i];
		if( semaphore.name == s_name)
		{
			return semaphore;
		}
	}
}