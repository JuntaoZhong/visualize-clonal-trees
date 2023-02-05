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
import input_conversion.Newick_2_dot as Newick_2_dot

api = flask.Blueprint('api', __name__)

def write_dot_tree_2_file(dot_tree_str, filename):
  temp_file = open(filename, "w")
  temp_file.write(dot_tree_str)
  temp_file.close()

@api.route('/showTreeFromDot/<dot_fname>')
def view_tree(dot_fname):
    dot_fpath = "examples/" + dot_fname

    str_cycle = check_input.cycle_detection(dot_fpath) # will be empty if no cycle

    print(str_cycle)

    if len(str_cycle) == 0:
        graph = pydot.graph_from_dot_file(dot_fpath)[0]
        graph.write_png('static/static-img/tree-display.png')

    return json.dumps(str_cycle)

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
  tree1_data = flask.request.args.get('tree1')
  tree2_data = flask.request.args.get('tree2')
  tree1_type = flask.request.args.get('treeType1')
  tree2_type = flask.request.args.get('treeType2')

  dot_tree1_file, dot_tree2_file = "t1.txt", "t2.txt" # dot formatted trees.

  if tree1_type == "Newick":
    tree1_data = Newick_2_dot.convert_newick_2_dot(tree1_data)
  # elif tree1_type == "DOT": // don't do anything to tree1_data

  if tree2_type == "Newick":
    tree2_data = Newick_2_dot.convert_newick_2_dot(tree1_data)
  
  write_dot_tree_2_file(tree1_data, dot_tree1_file)
  write_dot_tree_2_file(tree2_data, dot_tree2_file)

  data_1, data_2, distance = pc_dot.pc_main(dot_tree1_file, dot_tree2_file)
  jsonObject = {"tree1_edges": data_1, "tree2_edges": data_2, "distance": distance}
  print(json.dumps(jsonObject))
  return(json.dumps(jsonObject))
  
@api.route('/ancestor_descendant_distance')
def run_ancestor_descendant_distance():
  tree1_dot = flask.request.args.get('tree1') 
  tree2_dot = flask.request.args.get('tree2') 
  temp_t1 = open("t1.txt", "w")
  temp_t2 = open("t2.txt", "w")
  temp_t1.write(tree1_dot)
  temp_t2.write(tree2_dot)
  temp_t1.close()
  temp_t2.close()
  data_1, data_2, distance = ad_dot.ad_main("t1.txt", "t2.txt")
  jsonObject = {"tree1_edges": data_1, "tree2_edges": data_2, "distance": distance}
  print(json.dumps(jsonObject))
  return(json.dumps(jsonObject))

@api.route('/caset_distance')
def run_caset_distance():
  tree1_dot = flask.request.args.get('tree1') 
  tree2_dot = flask.request.args.get('tree2') 
  temp_t1 = open("t1.txt", "w")
  temp_t2 = open("t2.txt", "w")
  temp_t1.write(tree1_dot)
  temp_t2.write(tree2_dot)
  temp_t1.close()
  temp_t2.close()
  data_1, data_2, distance = cs_dot.cs_main("t1.txt", "t2.txt")
  jsonObject = {"tree1_edges": data_1, "tree2_edges": data_2, "distance": distance}
  print(json.dumps(jsonObject))
  return(json.dumps(jsonObject))

@api.route('/disc_distance')
def run_disc_distance():
  tree1_dot = flask.request.args.get('tree1') 
  tree2_dot = flask.request.args.get('tree2') 
  temp_t1 = open("t1.txt", "w")
  temp_t2 = open("t2.txt", "w")
  temp_t1.write(tree1_dot)
  temp_t2.write(tree2_dot)
  temp_t1.close()
  temp_t2.close()
  data_1, data_2, distance = disc_dot.disc_main("t1.txt", "t2.txt")
  jsonObject = {"tree1_edges": data_1, "tree2_edges": data_2, "distance": distance}
  print(json.dumps(jsonObject))
  return(json.dumps(jsonObject))
