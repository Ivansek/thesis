function Population(size, crossover_rate, mutation_rate)
{
	this.population = this.init(size);
	this.m_rate = mutation_rate;
	this.c_rate = crossover_rate;
}

Population.prototype.init = function(size)
{
	var population = [];
	var start_time = new Date();
	for( var i=0; i<size; i++)
	{
		population.push(new Configuration(i, false));
	}
	var end_time = new Date();
	//console.log("Za izracun fitnessa populacije sem potreboval: "+(end_time.getTime()-start_time.getTime())+" ms");
	return population;
}
var pop = 0;
Population.prototype.build_new_population = function(method)
{
	var start_time = new Date();
	if( method == "one_tournament")
	{
		this.one_tournament(4, intersections);
	}
	else if( method == "roulette_wheel")
	{
		this.roulette_wheel();
	}
	else if( method = "stohastic_universal_sampling")
	{
		this.stohastic_universal_sampling();
	}
	var end_time = new Date();
	//console.log("["+pop+"] Za izracun fitnessa populacije sem potreboval: "+(end_time.getTime()-start_time.getTime())+" ms");
	pop++;
}

Population.prototype.stohastic_universal_sampling = function()
{
	var selection_size = this.population.length*this.c_rate;
	var total_fitness = this.total_fitness();
	var selection = [];
	var new_population = [];
	var start_offset = Math.random();
	var cumulative_exp = 0;
	var index = 0;
	var random_generator = new Random()
	for( var i in this.population )
	{
		cumulative_exp += (this.population[i].fitness / total_fitness) * selection_size
		
		while(cumulative_exp > start_offset + index)
		{
			selection.push(this.population[i])
			index++;
		}
	}
	
	do{
		
		var r1 = ~~(Math.random()*selection.length);
		var r2 = ~~(Math.random(123456)*selection.length);
		
		var offsprings = this.crossover(selection[r1], selection[r2]);
		if( offsprings[0].fitness > offsprings[1].fitness )
		{
			new_population.push(offsprings[1]);
		}
		else
		{
			new_population.push(offsprings[0]);
		}
		
	}
	while( new_population.length < ~~(this.population.length*this.c_rate))
	
	this.population.sort(this.sort_by_fitness);
	// ELITIZEM
	for( var i=0; i<~~(this.population.length - (this.population.length*(this.c_rate+this.m_rate))); i++ )
	{
		new_population.push(this.population[i]);
	}
	
	//Mutacija brez vracanja
	random_generator.reset();
	var n_mutate = ~~(this.population.length*this.m_rate);
	for( var i=0; i<n_mutate; i++)
	{
		var r = random_generator.unique_random(0, n_mutate);
		var offspring = this.mutate(this.population[r]);
		offspring.calculate_fitness();
		new_population.push(offspring);
	}
	
	this.population = new_population;	
}

Population.prototype.roulette_wheel = function()
{
	var total_fitness = this.total_fitness();
	var new_population = [];
	var random_generator= new Random();
	// prevedemo minimzacijo na maximizacijo, tako da tisti z manjsim fitnessom dobi vecjo vrednost, tisti z vecjim pa manjso vrednost
	// To naredimo samo zato da lahko uporabimo metodo ruletnega kolesa. Potem moramo vrednosti zamenjati nazaj.
	this.population.sort(this.sort_by_fitness);
	for( var i=0, j=this.population.length-1; i<~~(this.population.length/2); i++, j--)
	{
		var tmp = this.population[i].fitness;
		this.population[i].fitness = this.population[j].fitness;
		this.population[j].fitness = tmp;
	}
	
	// Normalize fitness
	var sum = 0;
	for( var i in this.population)
	{
		this.population[i].prob = Math.round((this.population[i].fitness/total_fitness)*100)/100;
		sum += parseFloat(this.population[i].prob.toFixed(2));
	}
	
	// Popravimo
	if( parseFloat(sum.toFixed(2)) < 1)
	{
		for( var i=0; i<parseFloat(((1-sum)*100).toFixed(2)); i++)
		{
			this.population[i].prob+=0.01;
		}
	}
	else if ( parseFloat(sum.toFixed(2)) > 1 )
	{
		for( var i=0; i<parseFloat(((sum-1)*100).toFixed(2)); i++)
		{
			this.population[i].prob-=0.01;
		}
	}
	
	// Calculate accumulated normalized fitness
	var sum_of_probs = 0;
	for( var i in this.population )
	{	
		var prob_tmp = this.population[i].prob;
		this.population[i].prob = parseFloat((prob_tmp+sum_of_probs).toFixed(2));
		sum_of_probs += parseFloat(prob_tmp.toFixed(2));
	}
	
	var offsprings_coll = [];
	// ruletno kolo
	do
	{
		var spin_num1 = parseFloat(Math.random(1234567).toFixed(2));
		var p1;
		for( var i=0; i<this.population.length; i++)
		{
			if( this.population[i].prob >= spin_num1)
			{
				p1 = this.population[i];
				break;
			}
		}
		
		var spin_num2 = parseFloat(Math.random(1234).toFixed(2));
		var p2;
		for( var i=0; i<this.population.length; i++)
		{
			if( this.population[i].prob >= spin_num2)
			{
				p2 = this.population[i];
				break;
			}
		}
		
		if( p1 === undefined )
		{
			console.log("P1 JE PRAZEN. RANDOM NUMBER JE "+spin_num1);
			p1 = this.population[0];
		}
		
		if( p2 === undefined)
		{
			console.log("P2 JE PRAZEN. RANDOM NUMBER JE "+spin_num2);
			p2 = this.population[0];
		}
		
		var offsprings = this.crossover(p1, p2);
		
		if( offsprings[0].fitness > offsprings[1].fitness )
		{
			offsprings_coll.push(offsprings[1])
			new_population.push(offsprings[1]);
		}
		else
		{
			offsprings_coll.push(offsprings[0]);
			new_population.push(offsprings[0]);
		}
	}
	while(new_population.length < ~~(this.population.length*(this.c_rate)))
	


	//this.population.sort(this.sort_by_fitness);
	for( var i=0, j=this.population.length-1; i<~~(this.population.length/2); i++, j--)
	{
		var tmp = this.population[i].fitness;
		this.population[i].fitness = this.population[j].fitness;
		this.population[j].fitness = tmp;
	}
	
	this.population.sort(this.sort_by_fitness);	
	// ELITIZEM
	for( var i=0; i<~~(this.population.length - (this.population.length*(this.c_rate+this.m_rate))); i++ )
	{
		new_population.push(this.population[i]);
	}
	
		/*logger("PRED MUTACIJO")
	
		for( var x in new_population )	
		{
			logger(new_population[x].n+" : "+new_population[x].to_string()+" "+new_population[x].fitness);
		}*/
	
	//Mutacija brez vracanja
	random_generator.reset();
	var n_mutate = ~~(this.population.length*this.m_rate);
	for( var i=0; i<n_mutate; i++)
	{
		var r = random_generator.unique_random(0, n_mutate);
		var offspring = this.mutate(this.population[r]);
		offspring.calculate_fitness();
		new_population.push(offspring);
	}
	
	/*logger("PO MUTACIJI")
	
	for( var x in new_population )	
	{
		logger(new_population[x].n+" : "+new_population[x].to_string()+" "+new_population[x].fitness);
	}*/
	
	this.population = new_population;
}

Population.prototype.mutate = function(configuration)
{
	/*logger("###############");
	logger("#   MUTATE    #");
	logger("###############");
	logger("");*/
	var random_generator = new Random();
	var mutate_index = random_generator.rand(0, configuration.configuration.length);
//			logger("INDEX: "+mutate_index);
	var conf = new Configuration(configuration.n, false, false)
	for( var i in configuration.configuration)
	{
		var sem = configuration.configuration[i];
		conf.configuration[i] = sem;
	}
	var old = conf.configuration[mutate_index];
	conf.configuration[mutate_index] = new Semaphore(old.name);
	conf.fitness = conf.calculate_fitness();
	return conf;
}

Population.prototype.crossover = function(conf1, conf2, intersections)
{
	var random_generator = new Random();
	var crossover_index = random_generator.rand(~~(conf1.configuration.length/2)-1,conf1.configuration.length-2);
	/*logger("Crossover index: "+crossover_index);
	logger("################");
	logger("#   PARENTS    #");
	logger("################");
	logger("["+conf1.to_string()+"], "+conf1.fitness);
	logger("["+conf2.to_string()+"], "+conf2.fitness);*/
	var offspring1 = new Configuration( conf1.n, false, false);
	var offspring2 = new Configuration( conf2.n, false, false)
	
	for( var i=0; i<crossover_index; i++)
	{
		offspring1.configuration[i] = conf1.configuration[i]
		offspring2.configuration[i] = conf2.configuration[i];
	}

	for( var i = crossover_index; i<conf1.configuration.length; i++)
	{
		offspring1.configuration[i] = conf2.configuration[i];
		offspring2.configuration[i] = conf1.configuration[i];
	}
	
	offspring1.fitness = offspring1.calculate_fitness(cars);
	offspring2.fitness = offspring2.calculate_fitness(cars);
	/*logger("###############");
	logger("#   DESCENTS  #");
	logger("###############");
	logger("["+offspring1.to_string()+"], "+offspring1.fitness);
	logger("["+offspring2.to_string()+"], "+offspring2.fitness);*/
	//this.animation.animate_crossover(crossover_index, conf1, conf2);
	return [offspring1, offspring2];
}

Population.prototype.one_tournament = function(k, intersections)
{
	/*logger("#####################");
	logger("# POPULATION BEFORE #");
	logger("#####################");

	for( var x in this.population )	
	{
		logger(this.population[x].n+" : "+this.population[x].to_string()+", "+this.population[x].fitness);
	}*/
	//logger("start of tournament selection")
	var num_tournaments = Math.ceil(this.population.length/k);
	var tournaments = [];
	var random_generator = new Random();
	var tmp_k = k;
	var offsprings_coll = [];

	for( var i=0; i<num_tournaments; i++ )
	{

		// how large is last tournament?
		if( i == num_tournaments-1 && this.population.length%k > 0)
		{
			k = this.population.length%k;
		}

		tournaments.push([]);
		
		for( var j=0; j<k; j++)
		{
			var rand = random_generator.unique_random(0, this.population.length);//Math.random()*this.population.length); 
			tournaments[i].push(this.population[rand]);
		}
		tournaments[i].sort(this.sort_by_fitness);
		
		/*logger("#############");
		logger("# TOURNAMENT "+(i+1)+"#")
		logger("##############");
		for( var x in tournaments[i] )	
		{
			logger(tournaments[i][x].n+" : "+tournaments[i][x].to_string()+" "+tournaments[i][x].fitness);
		}*/
		
		if( tournaments[i].length > 2 )
		{
			var first_best = tournaments[i][0];
			var second_best = tournaments[i][1];
			var offsprings = this.crossover(first_best, second_best, intersections);
			
//		offsprings[0].n = tournaments[i][0].n;
//		offsprings[1].n = tournaments[i][1].n;
		
			var worst1 = tournaments[i][tournaments[i].length-2];
			var worst2 = tournaments[i][tournaments[i].length-1];
			
			offsprings[0].n = worst1.n;
			offsprings_coll.push(worst1.n);
			
			if( offsprings[0].fitness < worst1.fitness )
			{
				tournaments[i][tournaments[i].length-2] = offsprings[0];
			}

			if( worst2 !== undefined )
			{
				offsprings[1].n = worst2.n;
				offsprings_coll.push(worst2.n);
				if( offsprings[1].fitness < worst2.fitness )
				{
					tournaments[i][tournaments[i].length-1] = offsprings[1];
				}
			}
		}

		/*logger("");
		logger("#############################");
		logger("# TOURNAMENT AFTER CROSSOVER "+(i+1)+"#")
		logger("##############################");
		for( var x in tournaments[i] )	
		{
			logger(tournaments[i][x].n+" : "+tournaments[i][x].to_string()+" "+tournaments[i][x].fitness);
		}*/
	}
	
	k = tmp_k;
	// Zgradi novo populacijo iz turnirjev
	for( var i in tournaments)
	{
		for( var j=0; j<k; j++)
		{
			//console.log("i = "+i+", j = "+j+", (i*k)+j = ("+i+"*"+k+")+"+j+" = "+((i*k)+j));
			var index = (i*k)+j;
			if( tournaments[i][j] !== undefined )
			{
				this.population[index] = tournaments[i][j];
			}
		}
	}


	
	/*logger("#####################");
	logger("# POPULATION AFTER #");
	logger("#####################");
	
	for( var x in this.population )	
	{
		logger(this.population[x].n+" : "+this.population[x].to_string()+", "+this.population[x].fitness);
	}*/

	this.population.sort(this.sort_by_fitness);
	
	// which indexes should be mutated?
	var n_mutate = this.population.length*this.m_rate;
	random_generator.reset();
	for( var i=0; i<n_mutate; i++)
	{
		this.population[this.population.length-i-1] = this.mutate(this.population[i]);
		/*do
		{
			var r = random_generator.unique_random(0, this.population.length);
		}
		while(offsprings_coll.indexOf(r) == -1);
		
		var individual = this.population[r];
		var mutant = this.mutate(individual);
		//mutant.n = this.population[this.population.length-i-1].n;
		this.population[r] = mutant;*/
	}

//	this.population.sort(function(a, b){ return a.n - b.n;});

	//logger("end of tournament selection")
	/*logger("#####################");
	logger("# POPULATION AFTER #");
	logger("#####################");
	
	for( var x in this.population )	
	{
		logger(this.population[x].n+" : "+this.population[x].to_string()+", "+this.population[x].fitness);
	}*/
	
}

Population.prototype.total_fitness = function()
{
	var total_fitness = 0;
	for( var i in this.population)
	{
		total_fitness += this.population[i].fitness;
	}
	
	return total_fitness;
}

Population.prototype.sort_by_fitness = function(x,y){
	if(x.fitness > y.fitness)
	{
		return 1;
	}

	if( x.fitness == y.fitness)
	{
		return 0;
	}

	if( x.fitness < y.fitness )
	{
		return -1;
	}
}

Population.prototype.sort_by_prob = function(x,y){
	if(x.prob > y.prob)
	{
		return -1;
	}

	if( x.prob == y.prob)
	{
		return 0;
	}

	if( x.prob < y.prob )
	{
		return 1;
	}
}

Population.prototype.get_best_solution = function()
{
	var best_solution = this.population[0];
	var best_fitness = this.population[0].fitness;
	
	for(var i in this.population)
	{
		if( this.population[i].fitness < best_fitness)
		{
			best_solution = this.population[i];
			best_fitness = best_solution.fitness;
		}
	}
	
	return best_solution;
}