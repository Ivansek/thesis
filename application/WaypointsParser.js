var WaypointsParser = function(waypoints){
	for( var i in waypoints )
	{
		var wp = waypoints[i];
		if( waypointExists(wp) )
	}
	
	function waypointExists(wp)
	{
		for( var i in waypoints )
		{
			if( waypoints[i].x == wp.x && waypoints[i].y == wp.y )
			{
				waypoints.splice(i, i);
			}
		}
	}
}