var Waypoint = function(waypoint, waypoints)
{
	this.x = waypoint.x;
	this.y = waypoint.y;
	this.allWaypoints = waypoints;

	this.findWaypointIndex = function(x, y)
	{
		for( var i=0; i < this.allWaypoints.length; i++)
		{
			var wp = this.allWaypoints[i];
			
			if( x == wp.x && y == wp.y )
			{
				return i;
			}
		}
		return -1;
	}
	
	this.findWaypoint = function(x, y, index, direction)
	{
		if( direction >= 0)
		{
			for( var i=++index; i < this.allWaypoints.length; i++)
			{
				
				var wp = this.allWaypoints[i];
				
				// right point
				if( x == null && y == wp.y)
				{
					return wp;
				}
				// up point
				else if( y == null && x == wp.x)
				{
					return wp;
				}
				// current point
				if( x == wp.x && y == wp.y )
				{
					return wp;
				}
			}
		}
		else
		{
			for( var i = --index; i > 0; i--)
			{
				var wp = this.allWaypoints[i];
				
				// left point
				if( x == null && y == wp.y )
				{
					return wp;
				}
				// down point
				else if( y == null && x == wp.x )
				{
					return wp;
				}
				
				if( x == wp.x && y == wp.y )
				{
					return wp;
				}
			}
		}
		return null;
	}
	
	this.neighbours = function()
	{
		var n = 0;
		var wpIndex = this.findWaypointIndex(this.x, this.y);
		var wp = this.allWaypoints[wpIndex];
		console.log("current Wp: ["+wp.x+", "+wp.y+"]");
		if( wpIndex > -1)
		{
			var nextWp = this.findWaypoint(null, wp.y, wpIndex, 1);
			var prevWp = this.findWaypoint(null, wp.y, wpIndex, -1);
			var downWp = this.findWaypoint(wp.x, null, wpIndex, 1);
			var upWp = this.findWaypoint(wp.x, null, wpIndex, -1);
			
			if( nextWp != null )
			{
				console.log("nextWp: ["+nextWp.x+", "+nextWp.y+"]");
				n++;
			}

			if( prevWp != null )
			{
				console.log("prevWp: ["+prevWp.x+", "+prevWp.y+"]");
				n++;
			}

			if( upWp != null )
			{
				console.log("upWp: ["+upWp.x+", "+upWp.y+"]");
				n++;
			}

			if( downWp != null )
			{
				console.log("downWp: ["+downWp.x+", "+downWp.y+"]");
				n++;
			}
		}
		return n;
	}

	
	
	
}

