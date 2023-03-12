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
