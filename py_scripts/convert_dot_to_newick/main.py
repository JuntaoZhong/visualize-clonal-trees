import newick
import pydot
import networkx
import sys

def convert_dot_to_newick(filename):
  graphs = pydot.graph_from_dot_file(filename)
  graph = graphs[0]
  graph = networkx.drawing.nx_pydot.from_pydot(graph)
  # Get all the nodes.
  graph_nodes = [node for node in graph.nodes if "label" in graph.nodes[node]] 
  nodes = []
  nodes_dict = {} 
  for node in graph_nodes:
    newick_node = newick.Node(graph.nodes[node]["label"].replace("\"", ""))
    nodes.append(newick_node)
    nodes_dict[node] = newick_node 
  for edge in graph.edges:
    parent = f"{edge[0]}"  
    child = f"{edge[1]}"  
    parent_node = nodes_dict[parent] 
    child_node = nodes_dict[child] 
    parent_node.add_descendant(child_node)
  return nodes[0]


if __name__ == "__main__":
  filepath = sys.argv[1]
  tree = convert_dot_to_newick(filepath)
  f = open("converted_tree.txt", "w");
  f.write(newick.dumps(tree))
  

