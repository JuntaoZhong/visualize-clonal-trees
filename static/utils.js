function remove_quotation(str) {
  let new_str = str
  while (new_str.indexOf('\"') > -1) {
    new_str = new_str.replace("\"", '')
  }
  return new_str
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

// General toggle function
function toggle(id) {
    var x = document.getElementById(id);
    x.style.display = x.style.display == 'inline-block' ? 'none' : 'inline-block';
}

// General untoggle function 
function toggleVisible(id) {
  var x = document.getElementById(id);
  x.style.display = x.style.display == 'none' ? 'inline-block' : 'none';
}

/**
 * Returns an integer representing the max branching factor of the tree.
 *
 * @param {array} nodes: Nodes of a clonal tree
 */
function get_branching_factor(nodes) {
  var max_branching_factor = d3.max(nodes, function(d) { 
    if (d.children) {
      return d.children.length;
    }
    return 0;
  });
  return max_branching_factor;
}

function max_contribution(nodes){
  return d3.max(nodes, function(d) { return d.data.contribution;});
}

/**
 * Returns a string containing the top n contributing mutations
 *
 * @param {integer} n: # of mutations you want listed
 */
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
  return(output_str)
}

/**
 * Returns a float rounded to the 3 decimals
 *
 * @param {float} value: The number you want to round
 */
function round_to_thousands(value){
  return (Math.round((value) * 1000) / 1000)
}

function change_label_fill(data, label) {
  if (label.localName == "span") {
    return mutation_table_color;
  }
  else {
    var tree = label.ownerSVGElement.id;
    var contribution = label.parentNode.__data__.data["contribution"];
    if (tree == 'svg1') {
      var mutation = label.__data__[0];
      var contribution = data[3][mutation]["contribution"];
      if (contribution > 0) {
        return contribution_color;
      }
      else {
        return no_contribution_color;
      }
    }
    else {
      var mutation = label.__data__[0];
      var contribution = data[4][mutation]["contribution"];
      if (contribution > 0) {
        return contribution_color;
      }
      else {
        return no_contribution_color;
      }
    }
  }
}

/**
 * Returns the appropriate stroke width for the edge
 *
 * @param {string} distance_measure: the distance measure being used to compare the clonal trees
 */
function change_edge_stroke_width(distance_measure) {
  return distance_measure == "parent_child_distance" ? "2px": "5px";
}

/**
 * Returns the x position for the label
 * 
 * @param {object} label: A tspan element 
 */
function setX_label(label) {
  var currentNode = label;
  var parentNode = label.parent;
  if (parentNode) {
    var currentNodeX = label.x;
    var parentNodeX = parentNode.x;
    if (label.data.children == null) {
      if (currentNodeX < parentNodeX) {
        return label.x - (label.data.label.length) * 4;
      }
      else if (currentNodeX > parentNodeX) {
        return label.x - 50;
      }
      else {
        return label.x - 5;
      }
    }
    else {
      if (currentNodeX < parentNodeX) {
        return label.x - Math.min(200, (label.data.label.length) * 5);
      }
      else if (currentNodeX > parentNodeX) {
        return label.x - Math.min(50, label.data.label.length * 2);
      }
      else {
        return label.x + 30;
      }
    }
  }
  else {
    return label.x + 30;
  }
}

/**
 * Returns the url of the API
 */
function get_API_base_URL() {
  var baseURL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/api/';
  return baseURL;
}

/**
 * Sets value of color legend depending on distance evaluation
 *
 * @param {string} multi_tree_prefix:  color legend to edit 
 * @param {float} t_max: the value of the highest contribution in the tree 
 */
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

/**
 * Sets values of the Summary Statistics table 
 *
 * @param {string} tree_name: the tree whose data is being populated
 * @param {integer} max_branching_factor: maximum branching factor of tree_name
 * @param {integer} height: height of tree_name 
 * @param {integer} num_nodes: number of nodes in tree_name 
 * @param {integer} num_mutations: number of mutations in tree_name 
 * @param {string} top_5_mutations: top 5 contributing mutations in tree_name 
 */
function fill_in_table(tree_name = "t1", max_branching_factor, height, num_nodes, num_mutations, top_5_mutations) {
  var height_entry = document.getElementById(`${tree_name}-height`); 
  var max_branching_factor_entry = document.getElementById(`${tree_name}-branching-factor`);
  height_entry.innerHTML = height;
  max_branching_factor_entry = max_branching_factor;
  document.getElementById(`${tree_name}-number-nodes`).innerHTML = num_nodes;
  document.getElementById(`${tree_name}-number-mutations`).innerHTML = num_mutations;
  document.getElementById(`${tree_name}_top5_summary_element`).innerHTML = top_5_mutations;
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
