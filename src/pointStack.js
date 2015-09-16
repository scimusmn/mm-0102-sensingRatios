function pointStack(maxPnts){
	var self = this;
	var points = [];
	var bAver=true;
	
	//var averDiff = new aveCont();
	var sampsX = new aveCont();
	var sampsY = new aveCont();
	
	points.changeAveraging = function(num){
		if(num<2) bAver=false;
		else {
			sampsX.changeNumSamps(num);
			sampsY.changeNumSamps(num);
		}
	}
	
	points.addPoint = function(pnt){
		if(points.length){
			if(Math.abs(pnt.x-points.last().x)>.01||Math.abs(pnt.y-points.last().y)>.01){
				if(bAver){
					sampsX.addSample(pnt.x);
					sampsY.addSample(pnt.y);
					points.push({x:sampsX.ave,y:sampsY.ave});
				}
				else points.push(pnt);
				if(points.length>=maxPnts) points.splice(0,1);
			}
		}
		else points.push({x:pnt.x,y:pnt.y});
	}
	
	return points;
}