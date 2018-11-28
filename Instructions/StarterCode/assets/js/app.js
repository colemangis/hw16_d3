
// set width of containing box
var width = parseInt(d3.select("#scatter").style("width"));

var height = width - width / 4;

var margin = 22;

var labelArea = 100;

var tPadBot = 40;
var tPadLeft = 40;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Bubble Radius
var cRad;
function crGet() {
  if (width <= 530) {
    cRad = 5;
  }
  else {
    cRad = 10;
  }
}
crGet();

//labels
svg.append("g").attr("class", "xText");

var xText = d3.select(".xText");

//vary location based on window
function xTextRefresh() {
  xText.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin - tPadBot) +
      ")"
  );
}
xTextRefresh();

//poverty
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");
//age
xText
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");
//income
xText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

//make transformed labels readable
var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

// add y axis label
svg.append("g").attr("class", "yText");

// y axis variable
var yText = d3.select(".yText");

//vary yLocation based on window
function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
  );
}
yTextRefresh();

// obesity
yText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

// smokes
yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

// lacks healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

//retrieve data from csv
d3.csv("assets/data/data.csv").then(function(data) {
  // Visualize the data
  visualize(data);
});

//data dependent
function visualize(theData) {
  //determine which data is displayed on which axis
  var curX = "poverty";
  var curY = "obesity";

//create empty values to populate based on data
  var xMin;
  var xMax;
  var yMin;
  var yMax;

  // tooltip and state name
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      console.log(d)
      // x key
      var xKey;
      
      var StAbv = "<div>" + d.state + "</div>";
      //y-vale key and value
      var yKey = "<div>" + curY + ": " + d[curY] + "%</div>";
      // If the x key is poverty show percentage
      if (curX === "poverty") {
        
        xKey = "<div>" + curX + ": " + d[curX] + "%</div>";
      }
      else {
        // set x key and format
        xKey = "<div>" +
          curX +
          ": " +
          parseFloat(d[curX]).toLocaleString("en") +
          "</div>";
      }
      //display
      return StAbv + xKey + yKey;
    });
  //tooltip call
  svg.call(toolTip);

  //change min and max for x
  function xMinMax() {
    //grab the min datum from the selected column.
    xMin = d3.min(theData, function(d) {
      return parseFloat(d[curX]) * 0.90;
    });

    //grab max datum from the selected column.
    xMax = d3.max(theData, function(d) {
      return parseFloat(d[curX]) * 1.10;
    });
  }

  // change min and max for y
  function yMinMax() {
    //grab the smallest datum from the selected column.
    yMin = d3.min(theData, function(d) {
      return parseFloat(d[curY]) * 0.90;
    });

    // grab max datum from the selected column.
    yMax = d3.max(theData, function(d) {
      return parseFloat(d[curY]) * 1.10;
    });
  }

  //change the classes of label text when clicked.
  function labelChange(axis, clickedText) {
    //change currently active to inactive.
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    //activate new text selection
    clickedText.classed("inactive", false).classed("active", true);
  }

  //generate scatter
  xMinMax();
  yMinMax();

 //scales
  var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([height - margin - labelArea, margin]);

  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

 //append axes
  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  //select group
  var theCircles = svg.selectAll("g theCircles").data(theData).enter();

  //append circles
  theCircles
    .append("circle")
    //specify location, size, class
    .attr("cx", function(d) {
      return xScale(d[curX]);
    })
    .attr("cy", function(d) {
      return yScale(d[curY]);
    })
    .attr("r", cRad)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    //mouseover
    .on("mouseover", function(d) {
      //tooltip
      toolTip.show(d, this);
      // Highlight the state circle's border
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      //un-tooltip
      toolTip.hide(d);
      //unhighlight
      d3.select(this).style("stroke", "#e3e3e3");
    });

  //match text to circles
  theCircles
    .append("text")
    // We return the abbreviation to .text, which makes the text the abbreviation.
    .text(function(d) {
      return d.abbr;
    })
    // Now place the text using our scale.
    .attr("dx", function(d) {
      return xScale(d[curX]);
    })
    .attr("dy", function(d) {
      //places text
      return yScale(d[curY]) + cRad / 2.5;
    })
    .attr("font-size", cRad)
    .attr("class", "stateText")
    //mouse over
    .on("mouseover", function(d) {
      //display tooltip
      toolTip.show(d);
      //highlight circle stroke
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      //un-tooltip
      toolTip.hide(d);
      //unhighlight
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  //event listener
  d3.selectAll(".aText").on("click", function() {
    // get value of selection (line 177 of 12 Hair metal)
    var self = d3.select(this);

    //look at data not displayed
    if (self.classed("inactive")) {
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");

      // When x axis is unchanged
      if (axis === "x") {
        //curX the same as the data name.
        curX = name;

        //min and max of the x-axis
        xMinMax();

        //x domain
        xScale.domain([xMin, xMax]);

        //transition x axis
        svg.select(".xAxis").transition().duration(300).call(xAxis);

        //circle location edit
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[curX]);
            })
            .duration(300);
        });

        //StAbv text
        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[curX]);
            })
            .duration(300);
        });

        //activate labels
        labelChange(axis, self);
      }
      else {
        //curY the same as the data name.
        curY = name;

        //change the min and max of the y-axis.
        yMinMax();

        //scale y
        yScale.domain([yMin, yMax]);

        //update y
        svg.select(".yAxis").transition().duration(300).call(yAxis);

        //location circle
        d3.selectAll("circle").each(function() {
          // Each state circle gets a transition for it's new attribute.
          // This will lend the circle a motion tween
          // from it's original spot to the new location.
          d3
            .select(this)
            .transition()
            .attr("cy", function(d) {
              return yScale(d[curY]);
            })
            .duration(300);
        });

        //location text
        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dy", function(d) {
              return yScale(d[curY]) + cRad / 3;
            })
            .duration(300);
        });

        //activate labels
        labelChange(axis, self);
      }
    }
  });

// resize to mobile window dimensions
  d3.select(window).on("resize", resize);

    function resize() {
    //define variables dependent np wdth of window
    width = parseInt(d3.select("#scatter").style("width"));
    height = width - width / 3.9;
    leftTextY = (height + labelArea) / 2 - labelArea;

    //apply to svg canvas
    svg.attr("width", width).attr("height", height);

    //change range and axes
    xScale.range([margin + labelArea, width - margin]);
    yScale.range([height - margin - labelArea, margin]);

    svg
      .select(".xAxis")
      .call(xAxis)
      .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

    svg.select(".yAxis").call(yAxis);

    tickCount();

    //update labels
    xTextRefresh();
    yTextRefresh();

    //update radius
    crGet();

    //update circle location
    d3
      .selectAll("circle")
      .attr("cy", function(d) {
        return yScale(d[curY]);
      })
      .attr("cx", function(d) {
        return xScale(d[curX]);
      })
      .attr("r", function() {
        return cRad;
      });

    //update StAbv text
    d3
      .selectAll(".stateText")
      .attr("dy", function(d) {
        return yScale(d[curY]) + cRad / 3;
      })
      .attr("dx", function(d) {
        return xScale(d[curX]);
      })
      .attr("r", cRad / 3);
  }
}