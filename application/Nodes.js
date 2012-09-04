var Nodes = function(level)
{	
	var init = function()
	{
			var nodes = [];
			
			for( var i in level.nodes)
			{
				var n = level.nodes[i];
				var node = new Node(i, n.x, n.y, level.connections[i]);
				//nodes[node.name] = node;
				nodes.push(node);
			}
			
			return nodes;
	}
	
	var nodes = init();
	
	this.getAll = function()
	{
		return nodes;
	}
	
	this.size = function()
	{
		return nodes.length;
	}
	
	this.get = function(index)
	{
		for( var i in nodes )
		{
			if( i == index )
			{
				return nodes[i];
			}
		}
	}
	
	this.get_edge_nodes = function()
	{
		var edge_nodes = [];
		for( var i in nodes)
		{
			var n = nodes[i];
			var e = 0;
			for( var j in n.connections)
			{
				e++;
			}
			
			if( e <= 2)
			{
				edge_nodes.push(n);
			}
		}
		return edge_nodes;
	}
	
	this.getByName = function(search_name)
	{
		for( var i in nodes )
		{
			if( nodes[i].name == search_name )
			{
				return nodes[i];
			}
		}
	}
}