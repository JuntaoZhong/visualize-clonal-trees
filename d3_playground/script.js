var data = {
  "name": "B", 
  "children": [
    {
      "name": "D",
      "incoming": "#d41826",
      "children": [
         {
           "name": "F",
           "incoming": "#ec616a",
           "children": [
            { "name": "E", "incoming":"#f9cdd1" }
           ]
         },
         {
           "name": "G",
           "incoming": "#d41826",
           "children": [
           {
               "name": "C",
               "incoming": "#730d15",
               "children": [
                {
                    "name": "I",
                    "incoming": "#d41826",
                    "children": [
                     { "name": "A", "incoming":"#e51e2c" }
                     ]
                }
                ]
           }
         
           ]
         }
      ]
    },
    { 
       "name": "H",
       "incoming": "#f29399",
       "children": [ { "name": "J", "incoming": "#f29399"} ]
    }
  ]
}

var tree2 = {

  "name": "F",
  "children": [
    {
      "name": "A",
      "children": [
        {
          "name": "C",
          "children": [
            {
              "name": "J",
              "children": [

            {
              "name": "D",
              "children": [

            {
              "name": "H",
              "children": [

            {
              "name": "E",
              "children": [
              {"name": "I"}
              ]
            }
              ]
            }
              ]
            }
              ]
            },
            {
              "name":"B", 
              "children": [
                {
              "name":"G"
                }
              ]

            }
          ]
        }
      ]
    }
  ]

}

var treeLayout = d3.tree()
  .size([400, 200])

var root = d3.hierarchy(data)

treeLayout(root);

// Nodes
var svg_names = ['svg1', 'svg2'];
for (var i = 0; i < 2; i++) {
  d3.select('#' + svg_names[i] +  ' g.nodes')
    .selectAll('circle.node')
    .data(root.descendants())
    .join('circle')
    .classed('node', true)
    .style("stroke", "black")
    .style("stroke-width", "3px")
    .style("transform", "translate(5, 20), scale(0.5)")
    .attr('cx', function(d) {return d.x;})
    .attr('cy', function(d) {return d.y;})
    .on("click", function(d) { 
        console.log(d.target.cx.baseVal.value) ;
        document.addEventListener("mousemove", function move(e) {
          d.target.cx.baseVal.value = event.clientX - 5; 
          d.target.cy.baseVal.value = event.clientY - 70;
          document.onclick = function(ev) {
            document.removeEventListener("mousemove", move);
          }
        });
    }) 
    .attr('r', 10);
  
  d3.select('#' + svg_names[i] +  ' g.nodes')
    .selectAll("text.label")
    .data(root.descendants())
    .join("text")
    .classed("label", true)
    .attr("x", function(d) { return d.x + 15 })
    .attr("y", function(d) { return d.y + 15})
    .text(d => {
        return d.data.name;
    });
  // Links
  d3.select('#' + svg_names[i] +  ' g.links')
    .selectAll('line.link')
    .data(root.links())
    .join('line')
    .classed('link', true)
    .style("stroke", function(d) { return d.target.data.incoming;})
    .style("transform", "translate(5, 20), scale(0.5)")
    .style("stroke-width", "5px") 
    .attr('x1', function(d) {return d.source.x;})
    .attr('y1', function(d) {return d.source.y;})
    .attr('x2', function(d) {return d.target.x;})
    .attr('y2', function(d) {return d.target.y;});
}


