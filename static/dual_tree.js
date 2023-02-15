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
// show = document.getElementById('show');
// hide1 = document.getElementById('hide1');
// form1 = document.getElementById('form1');

window.onload = () => {
  submit_tree();
}

tree1file.addEventListener("change", function () {
    var fr = new FileReader();
    fr.readAsText(this.files[0]);
    fr.onload = function () {
      // console.log(fr.result);
      tree1TextArea.value = fr.result
    };  
  });


tree2file.addEventListener("change", function () {
  var fr = new FileReader();
  fr.readAsText(this.files[0]);
  fr.onload = function () {
    // console.log(fr.result);
    tree2TextArea.value = fr.result
  };  
});

// show.addEventListener('click', function(){
//   form1.style = ('display: flex');
//   tree1TextArea.style = ('animation: riseHeight 1s .1s normal forwards');
//   hide.style = ('display: inline-block');
//   show.disabled = true;
// })


// hide.addEventListener('click', function() {
//   form1.style = ('display: none');
//   hide.style = ('display: none');
//   show.disabled = false;
// })


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
          div.html(i.data.contribution);
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
  var t_max1 = d3.max(nodes1, function(d) { return d.data.contribution;});
  //console.log(t_max1);

  var nodes2 = d3.hierarchy(tree2_data).descendants();
  var t_max2 = d3.max(nodes2, function(d) { return d.data.contribution;});
  var mutations_tree2 = getAllMutations(nodes2);
  var tree2_label = document.getElementById("tree2-mutations");
  
  var shared_label = document.getElementById("shared-mutations");
  shared_mutations = intersect(mutations_tree1, mutations_tree2);
  tree1_only_mutations = difference(mutations_tree1, shared_mutations);
  tree2_only_mutations = difference(mutations_tree2, shared_mutations);
  shared_label.innerHTML = shared_mutations;
  tree1_label.innerHTML = tree1_only_mutations;
  tree2_label.innerHTML = tree2_only_mutations;
  var tree_unique_mutations = [tree1_only_mutations, tree2_only_mutations];

  var t_max = Math.max(t_max1,t_max2);

  var label1 = document.getElementById("colorLabel1");
  var label2 = document.getElementById("colorLabel2");
  var label3 = document.getElementById("colorLabel3");
  var label4 = document.getElementById("colorLabel4");

  var visualization_container = document.querySelector(".visualizations-container > div");

  label1.innerHTML = 0;
  label2.innerHTML = Math.round((t_max / 3) * 100) / 100; 
  label3.innerHTML = Math.round((t_max * 2 / 3) * 100) / 100; 
  label4.innerHTML = Math.round(t_max * 100) / 100; 
  
  var svg1 = d3.select('#svg1')
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
    
      function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = 0, //parseFloat(text.attr("dy")),
                tspan = text.text(null)
                            .append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan")
                                .attr("x", 15)
                                .attr("y", y)
                                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                                .text(word);
                }
            }
        });
    }


    
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
    var tspans = labels
    .selectAll("tspan")
    .data(d => {
      var str = d.data.label;
      str = remove_quotation(str);
      var lst = str.split(",");
      var newLst = [];
      lst.forEach(mutation => {
        newLst.push(mutation.trim());
      });
      return newLst;
    })
    .join('tspan')
    .text((d, i, j) => {
      if (i == j.length - 1) {
        return d;
      }
      return d + ",";
    })
    .call(wrap, 25)
    .style("font-size", "0.60em")
    .style("font-family", "Monospace")
    .style("fill", (d) => {
      var tree1_mutations = jsonData.tree1_mutations; 
      var tree2_mutations = jsonData.tree2_mutations; 
      if (svg_names[i] == 'svg1') {
        if (tree1_mutations[d]["contribution"] > 0) {
          return "red";
        } 
        return "black";
      }
      else if (svg_names[i] == "svg2") {
        if (tree2_mutations[d]["contribution"] > 0) {
          return "red";
        } 
        return "black";
      }
    })
    .on("click", (d, i) => { 
        var gene_url = "https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + i;
        window.open(gene_url, "_blank"); 
    });

    // Get the summary statistics for both trees.
    var t2_max_branching_factor = d3.max(nodes2, function(d) { 
      if (d.children) {
        return d.children.length;
      }
      return 0;
    });

    var t1_max_branching_factor = d3.max(nodes1, function(d) { 
      if (d.children) {
        return d.children.length;
      }
      return 0;
    });
 
    if (svg_names[i] == "svg1") {
      var t1_height_summary_element = document.getElementById("t1-height")
      var t1_branching_factor_summary_element = document.getElementById("t1-branching-factor")
      var t1_num_nodes_summary_element = document.getElementById("t1-number-nodes");
      var t1_num_mutations_summary_element = document.getElementById("t1-number-mutations");
      var t1_height = root.height;
      t1_branching_factor_summary_element.innerHTML = t1_max_branching_factor; 
      t1_height_summary_element.innerHTML = t1_height;
      console.log("Edges", jsonData.tree1_edges);
      t1_num_nodes_summary_element.innerHTML = nodes1.length;
      t1_num_mutations_summary_element.innerHTML = mutations_tree1.length;
    }
    else {
      var t2_height_summary_element = document.getElementById("t2-height");
      var t2_branching_factor_summary_element = document.getElementById("t2-branching-factor");
      var t2_num_nodes_summary_element = document.getElementById("t2-number-nodes");
      var t2_num_mutations_summary_element = document.getElementById("t2-number-mutations");
      var t2_height = root.height;
      t2_branching_factor_summary_element.innerHTML = t2_max_branching_factor; 
      t2_height_summary_element.innerHTML = t1_height;
      t2_num_nodes_summary_element.innerHTML = nodes2.length;
      t2_num_mutations_summary_element.innerHTML = mutations_tree2.length;
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

function dist_caset_d3_trees(root, d3_nodes, d3_links, t_max) {

    d3_nodes.selectAll('circle.node')
      .style("fill", function(d) {
        //var nodes = root.descendants();

        var scale = d3.scaleLinear()
        .domain([0, t_max/3, 2*t_max/3, t_max])
        .range(["#ffffcc", "#a1dab4", "#41b6c4", "#225ea8"]);
        return scale(d.data.contribution);
        })

    d3_links.selectAll('line.link')
      .style("stroke", function(d) { 
        //var nodes = root.descendants();

        var scale = d3.scaleLinear()
        .domain([0, t_max/3, 2*t_max/3, t_max])
        .range(["#ffffcc", "#a1dab4", "#41b6c4", "#225ea8"]);
        return "black" //scale(d.target.data.contribution);
      }) 
}

function pc_ad_d3_trees(root, d3_nodes, d3_links, treetype, t_max) {

  // Coloring scheme for ancestor-descendant
  var node_color_function = d => { 
    var nodes = root.descendants();

    var scale = d3.scaleLinear()
    .domain([0, t_max/3, 2*t_max/3, t_max])
    .range(["#ffffcc", "#a1dab4", "#41b6c4", "#225ea8"]);
    return scale(d.data.contribution);

  }

   

  // Coloring scheme for parent-child
  if (treetype == "pc") {
    node_color_function = () => { return "#e6e6e3";}
    edge_color_function = d => {
      var nodes = root.descendants();

      var scale = d3.scaleLinear()
      .domain([0, t_max/3, 2*t_max/3, t_max])
      .range(["#ffffcc", "#a1dab4", "#41b6c4", "#225ea8"]);
      return scale(d.target.data.contribution);
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

submitTreesBtn.onclick = () => {
  submit_tree();
}

function getAllMutations(nodes) {
  var all_mutations = [];
  nodes.forEach(node => {
    var label = node.data.label;
    var mutations = label.split(", ");
    mutations.forEach(mutation => {
      all_mutations.push(remove_quotation(mutation));
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

function downloadSVGAsText() {
  var svg = document.querySelector('#svg1');
  var base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
  var a = document.createElement('a');
  var e = new MouseEvent('click');
  a.download = 'tree1_download.svg';
  a.href = 'data:image/svg+xml;base64,' + base64doc;
  a.dispatchEvent(e);
}

function downloadSVG2AsText() {
  var svg = document.querySelector('#svg2');
  var base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
  var a = document.createElement('a');
  var e = new MouseEvent('click');
  a.download = 'tree2_download.svg';
  a.href = 'data:image/svg+xml;base64,' + base64doc;
  a.dispatchEvent(e);
}

$('.collapse').on('click', function(e) {
  $(this).toggleClass('expanded');
  $(this).next().toggleClass('bottombox');
  const isExpanded = $(this).hasClass('expanded');
  $(this).text(isExpanded ? '+' : '-');
  });

function toggle(id) {
    var x = document.getElementById(id);
    x.style.display = x.style.display == 'inline-block' ? 'none' : 'inline-block';
}
function toggleVisible(id) {
  var x = document.getElementById(id);
  x.style.display = x.style.display == 'none' ? 'inline-block' : 'none';
}

var downloadSVG1 = document.querySelector('#downloadSVG1');
downloadSVG1.addEventListener('click', downloadSVGAsText);
var downloadSVG2 = document.querySelector('#downloadSVG2');
downloadSVG2.addEventListener('click', downloadSVG2AsText);



