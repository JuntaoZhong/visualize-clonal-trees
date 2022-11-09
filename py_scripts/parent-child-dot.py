import pydot
import networkx

def read_dot_file(filename):
  graphs = pydot.graph_from_dot_file(filename)
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
  return len(symmetric_difference)
   
   
tree1_filename = "../examples/trees/tree3.dot" 
tree2_filename = "../examples/trees/tree4.dot" 
tree1 = read_dot_file(tree1_filename)
tree2 = read_dot_file(tree2_filename)
print(calculate_parent_child_distance(tree1, tree2))
