define( [ "qlik","./d3.v4"],
function ( qlik ,d3) {

	return {
		initialProperties: {
			version: 1.0,
			TargetItems: [],
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 15,
					qHeight: 500
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 1,
					max: 1
				},
				measures: {
					uses: "measures",
					min: 2,
					max: 4,
					items: {
						Textcolor: {
							type: "string",
							ref: "qAttributeExpressions.0.qExpression",
							label: "Value Color",
							//expression: "always",
							component: "expression",
							defaultValue: "black()"
						},
							TextBgcolor: {
							type: "string",
							ref: "qAttributeExpressions.1.qExpression",
							label: "Background Color",
							//expression: "always",
							component: "expression",
							defaultValue: "blue()"
						}
					}
				},
				sorting: {
					uses: "sorting"
				},
				addons: {
					uses: "addons",
					items: {
						dataHandling: {
							uses: "dataHandling"
						}
					}
				},
				settings: {
					uses: "settings",
					items: {
					AxisSettings:{
							label:"Axis Settings",
							items:{
								YAxisTextSize: {
									type: "string",
									ref: "YAxisTextSize",
									label: "Y Axis Text Size",
									defaultValue: "15px"
								},
								YAxisTextFontweight: {
									type: "string",
									ref: "YAxisTextFontweight",
									label: "Y Axis Text Font Weight",
									defaultValue: "200"
								},
								YAxisTextRotate: {
									type: "number",
									ref: "YAxisTextRotate",
									label: "Y Axis Text Rotate",
									defaultValue: 0
								},
								XAxisTextSize: {
									type: "string",
									ref: "XAxisTextSize",
									label: "X Axis Text Size",
									defaultValue: "15px"
								},
								XAxisTextFontweight: {
									type: "string",
									ref: "XAxisTextFontweight",
									label: "X Axis Text Font Weight",
									defaultValue: "200"
								},
								XAxisTextRotate: {
									type: "number",
									ref: "XAxisTextRotate",
									label: "X Axis Text Rotate",
									defaultValue: 0
								}
							}
						},
						Config:{
							label:"Config",
							items:{
								MyText: {
									label:"My text",
									component: "text"
								},
								Barcolor: {
									type: "string",
									ref: "BarColor",
									label: "Bar Color",
									defaultValue: "#16A085,#33435C"
								},
								chart_m_top: {
									type: "number",
									ref: "chart_m_top",
									label: "Chart Margin Top",
									defaultValue: 20
								},
								chart_m_right: {
									type: "number",
									ref: "chart_m_right",
									label: "Chart Margin Right",
									defaultValue: 20
								},
								chart_m_bottom: {
									type: "number",
									ref: "chart_m_bottom",
									label: "Chart Margin Bottom",
									defaultValue: 30
								},
								chart_m_left: {
									type: "number",
									ref: "chart_m_left",
									label: "Chart Margin Left",
									defaultValue: 40
								}
							}
						}
					}
				}
			}
		},
		
		
		
		support : {
			viewData: true,
			snapshot: true,
			export: true,
			exportData : true
		},
		paint: function ($element,layout) {
			//console.log(layout);
			var self = this,
				id= layout.qInfo.qId,
				width = $element.width(),
				height=$element.height(),
				hypercube = layout.qHyperCube.qDataPages[0].qMatrix,
				vMin = 0,
				vMax = (layout.qHyperCube.qMeasureInfo[0].qMin > layout.qHyperCube.qMeasureInfo[1].qMin ? layout.qHyperCube.qMeasureInfo[0].qMin : layout.qHyperCube.qMeasureInfo[1].qMin);
			$element.html( ' <svg id="'+id+'" width="'+width+'" height="'+height+'"></svg>' );
			
			
			var data =[];
			$.each(hypercube,function(i,k){
				//console.log(k,i);
				data.push({
						"Dim": k[0].qText,
						"diff": k[3].qText,
						"growth": k[4].qText,
						"Val3Color": k[3].qAttrExps.qValues[0].qText,
						"Val3BGColor": k[3].qAttrExps.qValues[1].qText,
						"Val4Color": k[4].qAttrExps.qValues[0].qText,
						"Val4BGColor": k[4].qAttrExps.qValues[1].qText,
						"Dim_key": k[0].qElemNumber,
						"Val1": k[2].qNum,
						"Val2": k[1].qNum
					});
					
			});
			
				//console.log("data",data);
			
			var svg = d3.select("#"+id),
            margin = { 
					top: layout.chart_m_top,
					right: layout.chart_m_right,
					bottom: layout.chart_m_bottom,
					left: layout.chart_m_left
			},
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x0 = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1);

        var x1 = d3.scaleBand()
            .padding(0.05);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);

       
	   
	   var z = d3.scaleOrdinal()
            .range(layout.BarColor.split(','));
			
	
		

		
        var keys = Object.keys(data[0]).slice(8);

        x0.domain(data.map(function (d) { return d.Dim; }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([vMin,  vMax 
			+
			(vMax * (10/100))
		]).nice();
//d3.max(data, function (d) { return d3.max(keys, function (key) { return d[key]; }); })
        var bar = g.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", function (d) { return "translate(" + x0(d.Dim) + ",0)"; })
			.on("click", function(d) {
				console.log($(this).children());
				self.selectValues(0, [d.Dim_key], true);
				$.each($(this).children(),function(k,v){
					$(this).attr("stroke-width","4").attr("stroke","#009845");
				});
			});
			

            
			bar.selectAll("rect")
            .data(function (d) { 
            //debugger;
				return keys.map(function (key) { 
					if(key != "Dim_key"){
							return { key: key, value: d[key],Dim_key:d["Dim_key"] }; 
					}
				}); 
             })
			 
			.enter().append("rect")
            .attr("x", function (d) { return x1(d.key); })
            .attr("y", function (d) { return y(d.value); })
            .attr("width", x1.bandwidth())
            .attr("height", function (d) { return height - y(d.value); })
            .attr("fill", function (d) { return z(d.key); });

// bar label

		var barlabel = g.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", function (d) { return "translate(" + x0(d.Dim) + ",0)"; });
            
			barlabel.append('text')
			   .attr('class', "barv1")
			   .attr('x', x1.bandwidth())
			   .attr('y', function(d) {  return (d.Val1 > d.Val2 ?  y(d.Val1) :  y(d.Val2)) - 25; })
			   .text(function(d){ return d.diff; })
			   .attr('fill', function(d){ return d.Val3Color; });
			
			
			barlabel.append('text')
			   .attr('class', "barv2")
			   .attr('x', x1.bandwidth())
			   .attr('y', function(d) {   return (d.Val1 > d.Val2 ?  y(d.Val1) :  y(d.Val2)) - 5 ; })
			   .text(function(d){ return d.growth; })
			   .attr('fill', function(d){ return d.Val4Color; });



        g.append("g")
            .attr("class", "Xaxis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0));

        g.append("g")
            .attr("class", "Yaxis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start");
            //.text("Population");





        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function (d) { return d; });
			
			d3.selectAll("#" + id + " .Yaxis>.tick>text").each(function(d, i) {
					d3.select(this).attr("font-size", layout.YAxisTextSize).attr("font-weight", layout.YAxisTextFontweight)
					.attr("text-anchor", "")
					.attr("transform", "rotate("+layout.YAxisTextRotate+")");
			});
			
			d3.selectAll("#" + id + " .Xaxis>.tick>text").each(function(d, i) {
					d3.select(this).attr("font-size", layout.XAxisTextSize).attr("font-weight", layout.XAxisTextFontweight)
					.attr("text-anchor", "")
					.attr("transform", "rotate("+layout.XAxisTextRotate+")");
				});
			
			
			//needed for export
			return qlik.Promise.resolve();
		}
	};

} );

