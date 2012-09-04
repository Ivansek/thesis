function Random(){
	this.used_numbers = [];
} 

Random.prototype.rand = function(min, max)
{
	var n = min + Math.round(Math.random()*((max-1)-min));
	return n;
}

Random.prototype.unique_random = function(min, max)
{
	var n = 0;
	do
	{
		if( this.used_numbers.length == (max-min) )
		{
			console.log("all random numbers between ["+min+", "+max+"] are used");
			return null;
		}
		n = this.rand(min, max);
	}
	while( this.used_numbers.indexOf(n)  > -1);
	this.used_numbers.push(n);
	return n;
}

Random.prototype.reset = function()
{
	this.used_numbers.length = 0;
}