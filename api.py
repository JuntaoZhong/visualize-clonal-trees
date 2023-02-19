'''
    Tree CS COMPs
'''
import sys
import flask
import json
sys.path.append('py_scripts')
sys.path.append('distance_measures')
sys.path.append('input_conversion')
import check_input
import os
import pydot
import distance_measures.parent_child as pc_dot
import distance_measures.ancestor_descendant as ad_dot
import distance_measures.caset as cs_dot
import distance_measures.disc as disc_dot
import input_conversion.Newick_2_dot_2 as Newick_2_dot

api = flask.Blueprint('api', __name__)

def write_dot_tree_2_file(dot_tree_str, filename):
  with open(filename, "w") as f:
    f.write(dot_tree_str)

def calculation_contributions_and_node_mutation_relations(distance_measure):
  tree1_data = flask.request.args.get('tree1')
  tree2_data = flask.request.args.get('tree2')
  tree1_type = flask.request.args.get('treeType1')
  tree2_type = flask.request.args.get('treeType2')

  if tree1_type == "newick":
    tree1_data = Newick_2_dot.convert_newick_2_dot(tree1_data)
  if tree2_type == "newick":
    tree2_data = Newick_2_dot.convert_newick_2_dot(tree2_data)
  
  write_dot_tree_2_file(tree1_data, "t1.txt")
  write_dot_tree_2_file(tree2_data, "t2.txt")

  if distance_measure == "parent_child":
    calculated_values = pc_dot.pc_main("t1.txt", "t2.txt")
  elif distance_measure == "ancestor_descendant":
    calculated_values = ad_dot.ad_main("t1.txt", "t2.txt")
  elif distance_measure == "caset":
    calculated_values = cs_dot.cs_main("t1.txt", "t2.txt")
  elif distance_measure == "disc":
    calculated_values = disc_dot.disc_main("t1.txt", "t2.txt")
  else:
    print("Not a valid distance measure")
    exit(1)

  node_contribution_dict_1, node_contribution_dict_2, mutation_dict_1, mutation_dict_2, node_to_mutation_dict_1, node_to_mutation_dict_2, distance= calculated_values
  jsonObject = {"tree1_edges": node_contribution_dict_1, "tree2_edges": node_contribution_dict_2, "tree1_mutations": mutation_dict_1, "tree2_mutations": mutation_dict_2, "node_to_mutation1":node_to_mutation_dict_1, "node_to_mutation2":node_to_mutation_dict_2, "distance": distance}
  return(json.dumps(jsonObject))

@api.route('/parent_child_distance')
def run_parent_child_distance():
  """
  Required:
    - N/A 
  Returns:
    - JSON object containing edges involved in
      the calculation of parent-child distance

  Note:
    This url that invokes this route should have
    two GET parameters, one that includes the
    Newick string representing tree1 and a Newick
    string representing tree2 
  """
  return calculation_contributions_and_node_mutation_relations("parent_child")
  
@api.route('/ancestor_descendant_distance')
def run_ancestor_descendant_distance():
  return calculation_contributions_and_node_mutation_relations("ancestor_descendant")

@api.route('/caset_distance')
def run_caset_distance():
  return calculation_contributions_and_node_mutation_relations("caset")

@api.route('/disc_distance')
def run_disc_distance():
  return calculation_contributions_and_node_mutation_relations("disc")