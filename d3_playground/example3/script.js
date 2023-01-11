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

const handler = d3.drag();

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
    .style("fill", "black")
    .style("transform", "translate(5, 20), scale(0.5)")
    .attr('cx', function(d) { console.log(d); return d.x;})
    .attr('cy', function(d) {return d.y;})
    .attr('r', 10)
    .call(handler.on("start", function () { 
        d3.select(this).style("fill", "orange");
    }))
    .call(handler.on("drag", function (event, d) { 
        d3.select(this).raise().attr("cx", d.x = event.x).attr("cy", d.y = event.y);
        move();
    }));


var text = d3.select('#svg1 g.nodes')
    .selectAll("text.label")
    .data(root1.descendants())
    .join("text")
    .classed("label", true)
    .attr("x", function(d) { return d.x + 15 })
    .attr("y", function(d) { return d.y + 15})
    .text(d => {
        return d.data.name;
    });

var link = d3.select('#svg1 g.links')
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

function move() {
    link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)
    text
    .attr("x", d => d.x + 15)
    .attr("y", d => d.y + 15)

}
















