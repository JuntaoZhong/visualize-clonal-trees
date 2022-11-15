/*var data1 = {*/
    /*"name": "A",*/
    /*"color": "black",*/
    /*"children": [*/
        /*{*/
            /*"name": "B",*/
            /*"color": "hsl(0, 100%, 70%)",*/
        /*},*/
        /*{*/
            /*"name": "C",*/
            /*"color": "black"*/
        /*}*/
    /*]*/
/*}*/

//var data2 = {
    //"name": "A",
    //"color": "black",
    //"children": [
        //{
        //"name": "B",
        //"color": "black",
        //"children": [
            //{
              //"name": "C",
              //"color": "black"
            //}
        //]
        //}
    //]
//}

var data1 = {
    "name": "A",
    "color": "hsl(0, 100%, 60%)",
    "contribution": 0.5,
    "children": [
        {
            "name": "C",
            "contribution": 0.8,
                "children": [
                    {
                        "name": "D",
                        "contribution": 0.3,
                    }
                ]

        },
        {
            "name": "B",
            "contribution": 0.1,
        }
    ]
}

var data2 = {
    "name": "C",
    "color": "hsl(0, 100%, 30%)",
    "contribution": 0.5,
    "children": [
        {
            "name": "B",
            "contribution": 0.8,
                "children": [
                    {
                        "name": "D"
                    }
                ]

        },
        {
            "name": "A",
            "contribution": 0.1,
        }
    ]
}

var tree1 = d3.tree().size([400, 200])

var root1 = d3.hierarchy(data1)
tree1(root1)

d3.select("#svg1 g.nodes")
    .selectAll('circle.node')
    .data(root1.descendants())
    .join('circle')
    .classed('node', true)
    .style("stroke", "black")
    .style("stroke-width", "3px")
    //.style("fill", function(d) {console.log("Oogga: " + d.data.color); return d.data.color;} )
     .style("fill", function(d) {
         var scale = d3.scaleLinear()
         .domain([0, 0.5, 1])
         .range(["red", "white", "green"]);

         return scale(d.data.contribution);
         
     })
    .style("transform", "translate(5, 20), scale(0.5)")
    .attr('cx', function(d) { console.log(d); return d.x;})
    .attr('cy', function(d) {return d.y;})
    .attr('r', 10);


d3.select('#svg1 g.nodes')
    .selectAll("text.label")
    .data(root1.descendants())
    .join("text")
    .classed("label", true)
    .attr("x", function(d) { return d.x + 15 })
    .attr("y", function(d) { return d.y + 15})
    .text(d => {
        return d.data.name;
    });

d3.select('#svg1 g.links')
    .selectAll('line.link')
    .data(root1.links())
    .join('line')
    .classed('link', true)
    .style("stroke", "black")
    .style("transform", "translate(5, 20), scale(0.5)")
    .style("stroke-width", "1px") 
    .attr('x1', function(d) {return d.source.x;})
    .attr('y1', function(d) {return d.source.y;})
    .attr('x2', function(d) {return d.target.x;})
    .attr('y2', function(d) {return d.target.y;});


var tree2 = d3.tree().size([400, 200])

var root2 = d3.hierarchy(data2)

tree2(root2)

d3.select("#svg2 g.nodes")
    .selectAll('circle.node')
    .data(root2.descendants())
    .join('circle')
    .classed('node', true)
    .style("stroke", "black")
    .style("stroke-width", "3px")
    .style("transform", "translate(5, 20), scale(0.5)")
    .style("fill", function(d) {console.log("Oogga: " + d.data.color); return d.data.color;} )
    .attr('cx', function(d) { console.log(d); return d.x;})
    .attr('cy', function(d) {return d.y;})
    .attr('r', 10);


d3.select('#svg2 g.nodes')
    .selectAll("text.label")
    .data(root2.descendants())
    .join("text")
    .classed("label", true)
    .attr("x", function(d) { return d.x + 15 })
    .attr("y", function(d) { return d.y + 15})
    .text(d => {
        return d.data.name;
    });

d3.select('#svg2 g.links')
    .selectAll('line.link')
    .data(root2.links())
    .join('line')
    .classed('link', true)
    .style("stroke", "black")
    .style("transform", "translate(5, 20), scale(0.5)")
    .style("stroke-width", "1px") 
    .attr('x1', function(d) {return d.source.x;})
    .attr('y1', function(d) {return d.source.y;})
    .attr('x2', function(d) {return d.target.x;})
    .attr('y2', function(d) {return d.target.y;});
