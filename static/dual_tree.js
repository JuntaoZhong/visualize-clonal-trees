tree1TextArea = document.querySelector("#tree1-text");
tree2TextArea = document.querySelector("#tree2-text");
tree1file = document.getElementById("file1");
tree2file = document.getElementById("file2");
inputTypeTree1 = document.getElementById("input-type-tree1");
inputTypeTree2 = document.getElementById("input-type-tree2");
submitTreesBtn = document.getElementById("submit-trees-btn");
distanceMetric = document.getElementById("distance_metric");
demoTreesBtn = document.getElementById("demo-trees-btn");
distanceMeasureLabel = document.getElementById("distance-measure-label");
//var coloring = ['#f0f172', '#8cb8be','#527bb4','#00429d'];
var coloring = ['#f0f172', '#80bda5', '#4180a9', '#00429d']
//var coloring = ["#ffffcc", "#a1dab4", "#41b6c4", "#225ea8"];
window.onload = () => {
  submit_tree();
}

tree1file.addEventListener("change", function () {
    var fr = new FileReader();
    fr.readAsText(this.files[0]);
    fr.onload = function () {
      tree1TextArea.value = fr.result
    };  
  });


tree2file.addEventListener("change", function () {
  var fr = new FileReader();
  fr.readAsText(this.files[0]);
  fr.onload = function () {
    tree2TextArea.value = fr.result
  };  
});


function remove_quotation(str) {
  let new_str = str
  while (new_str.indexOf('\"') > -1) {
    new_str = new_str.replace("\"", '')
  }
  return new_str
}

function set_visualization_event_listeners(distance_measure) {
  d3.selectAll(".hover-label").remove();
  var div  = d3.select("body").append("div").classed("hover-label", true);
  switch (distance_measure) {
    case "caset_distance": 
    case "disc_distance": 
    case "ancestor_descendant_distance":
      d3.selectAll("circle.node")
        .on("mouseover", (d, i) => {
          div.html(round_to_thousands(i.data.contribution));
          div.style("opacity", 1); 
          div.style("left", (event.pageX + 10 ) + "px")
             .style("top", (event.pageY + 10) + "px");
        }) // Here is the hover thing
        .on("mouseout", () => {
          div.style("opacity", 0); 
        });
      d3.selectAll("line.link")
        .on("mouseover", null)
        .on("mouseout", null);
      break;
    case "parent_child_distance": 
      d3.selectAll("line.link")
        .on("mouseover", (d, i) => {
          div.html(i.target.data.contribution);
          div.style("opacity", 1); 
          div.style("left", (event.pageX + 10 ) + "px")
             .style("top", (event.pageY + 10) + "px");
        }) // Here is the hover thing
        .on("mouseout", (d, i) => {
          div.style("opacity", 0); 
        });
      d3.selectAll("circle.node")
        .on("mouseover", null)
        .on("mouseout", null);
      break;
    default:
      console.log("Error. Invalid distance measure.");
      break;
  }
}


function visualize_trees(jsonData, distance_measure) {

  set_visualization_event_listeners(distance_measure);
  var tree1_data = jsonData.tree1_edges;
  var tree2_data = jsonData.tree2_edges;
  var data = [tree1_data, tree2_data]
  var distance = jsonData.distance;

  var nodes1 = d3.hierarchy(tree1_data).descendants();
  var mutations_tree1 = getAllMutations(nodes1);
  var tree1_label = document.getElementById("tree1-mutations");

  var nodes2 = d3.hierarchy(tree2_data).descendants();
  var mutations_tree2 = getAllMutations(nodes2);
  var tree2_label = document.getElementById("tree2-mutations");
  
  var shared_label = document.getElementById("shared-mutations");
  shared_mutations = intersect(mutations_tree1, mutations_tree2);
  console.log("shared mutations: ", shared_mutations);
  tree1_only_mutations = difference(mutations_tree1, shared_mutations);
  tree2_only_mutations = difference(mutations_tree2, shared_mutations);
  shared_label.innerHTML='';
  tree1_label.innerHTML='';
  tree2_label.innerHTML='';
  shared_mutations.forEach(mutation => {
    shared_label.innerHTML +=  `<span class="${mutation}-mutation-hover-label">${mutation}</span> `;
  })
  tree1_only_mutations.forEach(mutation => {
    tree1_label.innerHTML +=  `<span class="${mutation}-mutation-hover-label">${mutation}</span> `;
  })
  tree2_only_mutations.forEach(mutation => {
    tree2_label.innerHTML +=  `<span class="${mutation}-mutation-hover-label">${mutation}</span> `;
  })

  var spans = d3.selectAll("span");
  spans.on('mouseover', (d) => {
      console.log(jsonData);
      var items = d3.selectAll("." + d.target.className);
      items.style("color", "orange");
      items.style("fill", "orange");
      items.style("transition", "color 1s");
      items.style("cursor", "pointer");
      items.style("font-weight", "bold");
  })
  spans.on('mouseout', (d) => {
      console.log(jsonData);
      var items = d3.selectAll("." + d.target.className);
      items.style("transition", "color 1s");
      items.style("color", "black");
      items.style("font-weight", "normal");
      items.style("fill", (d, index, items) => {
        if (items[index].localName == "span") {
          return "black";
        }
        else {
          var tree = items[index].ownerSVGElement.id;
          var contribution = items[index].parentNode.__data__.data["contribution"];
          console.log(items[index]);
          console.log(items);
          console.log(tree);
          if (tree == 'svg1') {
            var mutation = items[index].__data__[0];
            var contribution = d[3][mutation]["contribution"];
            if (contribution > 0) {
              return "red";
            }
            else {
              return "black";
            }
          }
          else {
            var mutation = items[index].__data__[0];
            var contribution = d[4][mutation]["contribution"];
            if (contribution > 0) {
              return "red";
            }
            else {
              return "black";
            }
          }
        }
      });
  })

  var t_max = Math.max(max_contribution(nodes1), max_contribution(nodes2));
  fill_tree_scale_color_legend(multi_tree_prefix = "", t_max);

  var svg1 = d3.select('#svg1');
  svg1.call(d3.zoom()
    .extent([[0, 0], [700, 700]])
    .scaleExtent([1, 8])
    .on("zoom", zoomed)
  ); 
  
  var svg2 = d3.select('#svg2')
  svg2.call(d3.zoom()
    .extent([[0, 0], [700, 700]])
    .scaleExtent([1, 8])
    .on("zoom", zoomed2)
  ); 
  
  function zoomed({transform}) {
    // var zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
    // var zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
    var svg1_nodes =  d3.select('#svg1 g.nodes')
    var svg1_links =  d3.select('#svg1 g.links')
    svg1_nodes
      .attr("transform", transform);  
    svg1_links
      .attr("transform", transform);
  };

  function zoomed2({transform}) {
    // var zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
    // var zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
    var svg2_nodes =  d3.select('#svg2 g.nodes')
    var svg2_links =  d3.select('#svg2 g.links')
    svg2_nodes
      .attr("transform", transform);  
    svg2_links
      .attr("transform", transform);
  };

  var svg_names = ['svg1', 'svg2'];
  for (var i = 0; i < 2; i++) {
    var cur_svg = svg_names[i];
    var root = d3.hierarchy(data[i]);
    //var tree = d3.tree().size([600, 400]);
    var tree = d3.tree()
    if (root.height > 10) {
      tree.nodeSize([70, 25]);
    }
    else {
      tree.nodeSize([90, 80]);
    }
    tree.separation((a, b) => 1.5);
    tree(root);
    var d3_nodes = d3.select('#' + svg_names[i] +  ' g.nodes')
    var d3_links = d3.select('#' + svg_names[i] +  ' g.links')
    var d3_text = d3_nodes.selectAll("text.mutation-label")
 

    // Setting shared attributes for the links 
    d3_links.selectAll('line.link')
      .data(root.links())
      .join('line')
      .classed('link', true)
      .style("transform", "translate(5, 20), scale(0.5)")
      .style("stroke-width", () => {
        if (distance_measure != "parent_child_distance") {
          return "2px";
        }
        else {
          return "5px";
        }
      })
      .attr('x1', d =>  { return d.source.x;})
      .attr('y1', d => { return d.source.y;})
      .attr('x2', d => { return d.target.x;})
      .attr('y2', d => { return d.target.y;});

    // Set shared attributes for the nodes 
    d3_nodes.selectAll("circle.node")
      .data(root.descendants())
      .join('circle')
      .classed('node', true)
      .style("transform", "translate(5, 20), scale(0.5)")
      .style("stroke-width", "1px")
      .attr('cx', (d) => {return d.x;})
      .attr('cy', function(d) {return d.y;})
      .attr('r', function(d) {
        if (distance_measure == "parent_child_distance") {
          return 6;
        }
        return 10;
      })
    
    // Displaying the labels for the nodes
    var labels = d3_text.data(root.descendants())
    .join("text")
    .classed("mutation-label", true)
    .attr("x", d => { 
      console.log(d.data.label);
      var currentNode = d;
      var parentNode = d.parent;
      if (parentNode) {
        var currentNodeX = d.x;
        var parentNodeX = parentNode.x;
        if (d.data.children == null) {
          if (currentNodeX < parentNodeX) {
            //return d.x - 50;
            return d.x - (d.data.label.length) * 4;
          }
          else if (currentNodeX > parentNodeX) {
            return d.x - 50;
          }
          else {
            return d.x - 5;
          }
        }
        else {
          if (currentNodeX < parentNodeX) {
            return d.x - Math.min(200, (d.data.label.length) * 5);
            //return d.x - 50;
          }
          else if (currentNodeX > parentNodeX) {
            return d.x - Math.min(50, d.data.label.length * 2);
          }
          else {
            return d.x + 15;
          }
        }
      }
      else {
        return d.x + 15;
      }
    })
    .attr("y", d => { 
      if (d.data.children == null) {
        return d.y + 20; 
      }
      return d.y - 15; 
    })

    // Making each mutation a tspan
    //var tspans = labels
    .selectAll("tspan")
    .data(d => {
      var str = d.data.label;
      str = remove_quotation(str);
      var lst = str.split(",");
      var newLst = [];
      lst.forEach(mutation => {
        var tree1_mutations = jsonData.tree1_mutations; 
        var tree2_mutations = jsonData.tree2_mutations; 
        newLst.push([mutation.trim(), d.x, d.y, tree1_mutations, tree2_mutations]);
      });
      return newLst;
    })
    .join('tspan')
    .attr("class", d => {
      return d[0] + "-mutation-hover-label";
    })
    .text((d, i, j) => {
      if (i == j.length - 1) {
        return d[0];
      }
      return d[0] + ",";
    })

    .style("font-size", "0.70em")
    .style("font-family", "Monospace")
    .style("fill", (d) => {
      var tree1_mutations = jsonData.tree1_mutations; 
      var tree2_mutations = jsonData.tree2_mutations; 
      if (svg_names[i] == 'svg1') {
        if (tree1_mutations[d[0]]["contribution"] > 0) {
          return "red";
        } 
        return "black";
      }
      else if (svg_names[i] == "svg2") {
        if (tree2_mutations[d[0]]["contribution"] > 0) {
          return "red";
        } 
        return "black";
      }
    })
    .on("mouseover", (d, i) => {
      console.log(i[0] + "-mutation-hover-label");
      //var items = d3.selectAll("." + i[0] + "-mutation-hover-label");
      var items = d3.selectAll("." + i[0] + "-mutation-hover-label");
      items.style("color", "orange");
      items.style("fill", "orange");
      items.style("transition", "color 1s");
      items.style("cursor", "pointer");
      items.style("font-weight", "bold");
    }) // Here is the hover thing
    .on("mouseout", (d,i) => {
      console.log("." + i[0] + "-mutation-hover-label");
      var items = d3.selectAll("tspan." + i[0] + "-mutation-hover-label");
      if (cur_svg == "svg1") {
        var contribution = jsonData.tree1_mutations[i[0]].contribution;
        console.log(contribution);
        items.style("color", "black")
        items.style("fill", "black");
        if (contribution > 0) {
          items.style("color", "red")
          items.style("fill", "red");
        }
        else {
          items.style("color", "black")
          items.style("fill", "black");
        } 
      }
      else {
        var contribution = jsonData.tree1_mutations[i[0]].contribution;
        if (contribution > 0) {
          items.style("color", "red")
          items.style("fill", "red");
        }
        else {
          items.style("color", "black")
          items.style("fill", "black");
        }
      }
      items.style("font-weight", "normal");
      d3.selectAll("span." + i[0] + "-mutation-hover-label").style("color", "black");
    })
    .on("click", (d, i) => { 
        var gene_url = "https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + i[0];
        window.open(gene_url, "_blank"); 
        // console.log("." + i[0] + "-mutation-hover-label");
        // var items = d3.selectAll("." + i[0] + "-mutation-hover-label");
        // items.style("color", "orange"); 
    })
    .attr("x", (d, i, j) => {
      var index = i;
      //return d[1] + ((d[0].length * 10) * (i%2)) + 10;
      console.log(this);
      if (index % 2 == 0) {
        return d[1] + 10;
      }
      console.log("Prev length:", j[i-1].__data__[0], j[i-1].__data__[0].length);
      return d[1] + (j[i-1].__data__[0].length + 10) * 3.5;
    })
    .attr("dy", (d, i, j) => {
      if (i % 2 == 0) {
        return "1.1em";
      }
    });
 
    if (svg_names[i] == "svg1") {
      t1_max_branching_factor = get_branching_factor(nodes1);
      t1_top5_mutations = get_top_n_mutations(jsonData.tree1_mutations, 5);
      fill_in_table("t1", t1_max_branching_factor, root.height, nodes1.length, mutations_tree1.length, t1_top5_mutations);
    }
    else {
      t2_max_branching_factor = get_branching_factor(nodes2);
      t2_top5_mutations = get_top_n_mutations(jsonData.tree1_mutations, 5);
      fill_in_table("t2", t2_max_branching_factor, root.height, nodes1.length, mutations_tree1.length, t2_top5_mutations);
    }


    // Set the coloring scheme based off of the distance measure
    switch (distanceMetric.value) {
      case "ancestor_descendant_distance":
        distanceMeasureLabel.innerHTML = "Ancestor Descendant Distance: " + distance;
        pc_ad_d3_trees(root, d3_nodes, d3_links, "ad", t_max);
        break;
      case "caset_distance": 
        distanceMeasureLabel.innerHTML = "CASet Distance: " + distance;
        dist_caset_d3_trees(root, d3_nodes, d3_links, t_max);
        break;
      case "disc_distance": 
        distanceMeasureLabel.innerHTML = "DISC Distance: " + distance;
        dist_caset_d3_trees(root, d3_nodes, d3_links, t_max);
        break;
      case "parent_child_distance": 
        distanceMeasureLabel.innerHTML = "Parent-child Distance: " + distance;
        pc_ad_d3_trees(root, d3_nodes, d3_links, "pc", t_max);
        break;
      default:
        console.log("Please select a valid distance measure. If you have question email ealexander@carleton.edu");
        break;
    }
  }
}

function changeColor(d, i) {
  console.log(this);
}

function dist_caset_d3_trees(root, d3_nodes, d3_links, t_max) {

    d3_nodes.selectAll('circle.node')
      .style("stroke", "black")
      .style("fill", function(d) {
        var scale = d3.scaleLinear()
        .domain([0, t_max/3, 2*t_max/3, t_max])
        .range([coloring[0],coloring[1], coloring[2], coloring[3]]);
        return scale(d.data.contribution);
        })

    d3_links.selectAll('line.link').style("stroke", "black") 
}

function pc_ad_d3_trees(root, d3_nodes, d3_links, treetype, t_max) {

  // Coloring scheme for ancestor-descendant
  var node_color_function = d => { 
    var nodes = root.descendants();

    var scale = d3.scaleLinear()
    .domain([0, t_max/3, 2*t_max/3, t_max])
    .range([coloring[0],coloring[1], coloring[2], coloring[3]]);
    return scale(d.data.contribution);

  }

  // Coloring scheme for parent-child
  if (treetype == "pc") {
    node_color_function = () => { return "#e6e6e3";}
    edge_color_function = d => {
      var nodes = root.descendants();

      var scale = d3.scaleLinear()
      .domain([0, t_max/3, 2*t_max/3, t_max])
      .range([coloring[0],coloring[1], coloring[2], coloring[3]]);
      return scale(d.target.data.contribution);
    }
  }
  else {
    edge_color_function = () => {
      return "black";
    }
  }

  d3_nodes.selectAll('circle.node')
      .style("stroke", "black")
      .style("fill", function(d) { return node_color_function(d); })

  d3_links.selectAll('line.link')
      .style("stroke", function(d) { return edge_color_function(d); })
      .style("transform", "translate(5, 20), scale(0.5)")
}

function submit_tree() {
  /*
    Send trees to api in order to get
    data for input into d3 visualizations
  */
  var tree1Input = tree1TextArea.value;
  var tree2Input = tree2TextArea.value;
  var tree1Type = inputTypeTree1.value;
  var tree2Type = inputTypeTree2.value;

  var baseURL = "http://localhost:5000/api/";
  var url = baseURL + distanceMetric.value + "?";
  var url_components = [url, "tree1=", tree1Input, "&tree2=", tree2Input, "&treeType1=", tree1Type, "&treeType2=", tree2Type]
  url = url_components.join("");

  fetch(url)
  .then(response => response.json())
  .then(jsonData => {
     visualize_trees(jsonData, distanceMetric.value);
  });
}

function submit_mult_tree(distance_measure, svg1,svg2, scale) {
  /*
    Send trees to api in order to get
    data for input into d3 visualizations
  */
  var tree1Input = tree1TextArea.value;
  var tree2Input = tree2TextArea.value;
  var tree1Type = inputTypeTree1.value;
  var tree2Type = inputTypeTree2.value;

  var baseURL = "http://localhost:5000/api/";
  var url = baseURL + distance_measure + "?";
  var url_components = [url, "tree1=", tree1Input, "&tree2=", tree2Input, "&treeType1=", tree1Type, "&treeType2=", tree2Type]
  url = url_components.join("");

  fetch(url)
  .then(response => response.json())
  .then(jsonData => {
     visualize_mult_trees(jsonData, distance_measure, svg1, svg2, scale);
  });
}


function visualize_mult_trees(jsonData, distance_measure, svg1, svg2, scale) {
  
  set_visualization_event_listeners(distance_measure);
  var tree1_data = jsonData.tree1_edges;
  var tree2_data = jsonData.tree2_edges;
  var data = [tree1_data, tree2_data]
  var distance = jsonData.distance;

  var nodes1 = d3.hierarchy(tree1_data).descendants();
  var mutations_tree1 = getAllMutations(nodes1);
  var tree1_label = document.getElementById("tree1-mutations");

  var nodes2 = d3.hierarchy(tree2_data).descendants();
  var mutations_tree2 = getAllMutations(nodes2);
  var tree2_label = document.getElementById("tree2-mutations");
  
  var shared_label = document.getElementById("shared-mutations");
  shared_mutations = intersect(mutations_tree1, mutations_tree2);
  tree1_only_mutations = difference(mutations_tree1, shared_mutations);
  tree2_only_mutations = difference(mutations_tree2, shared_mutations);
  shared_label.innerHTML = shared_mutations;
  tree1_label.innerHTML = tree1_only_mutations;
  tree2_label.innerHTML = tree2_only_mutations;

  var t_max = Math.max(max_contribution(nodes1), max_contribution(nodes2));
  fill_tree_scale_color_legend(multi_tree_prefix = scale, t_max);
  
  var viz_svg1 = d3.select(svg1);
  viz_svg1.call(d3.zoom()
    .extent([[0, 0], [700, 700]])
    .scaleExtent([1, 8])
    .on("zoom", viz_zoomed)
  ); 
  
  var viz_svg2 = d3.select(svg2);
  viz_svg2.call(d3.zoom()
    .extent([[0, 0], [700, 700]])
    .scaleExtent([1, 8])
    .on("zoom", viz_zoomed2)
  ); 
  
  function viz_zoomed({transform}) {
    var viz_svg1_nodes =  d3.select(svg1 + ' g.nodes');
    var viz_svg1_links =  d3.select(svg1 + ' g.links');
    viz_svg1_nodes
      .attr("transform", transform);  
    viz_svg1_links
      .attr("transform", transform);
  };

  function viz_zoomed2({transform}) {
    var viz_svg2_nodes =  d3.select(svg2 + ' g.nodes');
    var viz_svg2_links =  d3.select(svg2 + ' g.links');
    viz_svg2_nodes
      .attr("transform", transform);  
    viz_svg2_links
      .attr("transform", transform);
  };

  var svg_names = [svg1, svg2];
  for (var i = 0; i < 2; i++) {
    var root = d3.hierarchy(data[i]);
    var tree = d3.tree()
    if (root.height > 10) {
      tree.nodeSize([70, 25]);
    }
    else {
      tree.nodeSize([90, 80]);
    }
    tree.separation((a, b) => 1.5);
    tree(root);
    var d3_nodes = d3.select(svg_names[i] +  ' g.nodes')
    var d3_links = d3.select(svg_names[i] +  ' g.links')
    var d3_text = d3_nodes.selectAll("text.mutation-label")
 

    // Setting shared attributes for the links 
    d3_links.selectAll('line.link')
      .data(root.links())
      .join('line')
      .classed('link', true)
      .style("transform", "translate(5, 20), scale(0.5)")
      .style("stroke-width", () => {
        if (distance_measure != "parent_child_distance") {
          return "2px";
        }
        else {
          return "5px";
        }
      })
      .attr('x1', d =>  { return d.source.x;})
      .attr('y1', d => { return d.source.y;})
      .attr('x2', d => { return d.target.x;})
      .attr('y2', d => { return d.target.y;});

    // Set shared attributes for the nodes 
    d3_nodes.selectAll("circle.node")
      .data(root.descendants())
      .join('circle')
      .classed('node', true)
      .style("transform", "translate(5, 20), scale(0.5)")
      .style("stroke-width", "1px")
      .attr('cx', (d) => {return d.x;})
      .attr('cy', function(d) {return d.y;})
      .attr('r', function(d) {
        if (distance_measure == "parent_child_distance") {
          return 6;
        }
        return 10;
      })
    
    // Displaying the labels for the nodes
    var labels = d3_text.data(root.descendants())
    .join("text")
    .classed("mutation-label", true)
    .attr("x", d => { 
      console.log(d.data.label);
      var currentNode = d;
      var parentNode = d.parent;
      if (parentNode) {
        var currentNodeX = d.x;
        var parentNodeX = parentNode.x;
        if (d.data.children == null) {
          if (currentNodeX < parentNodeX) {
            //return d.x - 50;
            return d.x - (d.data.label.length) * 4;
          }
          else if (currentNodeX > parentNodeX) {
            return d.x - 50;
          }
          else {
            return d.x - 5;
          }
        }
        else {
          if (currentNodeX < parentNodeX) {
            return d.x - Math.min(200, (d.data.label.length) * 5);
          }
          else if (currentNodeX > parentNodeX) {
            return d.x - Math.min(50, d.data.label.length * 2);
          }
          else {
            return d.x + 30;
          }
        }
      }
      else {
        return d.x + 30;
      }
    })
    .attr("y", d => { 
      if (d.data.children == null) {
        return d.y + 20; 
      }
      return d.y - 15; 
    })

    // Making each mutation a tspan
    var tspans = labels
    .selectAll("tspan")
    .data(d => {
      var str = d.data.label;
      str = remove_quotation(str);
      var lst = str.split(",");
      var newLst = [];
      lst.forEach(mutation => {
        newLst.push([mutation.trim(), d.x, d.y]);
      });
      return newLst;
    })
    .join('tspan')
    .classed(d => d[0] + "-mutation-hover-label", true)
    .text((d, i, j) => {
      if (i == j.length - 1) {
        return d[0];
      }
      return d[0] + ",";
    })

    .style("font-size", "0.60em")
    .style("font-family", "Monospace")
    .style("fill", (d) => {
      var tree1_mutations = jsonData.tree1_mutations; 
      var tree2_mutations = jsonData.tree2_mutations; 
      if (svg_names[i] == svg1) {
        if (tree1_mutations[d[0]]["contribution"] > 0) {
          return "red";
        } 
        return "black";
      }
      else if (svg_names[i] == svg2) {
        if (tree2_mutations[d[0]]["contribution"] > 0) {
          return "red";
        } 
        return "black";
      }
    })
    .on("click", (d, i) => { 
        var gene_url = "https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + i;
        window.open(gene_url, "_blank"); 
    })
    .attr("x", (d, i, j) => {
      var index = i;
      //return d[1] + ((d[0].length * 10) * (i%2)) + 10;
      if (index % 2 == 0) {
        return d[1] + 10;
      }
      console.log("Prev length:", j[i-1].__data__[0], j[i-1].__data__[0].length);
      return d[1] + (j[i-1].__data__[0].length + 10) * 3;
    })
    .attr("dy", (d, i, j) => {
      if (i % 2 == 0) {
        return "1.1em";
      }
    });
 
    if (svg_names[i] == "svg1") {
      t1_max_branching_factor = get_branching_factor(nodes1);
      t1_top5_mutations = get_top_n_mutations(jsonData.tree1_mutations, 5);
      fill_in_table("t1", t1_max_branching_factor, root.height, nodes1.length, mutations_tree1.length, t1_top5_mutations);
    }
    else {
      t2_max_branching_factor = get_branching_factor(nodes2);
      t2_top5_mutations = get_top_n_mutations(jsonData.tree1_mutations, 5);
      fill_in_table("t2", t2_max_branching_factor, root.height, nodes1.length, mutations_tree1.length, t2_top5_mutations);
    }
  
    // Set the coloring scheme based off of the distance measure
    switch (distance_measure) {
      case "ancestor_descendant_distance":
        distanceMeasureLabel.innerHTML = "Ancestor Descendant Distance: " + distance;
        pc_ad_d3_trees(root, d3_nodes, d3_links, "ad", t_max);
        break;
      case "caset_distance": 
        distanceMeasureLabel.innerHTML = "CASet Distance: " + distance;
        dist_caset_d3_trees(root, d3_nodes, d3_links, t_max);
        break;
      case "disc_distance": 
        distanceMeasureLabel.innerHTML = "DISC Distance: " + distance;
        dist_caset_d3_trees(root, d3_nodes, d3_links, t_max);
        break;
      case "parent_child_distance": 
        distanceMeasureLabel.innerHTML = "Parent-child Distance: " + distance;
        pc_ad_d3_trees(root, d3_nodes, d3_links, "pc", t_max);
        break;
      default:
        console.log("Please select a valid distance measure. If you have question email ealexander@carleton.edu");
        break;
    }
  }
}

submitTreesBtn.onclick = () => {
  submit_tree();
}

function getAllMutations(nodes) {
  var all_mutations = [];
  nodes.forEach(node => {
    var label = node.data.label;
    var mutations = label.split(",");
    mutations.forEach(mutation => {
      all_mutations.push(remove_quotation(mutation.trim()));
    });
  });  
  return all_mutations;
}

function intersect(a, b) {
  var aa = {};
  a.forEach(function(v) { aa[v]=1; });
  return b.filter(function(v) { return v in aa; });
}

function difference(arr1, arr2){
  return arr1.filter(x => !arr2.includes(x));
}

// Function that downloads the svgs as .svg files
function downloadSVG(svg) {
  var svg = document.querySelector(svg);
  var base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
  var a = document.createElement('a');
  var e = new MouseEvent('click');
  a.download = 'tree_download.svg';
  a.href = 'data:image/svg+xml;base64,' + base64doc;
  a.dispatchEvent(e);
}

// switches the icon for the input window onclick
$('.collapse').on('click', function(e) {
  $(this).toggleClass('expanded');
  $(this).next().toggleClass('bottombox');
  const isExpanded = $(this).hasClass('expanded');
  $(this).text(isExpanded ? '+' : '-');
});

// General toggle function
function toggle(id) {
    var x = document.getElementById(id);
    x.style.display = x.style.display == 'inline-block' ? 'none' : 'inline-block';
}

// toggle function for alread hidden elements
function toggleVisible(id) {
  var x = document.getElementById(id);
  x.style.display = x.style.display == 'none' ? 'inline-block' : 'none';
}

// toggle for visualization containers in multi-view
function vizbox(container, legend, buttonID, title) {
  var x = document.getElementById(container);
  var x2 = document.getElementById(legend);
  var y = document.getElementById(buttonID);
  var label = document.getElementById(title);
  if (x.style.display === "flex") {
      x.style.display = "none";
      x2.style.display = "none";
      label.style.display = "none"
      y.style.background = "#2C7A7A";
  } 
  else {
      x.style.display = "flex";
      x2.style.display = "block";
      label.style.display = "block"
      y.style.background = "#2C7A7A50";
  }
}


function singleView() {
  var x = document.getElementById("distance-dropdown");
  var x2 = document.getElementById("distance-buttons");
  var div = document.getElementById("anyviz");
  var legend = document.getElementById("anyscale");
  var y = document.getElementById("single");
  var y2 = document.getElementById("multiple");
  var hide1 = document.getElementById("viz1")
  var hide2 = document.getElementById("viz2")
  var hide3 = document.getElementById("viz3")
  var hide4 = document.getElementById("viz4")
  var scale1 = document.getElementById("scale1")
  var scale2 = document.getElementById("scale2")
  var scale3 = document.getElementById("scale3")
  var scale4 = document.getElementById("scale4")
  var label1 = document.getElementById("pc-label")
  var label2 = document.getElementById("ad-label")
  var label3 = document.getElementById("caset-label")
  var label4 = document.getElementById("disc-label")
  var button1 = document.getElementById("pc-view")
  var button2 = document.getElementById("ad-view")
  var button3 = document.getElementById("caset-view")
  var button4 = document.getElementById("disc-view")
  div.style.display = "flex";
  legend.style.display = "block";
  hide1.style.display = "none";
  hide2.style.display = "none";
  hide3.style.display = "none";
  hide4.style.display = "none";
  
  scale1.style.display = "none";
  scale2.style.display = "none";
  scale3.style.display = "none";
  scale4.style.display = "none";
  
  label1.style.display = "none";
  label2.style.display = "none";
  label3.style.display = "none";
  label4.style.display = "none";

  button1.style.color = "#F5F5F5"
  button1.style.background = "#2C7A7A";
  button2.style.color = "#F5F5F5"
  button2.style.background = "#2C7A7A";
  button3.style.color = "#F5F5F5"
  button3.style.background = "#2C7A7A";
  button4.style.color = "#F5F5F5"
  button4.style.background = "#2C7A7A";

  if (x.style.display === "none") {
      x.style.display = "inline-block";
      y.style.background = "#2C7A7A50";
      y.style.color = "black";
      y2.style.background = "#2C7A7A";
      y2.style.color = "#F5F5F5";
      x2.style.display = "none";
  }
  else {
      x.style.display = "none";
      x2.style.display = "none";
      y.style.background = "#2C7A7A";
      y.style.color = "#F5F5F5";
      y2.style.background = "#2C7A7A";
      y2.style.color = "#F5F5F5";
  }
}

function multiView() {
  var x = document.getElementById("distance-buttons");
  var x2 = document.getElementById("distance-dropdown")
  var div = document.getElementById("anyviz");
  var legend = document.getElementById("anyscale");
  var y = document.getElementById("multiple");
  var y2 = document.getElementById("single");
  div.style.display = "none";
  legend.style.display = "none"
  if (x.style.display === "inline-block") {
      x.style.display = "none";
      y.style.background = "#2C7A7A";
      y.style.color = "#F5F5F5";
      y2.style.background = "#2C7A7A";
      y2.style.color = "#F5F5F5";
      x2.style.display = "none";
  }
  else {
      x.style.display = "inline-block";
      x2.style.display = "none";
      y.style.background = "#2C7A7A50";
      y.style.color = "black";
      y2.style.background = "#2C7A7A";
      y2.style.color = "#F5F5F5";
  }
}

function get_branching_factor(nodes) {
  var max_branching_factor = d3.max(nodes, function(d) { 
    if (d.children) {
      return d.children.length;
    }
    return 0;
  });
  return max_branching_factor;
}

// tree_dict = jsonData.tree1_mutations
function get_top_n_mutations(tree_dict, n) {
  var mutation_contribution_dict = {};
  for (const [mutation, value] of Object.entries(tree_dict)) {
    mutation_contribution_dict[mutation] = value["contribution"];
  }
  var items = Object.keys(mutation_contribution_dict).map(
  (key) => { return [key, mutation_contribution_dict[key]] });
  items.sort(
    (first, second) => { return second[1] - first[1] } // from greatest to least
  );
  var keys = items.map((e) => { return e[0] });
  
  var output_str = ""
  for (v = 0; v < Math.min(n, keys.length); v++){
    output_str = output_str.concat(keys[v])
    if (v < Math.min(n, keys.length) - 1){
      output_str = output_str.concat(", ")
    }
  }
  console.log(tree_dict)
  return(output_str)
}

function max_contribution(nodes){
  return d3.max(nodes, function(d) { return d.data.contribution;});
}

function fill_tree_scale_color_legend(multi_tree_prefix = "", t_max) {
  var label1 = document.getElementById(`${multi_tree_prefix}_colorLabel1`);
  var label2 = document.getElementById(`${multi_tree_prefix}_colorLabel2`);
  var label3 = document.getElementById(`${multi_tree_prefix}_colorLabel3`);
  var label4 = document.getElementById(`${multi_tree_prefix}_colorLabel4`);

  label1.innerHTML = 0;
  label2.innerHTML = Math.round((t_max / 3) * 100) / 100; 
  label3.innerHTML = Math.round((t_max * 2 / 3) * 100) / 100; 
  label4.innerHTML = Math.round(t_max * 100) / 100; 
}

function fill_in_table(tree_name = "t1", max_branching_factor, height, num_nodes, num_mutations, top_5_mutations) {
  document.getElementById(`${tree_name}-height`).innerHTML = height;
  document.getElementById(`${tree_name}-branching-factor`).innerHTML = max_branching_factor;
  document.getElementById(`${tree_name}-number-nodes`).innerHTML = num_nodes;
  document.getElementById(`${tree_name}-number-mutations`).innerHTML = num_mutations;
  document.getElementById(`${tree_name}_top5_summary_element`).innerHTML = top_5_mutations;
}

function round_to_thousands(value){
  return (Math.round((value) * 1000) / 1000)
}

