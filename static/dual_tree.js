var tree1TextArea = document.querySelector("#tree1-text");
var tree2TextArea = document.querySelector("#tree2-text");
var tree1file = document.getElementById("file1");
var tree2file = document.getElementById("file2");
var inputTypeTree1 = document.getElementById("input-type-tree1");
var inputTypeTree2 = document.getElementById("input-type-tree2");
var submitTreesBtn = document.getElementById("submit-trees-btn");
var distanceMetric = document.getElementById("distance_metric");
var demoTreesBtn = document.getElementById("demo-trees-btn");
var distanceMeasureLabel = document.getElementById("distance-measure-label");
var coloring = ['#f0f172', '#80bda5', '#4180a9', '#00429d'];
var no_contribution_color = "black";
var contribution_color = "#DD6503";
var highlight_color = "red";
var mutation_table_color = "black";

window.onload = () => {
  submit_tree();
}

submitTreesBtn.onclick = () => {
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

function visualize_singleview(jsonData, distance_measure, dom_data) {
  console.log("poo")

  dom_data.shared_mutations.forEach(mutation => {
    dom_data.shared_label.innerHTML +=  
      `<span class="${mutation}-mutation-hover-label">${mutation}</span> `;
  })
  dom_data.t1_only_mutations.forEach(mutation => {
    dom_data.t1_label.innerHTML +=  
      `<span class="${mutation}-mutation-hover-label">${mutation}</span> `;
  })
  dom_data.t2_only_mutations.forEach(mutation => {
    dom_data.t2_label.innerHTML +=  
      `<span class="${mutation}-mutation-hover-label">${mutation}</span> `;
  })

  var tree1_data = jsonData.node_contribution_dict_1;
  var tree2_data = jsonData.node_contribution_dict_2;
  var data = [tree1_data, tree2_data]
  var distance = jsonData.distance;

  var spans = d3.selectAll("span");

  // Events for hovering over a mutation label
  spans.on('mouseover', (d) => {
      var items = d3.selectAll("." + d.target.className);
      items.style("color",highlight_color);
      items.style("fill", highlight_color);
      items.style("transition", "color 0.5s");
      items.style("cursor", "pointer");
      items.style("font-weight", "bold");
      items.style("font-size", "1.40em").style("transition", "font-size 0.5s");
  })
  spans.on('mouseout', (d) => {
      var items = d3.selectAll("." + d.target.className);
      items.style("transition", "color 0.5s");
      items.style("color", mutation_table_color);
      items.style("font-weight", "normal");
      items.style("font-size", (d, index, items) => {
        return items[index].localName == "span" ? "1em": "0.7em";
      });
      items.style("transition", "font-size 0.5s");
      items.style("fill", (data, index, items) => {
        return change_label_fill(data, items[index]);
      });
  })

  var t_max = Math.max(max_contribution(dom_data.t1_nodes), max_contribution(dom_data.t2_nodes));
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
    var svg1_nodes =  d3.select('#svg1 g.nodes')
    var svg1_links =  d3.select('#svg1 g.links')
    svg1_nodes
      .attr("transform", transform);  
    svg1_links
      .attr("transform", transform);
  };

  function zoomed2({transform}) {
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
      var currentNode = d;
      var parentNode = d.parent;
      if (parentNode) {
        var currentNodeX = d.x;
        var parentNodeX = parentNode.x;
        if (d.data.children == null) {
          if (currentNodeX < parentNodeX) {
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
    .selectAll("tspan")
    .data(d => {
      var str = d.data.label;
      str = remove_quotation(str);
      var lst = str.split(",");
      var newLst = [];
      lst.forEach(mutation => {
        var mutation_contribution_dict_1 = jsonData.mutation_contribution_dict_1; 
        var mutation_contribution_dict_2 = jsonData.mutation_contribution_dict_2; 
        newLst.push([mutation.trim(), d.x, d.y, mutation_contribution_dict_1, mutation_contribution_dict_2]);
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

    .style("font-size", "0.80em")
    .style("font-family", "Monospace")
    .style('font-weight', (d) => {
      var mutation_contribution_dict_1 = jsonData.mutation_contribution_dict_1; 
      var mutation_contribution_dict_2 = jsonData.mutation_contribution_dict_2; 
      console.log("max", (mutation_contribution_dict_1, d => d["contribution"]))
      var max1 = d3.max(Object.values(mutation_contribution_dict_1).map(d => d.contribution));
      var max2 = d3.max(Object.values(mutation_contribution_dict_2).map(d => d.contribution));
      if (svg_names[i] == "svg1") {
        if (mutation_contribution_dict_1[d[0]]["contribution"] > 0) {
          return mutation_contribution_dict_1[d[0]]["contribution"] / max1 * 900;
        } 
      }
      else if (svg_names[i] == "svg2") {
        if (mutation_contribution_dict_2[d[0]]["contribution"] > 0) {
          return mutation_contribution_dict_2[d[0]]["contribution"] / max2 * 900;
        } 
      }

      
    })
    .style("fill", (d) => {
      console.log(jsonData.mutation_contribution_dict_1);
      console.log(jsonData.mutation_contribution_dict_2);
      var mutation_contribution_dict_1 = jsonData.mutation_contribution_dict_1; 
      var mutation_contribution_dict_2 = jsonData.mutation_contribution_dict_2; 
      if (svg_names[i] == 'svg1') {
        if (mutation_contribution_dict_1[d[0]]["contribution"] > 0) {
          return contribution_color;
        } 
        return no_contribution_color;
      }
      else if (svg_names[i] == "svg2") {
        if (mutation_contribution_dict_2[d[0]]["contribution"] > 0) {
          return contribution_color;
        } 
        return no_contribution_color;
      }
    })
    .on("mouseover", (d, i) => {
      var items = d3.selectAll("." + i[0] + "-mutation-hover-label");
      items.style("color", highlight_color);
      items.style("fill", highlight_color);
      items.style("transition", "color 0.5s");
      items.style("cursor", "pointer");
      items.style("font-weight", "bold");
      items.style("font-size", "1.40em").style("transition", "font-size 0.5s");
    }) // Here is the hover thing
    .on("mouseout", (d,i) => {
      
      var items = d3.selectAll("." + i[0] + "-mutation-hover-label");
      items.style("transition", "color 0.5s");
      items.style("color", mutation_table_color);
      items.style("font-weight", "normal");
      items.style("font-size", (d, index, items) => {
        if (items[index].localName == "span") {
          return "1em"; 
        }
        return "0.7em";
      }).style("transition", "font-size 0.5s");
      items.style("fill", (d, index, items) => {
        if (items[index].localName == "span") {
          return mutation_table_color;
        }
        else {
          var tree = items[index].ownerSVGElement.id;
          var contribution = items[index].parentNode.__data__.data["contribution"];
          if (tree == 'svg1') {
            var mutation = items[index].__data__[0];
            var contribution = d[3][mutation]["contribution"];
            if (contribution > 0) {
              return contribution_color;
            }
            else {
              return no_contribution_color;
            }
          }
          else {
            var mutation = items[index].__data__[0];
            var contribution = d[4][mutation]["contribution"];
            if (contribution > 0) {
              return contribution_color;
            }
            else {
              return no_contribution_color;
            }
          }
        }
      });
    })
    .on("click", (d, i) => { 
        var gene_url = "https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + i[0];
        window.open(gene_url, "_blank"); 
    })
    .attr("x", (d, i, j) => {
      var index = i;
      if (index % 2 == 0) {
        return d[1] + 10;
      }
      return d[1] + (j[i-1].__data__[0].length + 10) * 3.5;
    })
    .attr("dy", (d, i, j) => {
      if (i % 2 == 0) {
        return "1.1em";
      }
    });
 
    if (svg_names[i] == "svg1") {
      t1_max_branching_factor = get_branching_factor(dom_data.t1_nodes);
      t1_top5_mutations = get_top_n_mutations(jsonData.mutation_contribution_dict_1, 5);
      fill_in_table("t1", t1_max_branching_factor, root.height, dom_data.t1_nodes.length, dom_data.t1_mutations.length, t1_top5_mutations);
    }
    else {
      t2_max_branching_factor = get_branching_factor(dom_data.t2_nodes);
      t2_top5_mutations = get_top_n_mutations(jsonData.mutation_contribution_dict_2, 5);
      fill_in_table("t2", t2_max_branching_factor, root.height, dom_data.t2_nodes.length, dom_data.t2_mutations.length, t2_top5_mutations);
    }

    // Set the coloring scheme based off of the distance measure
    switch (distanceMetric.value) {
      case "ancestor_descendant_distance":
        distanceMeasureLabel.innerHTML = "Ancestor Descendant Distance: " + distance;
        node_colored_tree(d3_nodes, d3_links, t_max);
        break;
      case "caset_distance": 
        distanceMeasureLabel.innerHTML = "CASet Distance: " + distance;
        node_colored_tree(d3_nodes, d3_links, t_max);
        break;
      case "disc_distance": 
        distanceMeasureLabel.innerHTML = "DISC Distance: " + distance;
        node_colored_tree(d3_nodes, d3_links, t_max);
        break;
      case "parent_child_distance": 
        distanceMeasureLabel.innerHTML = "Parent-child Distance: " + distance;
        edge_colored_tree(d3_nodes, d3_links, t_max);
        break;
      default:
        console.log("Please select a valid distance measure. If you have question email ealexander@carleton.edu");
        break;
    }
  }
}

// Coloring scheme for DIST, CASet, and ancestor descendant -> node based
function node_colored_tree(d3_nodes, d3_links, t_max) {
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

// Coloring scheme for parent child -> edge based
function edge_colored_tree(d3_nodes, d3_links, t_max) {
  d3_nodes.selectAll('circle.node').style("stroke", "black").style("fill", "#e6e6e3")

  d3_links.selectAll('line.link')
      .style("stroke", function(d) {
        var scale = d3.scaleLinear()
        .domain([0, t_max/3, 2*t_max/3, t_max])
        .range([coloring[0],coloring[1], coloring[2], coloring[3]]);
        return scale(d.target.data.contribution);
      })
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

  var baseURL = get_API_base_URL();
  var url = baseURL + distanceMetric.value + "?";
  var url_components = [url, "tree1=", tree1Input, "&tree2=", tree2Input, "&treeType1=", tree1Type, "&treeType2=", tree2Type]
  url = url_components.join("");

  fetch(url)
  .then(response => response.json())
  .then(json_data => {
     visualize("single", null, null, json_data, distanceMetric.value, null);
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

  var baseURL = get_API_base_URL();
  var url = baseURL + distance_measure + "?";
  var url_components = [url, "tree1=", tree1Input, "&tree2=", tree2Input, "&treeType1=", tree1Type, "&treeType2=", tree2Type]
  url = url_components.join("");

  fetch(url)
  .then(response => response.json())
  .then(json_data => {
     //visualize_multiview(jsonData, distance_measure, svg1, svg2, scale);
     visualize("multi", svg1, svg2, json_data, distance_measure, scale);
  });
}

function visualize_multiview(jsonData, distance_measure, svg1, svg2, scale, dom_data) {
  
  set_visualization_event_listeners(distance_measure);
  var tree1_data = jsonData.node_contribution_dict_1;
  var tree2_data = jsonData.node_contribution_dict_2;
  var data = [tree1_data, tree2_data]
  var distance = jsonData.distance;

  var t_max = Math.max(max_contribution(dom_data.t1_nodes), max_contribution(dom_data.t2_nodes));
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
        return change_edge_stroke_width(distance_measure);
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
    .attr("x", label => { 
      // Varies x depending on node position relative to others 
      return setX_label(label);
    })
    .attr("y", label => { 
      // Varies y depending on leave/inner node
      return label.data.childre == null ? label.y + 20: label.y - 15;
     
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
      var mutation_contribution_dict_1 = jsonData.mutation_contribution_dict_1; 
      var mutation_contribution_dict_2 = jsonData.mutation_contribution_dict_2; 
      if (svg_names[i] == svg1) {
        if (mutation_contribution_dict_1[d[0]]["contribution"] > 0) {
          return contribution_color;
        } 
        return no_contribution_color;
      }
      else if (svg_names[i] == svg2) {
        if (mutation_contribution_dict_2[d[0]]["contribution"] > 0) {
          return contribution_color;
        } 
        return no_contribution_color;
      }
    })
    .on("click", (d, i) => { 
        var gene_url = "https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + i;
        window.open(gene_url, "_blank"); 
    })
    .attr("x", (d, i, j) => {
      var index = i;
      if (index % 2 == 0) {
        return d[1] + 10;
      }
      return d[1] + (j[i-1].__data__[0].length + 10) * 3;
    })
    .attr("dy", (d, i, j) => {
      if (i % 2 == 0) {
        return "1.1em";
      }
    })
    .style('font-weight', (d) => {
      var mutation_contribution_dict_1 = jsonData.mutation_contribution_dict_1; 
      var mutation_contribution_dict_2 = jsonData.mutation_contribution_dict_2; 
      if (svg_names[i] == svg1) {
        if (mutation_contribution_dict_1[d[0]]["contribution"] > 0) {
          return mutation_contribution_dict_1["contribution"] * 100;
        } 
      }
      else if (svg_names[i] == svg2) {
        if (mutation_contribution_dict_2[d[0]]["contribution"] > 0) {
          return mutation_contribution_dict_2["contribution"] * 100;
        } 
      }
      
    })
    ;
 
    if (svg_names[i] == "svg1") {
      t1_max_branching_factor = get_branching_factor(dom_data.t1_nodes);
      t1_top5_mutations = get_top_n_mutations(jsonData.mutation_contribution_dict_1, 5);
      fill_in_table("t1", 
        t1_max_branching_factor, 
        root.height, 
        dom_data.t1_nodes.length, 
        dom_data.t1_mutations.length, 
        t1_top5_mutations);
    }
    else {
      t2_max_branching_factor = get_branching_factor(dom_data.t2_nodes);
      t2_top5_mutations = get_top_n_mutations(jsonData.mutation_contribution_dict_2, 5);
      fill_in_table("t2", 
        t2_max_branching_factor, 
        root.height, 
        dom_data.t2_nodes.length, 
        dom_data.t2_mutations.length, 
        t2_top5_mutations);
    }
  
    // Set the coloring scheme based off of the distance measure
    switch (distance_measure) {
      case "ancestor_descendant_distance":
        distanceMeasureLabel.innerHTML = "Ancestor Descendant Distance: " + distance;
        node_colored_tree(d3_nodes, d3_links, t_max);
        break;
      case "caset_distance": 
        distanceMeasureLabel.innerHTML = "CASet Distance: " + distance;
        node_colored_tree(d3_nodes, d3_links, t_max);
        break;
      case "disc_distance": 
        distanceMeasureLabel.innerHTML = "DISC Distance: " + distance;
        node_colored_tree(d3_nodes, d3_links, t_max);
        break;
      case "parent_child_distance": 
        distanceMeasureLabel.innerHTML = "Parent-child Distance: " + distance;
        edge_colored_tree(d3_nodes, d3_links, t_max);
        break;
      default:
        console.log("Please select a valid distance measure. If you have question email ealexander@carleton.edu");
        break;
    }
  }
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

// switches the icon for the input window onclick
$('.collapse').on('click', function(e) {
  $(this).toggleClass('expanded');
  $(this).next().toggleClass('bottombox');
  const isExpanded = $(this).hasClass('expanded');
  $(this).text(isExpanded ? '+' : '-');
});


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

function visualize(viewtype, svg1, svg2, json_data, distance_measure, scale) {

  set_visualization_event_listeners(distance_measure);
  var tree1_data = json_data.node_contribution_dict_1;
  var tree2_data = json_data.node_contribution_dict_2;
  var data = [tree1_data, tree2_data]
  var distance = json_data.distance;

  var t1_nodes = d3.hierarchy(tree1_data).descendants();
  var t1_mutations = getAllMutations(t1_nodes);
  var t1_label = document.getElementById("tree1-mutations");

  var t2_nodes = d3.hierarchy(tree2_data).descendants();
  var t2_mutations = getAllMutations(t2_nodes);
  var t2_label = document.getElementById("tree2-mutations");
  
  var shared_label = document.getElementById("shared-mutations");

  var shared_mutations = intersect(t1_mutations, t2_mutations);
  var t1_only_mutations = difference(t1_mutations, shared_mutations);
  var t2_only_mutations = difference(t2_mutations, shared_mutations);

  if (viewtype == "single") {
    shared_label.innerHTML='';
    t1_label.innerHTML='';
    t2_label.innerHTML='';
  }
  else {
    shared_label.innerHTML=shared_mutations;
    t1_label.innerHTML=t1_only_mutations;
    t2_label.innerHTML=t2_only_mutations;
  }

  var dom_data = {
    t1_nodes,
    t1_mutations,
    t1_label,
    
    t2_nodes,
    t2_mutations, 
    t2_label,

    shared_label,
    shared_mutations,
    t1_only_mutations,
    t2_only_mutations
  }

  if (viewtype == "single") {
    visualize_singleview(json_data, distance_measure, dom_data);
  }
  else {
    visualize_multiview(json_data, distance_measure, svg1, svg2, scale, dom_data);
  }
}

function singleView(dom_data) {

  multiview_elements = document.querySelectorAll(".multiview"); 
  multiview_elements.forEach(element => {
    element.style.display = "none";
  });

  dom_data.top_five.style.display = "";
  dom_data.div.style.display = "flex";
  dom_data.legend.style.display = "block";

  var dropdown_visible = (dom_data.distance_dropdown.style.display === "inline-block");
  dom_data.distance_dropdown.style.display = dropdown_visible? "none": "inline-block";
  dom_data.distance_btns.style.display = "none";
  dom_data.multiview_btn.style.background = "#2C7A7A";
  dom_data.multiview_btn.style.color = "#F5F5F5";
  dom_data.singleview_btn.style.background = dropdown_visible? 
                                               "#2C7A7A": 
                                               dom_data.singleview_btn.style.background;
  dom_data.singleview_btn.style.color = dropdown_visible? 
                                               "#F5F5F5": 
                                               dom_data.singleview_btn.style.color;
}

function displayInputOptions(viewtype){

  var distance_btns = document.getElementById("distance-buttons");
  var distance_dropdown = document.getElementById('distance-dropdown')
  var div = document.getElementById("anyviz");
  var legend = document.getElementById("anyscale");
  var singleview_btn = document.getElementById("single");
  var multiview_btn = document.getElementById("multiple");
  var top_five = document.getElementById("top_five");
  var top_five_label = document.getElementById("top_five_label");
  var top_five_tree_1 = document.getElementById("t1_top5_summary_element");
  var top_five_tree_2 = document.getElementById("t2_top5_summary_element");

  var dom_data = {
    distance_btns,
    distance_dropdown,
    div, 
    legend,
    singleview_btn,
    multiview_btn,
    top_five, top_five_label, 
    top_five_tree_1, top_five_tree_2
  }

  if (viewtype == "single") {
    singleView(dom_data);
  }
  else {
    multiView(dom_data);
  }
}

function multiView(dom_data) {

  multiview_elements = document.querySelectorAll(".multiview"); 
  multiview_elements.forEach(element => {
    if (element.localName == "button") {
      element.style.display = "block";
      element.style.color = "#F5F5F5"
      element.style.background = "#2C7A7A";
    }
  });

  dom_data.top_five.style.display = "none";
  dom_data.div.style.display = "none";
  dom_data.legend.style.display = "none"

  var btnsDisplayed = (dom_data.distance_btns.style.display === "inline-block");
  dom_data.distance_btns.style.display = btnsDisplayed? "none": "inline-block"; 
  dom_data.distance_dropdown.style.display = "none";
  dom_data.singleview_btn.style.background = "#2C7A7A";
  dom_data.singleview_btn.style.color = "#F5F5F5";
  dom_data.multiview_btn.style.background = btnsDisplayed? "#2C7A7A": "#2C7A7A50";
  dom_data.multiview_btn.style.color = btnsDisplayed? "black": "#F5F5F5";
}

