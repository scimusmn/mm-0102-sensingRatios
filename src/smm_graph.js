include(["src/pointStack.js"],function () {
	console.log("graph");
	function param(){
		this.x = {
			min:0,
			max:0,
			divs:10,
			flip:false
		}
		this.y = {
			min:0,
			max:0,
			divs:10,
			flip:false
		}
	}

	var smm_Graph = inheritFrom(HTMLCanvasElement,function() {
		var self =this;
		//var ctx = null;

		// Overlay modes
		this.OVERLAY_STAIRS = 0;
		this.OVERLAY_RATIOS = 1;
		this.OVERLAY_OCTAVES = 2;
		this.OVERLAY_CIRCLE = 3;
		this.OVERLAY_INTERACTIVE_RATIOS = 4;

		// Default to stairs overlay
		this.currentOverlayMode = this.OVERLAY_STAIRS;

		// Callback to export tooltip data.
		this.tipCallback = {};

		this.points = null;

		this.fade = false;

		this.newPoint = {
			x:{
				val:0,
				new:false
			},
			y:{
				val:0,
				new:false
			}
		}

		this.mouse = {x:0,y:0};

		this.range = new param();

		this.resize= function (nx,ny,nw,nh) {
			this.left=nx;
			this.top=ny;
			this.width=nw;
			this.height=nh;
		}

		this.setNumDivs = function(xDivs,yDivs){
			this.range.x.divs=xDivs;
			this.range.y.divs=yDivs;
		}

		this.setRange = function (xMin,xMax,yMin,yMax) {
			this.range.x.min=xMin;
			this.range.x.max=xMax;
			this.range.y.min=yMin;
			this.range.y.max=yMax;
		};

		this.convert = function (val,which) {
			return map(val,0,1,this.range[which].min,this.range[which].max);
		}

		this.onNewPoint = function () {
		}

		this.addPoint = function (pnt) {
			if(this.range.x.flip) pnt.x=1-pnt.x;
			if(this.range.y.flip) pnt.y=1-pnt.y;
			this.points.addPoint(pnt);
			this.onNewPoint();
		};

		this.newValue = function (val,which) {
			//this.points.addPoint(pnt);
			this.newPoint[which].val = val;
			this.newPoint[which].new = true;
			if(this.newPoint.x.new&&this.newPoint.y.new){
				this.addPoint({x:this.newPoint.x.val,y:this.newPoint.y.val});
			}
		};

		this.lastPoint = function(){
			if(this.points.length) return {x:this.convert(this.points.last().x,"x"),y:this.convert(this.points.last().y,"y")};
		}

		this.lastPoint = function(){
			if(this.points.length) return {x:this.convert(this.points.last().x,"x"),y:this.convert(this.points.last().y,"y")};
		}

		this.drawTrace = function () {
			var ctx = this.getContext("2d");
			ctx.lineWidth=this.lineWidth;
			ctx.strokeStyle = this.lineColor;
			var self =this;
			if(this.points.length>2){
				var xc = this.width*(this.points[0].x + this.points[1].x) / 2;
				var yc = this.height*(this.points[0].y + this.points[1].y) / 2;

				ctx.beginPath();
				ctx.moveTo(xc, yc);
				for (var i = 0; i < self.points.length - 1; i ++){
					if(this.fade) ctx.globalAlpha = i/self.points.length;
					xc = this.width*(self.points[i].x + self.points[i + 1].x) / 2;
					yc = this.height*(self.points[i].y + self.points[i + 1].y) / 2;
					ctx.quadraticCurveTo(self.points[i].x*this.width, self.points[i].y*this.height, xc, yc);

					//tn
					ctx.strokeStyle = self.points[i].color;

					//ctx.stroke();
					if(this.fade){
						ctx.stroke();
						ctx.closePath();
						ctx.beginPath();
						ctx.moveTo(xc,yc);
					}
				}
				ctx.stroke();
				ctx.closePath();

			}

		};

		/* ------------- */
		/* Grid Overlays */
		/* ------------- */
		this.setOverlayMode = function(mode, tipCallback) {
			this.currentOverlayMode = mode;
			this.tipCallback = tipCallback;
		}

		this.drawOverlay = function() {

			var ctx = this.getContext("2d");
			ctx.lineWidth=this.overlayWidth;
			ctx.strokeStyle = this.overlayColor;

			switch (this.currentOverlayMode) {
				case this.OVERLAY_STAIRS:
					this.drawStairs();
				break;
				case this.OVERLAY_RATIOS:
					this.drawRatios();
				break;
				case this.OVERLAY_OCTAVES:
					this.drawOctaves();
				break;
				case this.OVERLAY_CIRCLE:
					this.drawCircle();
				break;
				case this.OVERLAY_INTERACTIVE_RATIOS:
					this.drawInteractiveRatios();
				break;
				default:
					//Don't draw an overlay.
			}

		}

		this.drawStairs = function(){

			var cellWidth = this.width/this.range.x.divs;
			var stepX = 0;
			var stepY = this.height;

			ctx.beginPath();
			ctx.moveTo(stepX, stepY);

			// Draw staircase
			for(var i=0; i<this.range.x.divs; i++){

				ctx.lineTo(stepX, stepY);

				stepX += cellWidth;

				ctx.lineTo(stepX, stepY);

				stepY -= cellWidth;

				ctx.lineTo(stepX, stepY);

			}

			ctx.stroke();

		};

		this.drawRatios = function(){

			this.drawLineByRatio(1/2);
			this.drawLineByRatio(2/1);

		};

		this.drawOctaves = function(){

			var cellHeight = this.height/this.range.y.divs;

			// Octave line
			ctx.beginPath();
			ctx.moveTo(0, this.height - cellHeight);
			ctx.lineTo(this.width, 0 - cellHeight);
			ctx.stroke();

			// Unison Line
			ctx.beginPath();
			ctx.moveTo(0, this.height);
			ctx.lineTo(this.width, 0);
			ctx.stroke();

		};

		this.drawCircle = function(){

			var cellWidth = this.width/this.range.x.divs;

			// Frame
			ctx.beginPath();
			ctx.moveTo(cellWidth, this.height - cellWidth);
			ctx.lineTo(cellWidth, cellWidth);
			ctx.lineTo(this.width - cellWidth, cellWidth);
			ctx.lineTo(this.width - cellWidth, this.height - cellWidth);
			ctx.closePath();
			ctx.stroke();

			// Circle
			ctx.beginPath();
			ctx.arc(this.width/2, this.height/2, this.width/2 - (cellWidth), 0, 2*Math.PI);
			ctx.stroke();

		};

		this.drawInteractiveRatios = function(){

			// Get nearest X and Y coordinate on grid
			var gridX = Math.round(map(this.mouse.x, 0, 1, 0, this.range.x.divs));
			var gridY = Math.round(map(this.mouse.y, 1, 0, 0, this.range.y.divs));

			// Find closest 'whole' ratio
			var ratio = gridX / gridY;

			var cellWidth = this.width/this.range.x.divs;
			var snappedX = gridX*cellWidth;
			var snappedY = this.height - gridY * cellWidth;

			var reduced = reduce(gridX, gridY);

			// console.log('current ratio:', gridX +':'+ gridY);
			var tipTxt = reduced[0] +':'+ reduced[1] + ' ratio';
			this.tipCallback({x:snappedX, y:snappedY, text:tipTxt});
			this.drawLineByRatio(ratio);

			// Draw snapped coordinate
			ctx.fillStyle = 'rgba(255,255,255,1)';
			ctx.strokeStyle = 'rgba(0,0,0,0.3)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(snappedX, snappedY, 5, 0,2*Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();

		};

		this.drawLineByRatio = function(ratio){

			var endX = Math.max(0, this.width * ratio);
			var endY = Math.min(0, this.height * ratio);

			ctx.beginPath();
			ctx.moveTo(0, this.height);
			ctx.lineTo(endX, endY);
			ctx.stroke();

		};
		/* End Grid Overlays */


		this.drawGrid = function(){
			var ctx = this.getContext("2d");
			ctx.lineWidth=this.gridWidth;
			ctx.strokeStyle = this.gridColor;
			for(var i=0; i<this.range.x.divs; i++){
				ctx.beginPath();
				ctx.moveTo(i*this.width/this.range.x.divs,0);
				ctx.lineTo(i*this.width/this.range.x.divs,this.height);
				ctx.closePath();
				ctx.stroke();
			}
			for(var i=0; i<this.range.y.divs; i++){
				ctx.beginPath();
				ctx.moveTo(0,i*this.height/this.range.y.divs);
				ctx.lineTo(this.width,i*this.height/this.range.y.divs);
				ctx.closePath();
				ctx.stroke();
			}

		};

		this.customBGDraw = function(){

		}

		this.customFGDraw = function(){
			ctx.fillStyle = "#000";
			ctx.beginPath();
			ctx.arc(this.mouse.x*this.width,this.mouse.y*this.height,10,0,2*Math.PI);
			ctx.fill();
			ctx.closePath();
		}

		this.draw = function () {
			//console.log(this.width);
			var ctx = this.getContext("2d");
			ctx.beginPath();
			ctx.fillStyle = "#fff";
			ctx.rect(0,0,this.width,this.height);
			ctx.closePath();
			ctx.fill();

			this.customBGDraw();

			this.drawTrace(ctx);

			this.drawGrid(ctx,18,10);

			this.drawOverlay();

			this.customFGDraw();
		};

		this.clear = function(){
			this.points.length=0;
		};

		this.createdCallback = function () {
			//this.shadow = this.createShadowRoot();
			//this.canvas = document.createElement('canvas');
			//this.setup(this);
			this.range = new param();

			var xR = {min:_S("|>xMin",this),max:_S("|>xMax",this)};
			var yR = {min:_S("|>yMin",this),max:_S("|>yMax",this)};
			this.setRange(xR.min,xR.max,yR.min,yR.max);
			this.setNumDivs(_S("|>xDiv",this),_S("|>yDiv",this));
			var flip = "";
			if(flip = _S("|>flip",this)){
				this.range.x.flip = ~_S("|>flip",this).indexOf("x");
				this.range.y.flip = ~_S("|>flip",this).indexOf("y");
			}

			numPoints = _S("|>numPoints",this);


			ctx = this.getContext("2d");
			this.points = new pointStack((numPoints)?parseInt(numPoints):500);

			this.labelFont = "lighter 2vh sans-serif";
			this.fontColor = "#000";
			this.lineWidth = 3;
			this.lineColor = "#000";
			this.gridWidth = 1;
			this.gridColor = "rgba(0,0,0,.1)";
			this.overlayWidth = 5;
			this.overlayColor = "rgba(255,0,0,.3)";
			this.refreshRate = 30;

			this.mouse = {x:0,y:0};
			this.width = this.clientWidth;
			this.height = this.clientHeight;

			/*this.addEventListener('mousemove', function(evt) {
				var rect = this.getBoundingClientRect();
				this.mouse = {
					x: (evt.clientX - rect.left)/this.width,
					y: (evt.clientY - rect.top)/this.height
				};
		  }, false);*/
		}
	});

	document.registerElement('smm-graph', {prototype: smm_Graph.prototype, extends: 'canvas'});
	window.smmGraph = smm_Graph;
});
