submitBtn = document.querySelector("#submit_trees_btn");
tree1TextArea = document.querySelector("#tree1"); 
tree2TextArea = document.querySelector("#tree2"); 
console.log(submitBtn);
submitBtn.onclick = () => {
  var baseURL = "http://localhost:5000/api/parent_child_distance?";
  var tree1Input = tree1TextArea.value; 
  var tree2Input = tree2TextArea.value; 
  var url_components = [baseURL, "tree1=", tree1Input, "&tree2=", tree2Input]
  var url = url_components.join("");
  console.log(url);
  fetch(url)
  .then(response => response.json())
  .then(jsonData => {
    tree1Edges = jsonData.tree1_edges
    tree1Data = {} 
    tree1Edges.forEach(edge => {
      child = {
                "name": edge.target
              }
      if (edge.source in tree1Data) {
        tree1Data[edge.source].push(child); 
      } 
      else {
        tree1Data[edge.source] = [child]
      }
    })
    console.log(jsonData);
    
  })
  
}
