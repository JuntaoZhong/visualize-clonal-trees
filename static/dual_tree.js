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
      console.log("in here.");
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
      console.log("here");
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
  var t_max1 = d3.max(nodes1, function(d) { return d.data.contribution;});
  //console.log(t_max1);

  var nodes2 = d3.hierarchy(tree2_data).descendants();
  var t_max2 = d3.max(nodes2, function(d) { return d.data.contribution;});
  //console.log(t_max2);

  var t_max = Math.max(t_max1,t_max2);

  var label1 = document.getElementById("colorLabel1");
  var label2 = document.getElementById("colorLabel2");
  var label3 = document.getElementById("colorLabel3");
  var label4 = document.getElementById("colorLabel4");

  label1.innerHTML = 0
  label2.innerHTML = Math.round((t_max / 3) * 100) / 100 
  label3.innerHTML = Math.round((t_max * 2 / 3) * 100) / 100 
  label4.innerHTML = Math.round(t_max * 100) / 100 
  
  var svg_names = ['svg1', 'svg2'];
  for (var i = 0; i < 2; i++) {
    var root = d3.hierarchy(data[i]);
    var tree = d3.tree().size([600, 400]);
    tree(root);

    var d3_nodes = d3.select('#' + svg_names[i] +  ' g.nodes')
    var d3_links = d3.select('#' + svg_names[i] +  ' g.links')

    // Setting shared attributes for the links 
    d3_links.selectAll('line.link')
      .data(root.links())
      .join('line')
      .classed('link', true)
      .style("transform", "translate(5, 20), scale(0.5)")
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
      .style("stroke", "black")
      .style("stroke-width", "3px")
      .attr('cx', function(d) {return d.x;})
      .attr('cy', function(d) {return d.y;})
      .attr('r', function(d) {
        labels_array = d.data.label.split(',');
        return Math.sqrt(labels_array.length) * 10;
      })

    // Displaying the labels for the nodes
    d3_nodes.selectAll("text.mutation-label")
      .data(root.descendants())
      .join("text")
      .classed("mutation-label", true)
      .attr("x", d => { 
        labels_array = d.data.label.split(',');
        return d.x + Math.sqrt(labels_array.length) * 15; 
      })
      .attr("y", d => { 
        labels_array = d.data.label.split(',');
        return d.y + Math.sqrt(labels_array.length) * 5; 
      })
      .text(d => {
        var str = d.data.label;
        str = remove_quotation(str);
        genes = str.split(", ");
        if (genes.length > 2) {
          return `${genes[0]}, ${genes[1]}...`
        }
        return str;
      })
      .on("click", (d, i) => { 
        var str = i.data.label;
        str = remove_quotation(str);
        var lst = str.split(", ");
        var gene_url;
        console.log(lst);
        lst.forEach(gene => {
          gene_url = "https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + gene;
          window.open(gene_url, "_blank"); 
        });
      });

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
      .style("stroke-width", "5px") 
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
  var edge_color_function = d => { return "black";}

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
      .style("stroke-width", "3px")

  d3_links.selectAll('line.link')
      .style("stroke", function(d) { return edge_color_function(d); })
      .style("transform", "translate(5, 20), scale(0.5)")
      .style("stroke-width", "5px") 
}

function submit_tree() {
  /*
    Send trees to api in order to get
    data for input into d3 visualizations
  */
  var tree1Input = tree1TextArea.value;
  var tree2Input = tree2TextArea.value;

  var baseURL = "http://localhost:5000/api/";
  var url = baseURL + distanceMetric.value + "?";
  var url_components = [url, "tree1=", tree1Input, "&tree2=", tree2Input]
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


