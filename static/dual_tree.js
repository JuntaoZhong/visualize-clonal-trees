tree1TextArea = document.querySelector("#tree1-text"); 
tree2TextArea = document.querySelector("#tree2-text"); 
inputTypeTree1 = document.getElementById("input-type-tree1"); 
inputTypeTree2 = document.getElementById("input-type-tree2"); 
submitTreesBtn = document.getElementById("submit-trees-btn"); 
distanceMetric = document.getElementById("distance_metric"); 

function dist_caset_d3_tress(jsonData) {
  data1 = jsonData.tree1_edges;
  data2 = jsonData.tree2_edges;
  datas = [data1, data2];

  var svg_names = ['svg1', 'svg2'];
  for (var i = 0; i < 2; i++) {
    root = d3.hierarchy(datas[i]);
    var treeLayout = d3.tree().size([400, 200]);
    treeLayout(root);
    // Nodes
    d3.select('#' + svg_names[i] +  ' g.nodes')
      .selectAll('circle.node')
      .data(root.descendants())
      .join('circle')
      .classed('node', true)
      .style("stroke", "black")
      .style("fill", function(d) { 
        var scale = d3.scaleLinear()
        .domain([0, 5, 9])
        .range(["blue", "red", "yellow"]);
        return scale(d.data.contribution);
        })
      .style("stroke-width", "3px")
      .style("transform", "translate(5, 20), scale(0.5)")
      .attr('cx', function(d) {return d.x;})
      .attr('cy', function(d) {return d.y;})
      .on("click", function(d) { 
          document.addEventListener("mousemove", function move(e) {
            d.target.cx.baseVal.value = event.clientX - 5; 
            d.target.cy.baseVal.value = event.clientY - 70;
            document.onclick = function(ev) {
              document.removeEventListener("mousemove", move);
            }
          });
      }) 
      .attr('r', function(d) {
        labels_array = d.data.label.split(',');
        return Math.sqrt(labels_array.length) * 10;
      });
    
    // Links
    d3.select('#' + svg_names[i] +  ' g.links')
      .selectAll('line.link')
      .data(root.links())
      .join('line')
      .classed('link', true)
      .style("stroke", function(d) { 
        var scale = d3.scaleLinear()
        .domain([0, 2, 4])
        .range(["blue", "red", "yellow"]);
        return scale(d.target.data.contribution);
        }) //d.target.data.contribution;
      .style("transform", "translate(5, 20), scale(0.5)")
      .style("stroke-width", "5px") 
      .attr('x1', function(d) {return d.source.x;})
      .attr('y1', function(d) {return d.source.y;})
      .attr('x2', function(d) {return d.target.x;})
      .attr('y2', function(d) {return d.target.y;});
  }
}

submitTreesBtn.onclick = () => {
  var tree1Input = tree1TextArea.value;
  var tree2Input = tree2TextArea.value;
  var baseURL = "http://localhost:5000/api/";
  var url = baseURL + distanceMetric.value + "?";
  var url_components = [url, "tree1=", tree1Input, "&tree2=", tree2Input]
  url = url_components.join("");
  var svg_names = ['svg1', 'svg2'];
    fetch(url)
    .then(response => response.json())
    .then(jsonData => {
      if (distanceMetric.value == "ancestor_descendant_distance") {
        data1 = jsonData.tree1_edges
        data2 = jsonData.tree2_edges
        console.log(jsonData)
        datas = [data1, data2]
  
        for (var i = 0; i < 2; i++) {
          root = d3.hierarchy(datas[i]);
          var treeLayout = d3.tree().size([400, 200])
          treeLayout(root);
          // Nodes
          d3.select('#' + svg_names[i] +  ' g.nodes')
            .selectAll('circle.node')
            .data(root.descendants())
            .join('circle')
            .classed('node', true)
            .style("stroke", "black")
            .style("fill", function(d) { 
              var scale = d3.scaleLinear()
              .domain([0, 5, 9])
              .range(["blue", "red", "yellow"]);
              return scale(d.data.contribution);
              })
            .style("stroke-width", "3px")
            .style("transform", "translate(5, 20), scale(0.5)")
            .attr('cx', function(d) {return d.x;})
            .attr('cy', function(d) {return d.y;})
            .on("click", function(d) { 
                document.addEventListener("mousemove", function move(e) {
                  d.target.cx.baseVal.value = event.clientX - 5; 
                  d.target.cy.baseVal.value = event.clientY - 70;
                  document.onclick = function(ev) {
                    document.removeEventListener("mousemove", move);
                  }
                });
            }) 
            .attr('r', 10);
          
          // Links
          d3.select('#' + svg_names[i] +  ' g.links')
            .selectAll('line.link')
            .data(root.links())
            .join('line')
            .classed('link', true)
            .style("stroke", function(d) { 
              return "black";
              }) //d.target.data.contribution;
            .style("transform", "translate(5, 20), scale(0.5)")
            .style("stroke-width", "5px") 
            .attr('x1', function(d) {return d.source.x;})
            .attr('y1', function(d) {return d.source.y;})
            .attr('x2', function(d) {return d.target.x;})
            .attr('y2', function(d) {return d.target.y;});
        }
      }
      else if (distanceMetric.value == "caset_distance") {
        dist_caset_d3_tress(jsonData);
      }
      else if (distanceMetric.value = "disc_distance") {
        dist_caset_d3_tress(jsonData);
      }
      else if (distanceMetric.value == "parent_child_distance") {
        console.log("under development");
      }
      else {
        console.log("Please select a valid distance measure. If you have question email ealexander@carleton.edu");
      }
    })
}
