import pydot
import networkx

def read_dot_file(filename):
  graphs = pydot.graph_from_dot_file(filename)
  print(graphs)
  graph = graphs[0]
  tree = networkx.drawing.nx_pydot.from_pydot(graph)
  print(tree.pred)
  return tree 

def get_parent_child_sets(tree):
  parent_child_relationships = tree.pred;
  cleaned_parent_child_relationships = []
  for node in parent_child_relationships:
    cur_preds = list(parent_child_relationships[node])
    if cur_preds:
      cleaned_parent_child_relationships.append((node, cur_preds[0]))
  return cleaned_parent_child_relationships 
    
def calculate_parent_child_distance(tree1, tree2): 
  tree1_set = set(get_parent_child_sets(tree1))
  tree2_set = set(get_parent_child_sets(tree2)) 
  symmetric_difference = tree1_set ^ tree2_set
  print(symmetric_difference)
  return (tree1_set, tree2_set, symmetric_difference, len(symmetric_difference))
