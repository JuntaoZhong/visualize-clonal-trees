import newick
import pydot
import networkx

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
  print(nodes_dict)
  for edge in graph.edges:
    parent = f"{edge[0]}"  
    child = f"{edge[1]}"  
    parent_node = nodes_dict[parent] 
    child_node = nodes_dict[child] 
    parent_node.add_descendant(child_node)

convert_dot_to_newick("../../examples/trees/tree1.dot")
# convert_dot_to_newick("../../distance_measures/test1.txt")

