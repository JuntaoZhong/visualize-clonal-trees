import argparse
import pickle
from graphviz import Source
import sys
from networkx.readwrite import json_graph
import networkx as nx
import json
import utils

from utils import *

"""
CASet.py calculates pairwise CASet distances between all trees in an input file with 
one Newick string on each line.
Defaults to intersection distance.
Command line arguments:
[-o --outputFile file] [-u --union] [-p --pickle file] [-t --treePrint] [-m --minmax]
"""

def get_contributions(g_1, g_2):
    # maps each node to a contribution
    dict_1 = {}
    dict_2 = {}

    # maps each mutation to a node
    mutations_to_nodes_dict_1 = {}
    mutations_to_nodes_dict_2 = {}

    print(g_1)
    # filling dictionaries
    for node in g_1.nodes:
        dict_1[node] = {}
        dict_1[node]["contribution"] = 0
        print(node)
        for mutation in utils.get_mutations_from_node(g_1, node):
            mutations_to_nodes_dict_1[mutation] = node
    for node in g_2.nodes:
        dict_2[node] = {}
        dict_2[node]["contribution"] = 0
        for mutation in utils.get_mutations_from_node(g_2, node):
            mutations_to_nodes_dict_2[mutation] = node
    
    mutation_anc_dict_1 = {}
    root_1 = utils.get_root(g_1)
    mutation_anc_dict_1[root_1] = {root_1}
    mutation_anc_dict_1 = utils.fill_mutation_anc_dict(g_1, root_1, mutation_anc_dict_1)
    mutation_anc_dict_2 = {}
    root_2 = utils.get_root(g_2)
    mutation_anc_dict_2[root_2] = {root_2}
    mutation_anc_dict_2 = utils.fill_mutation_anc_dict(g_2, root_2, mutation_anc_dict_2)
    mutation_set_1 = set(mutations_to_nodes_dict_1.keys())
    mutation_set_2 = set(mutations_to_nodes_dict_2.keys())
    full_mutation_set = mutation_set_1.union(mutation_set_2)
    caset_distance = 0
    for mut_1 in full_mutation_set:
        for mut_2 in full_mutation_set:
            if (not mut_1 == mut_2):
                caset_1 = get_common_ancestor_set(mut_1, mut_2, mutation_anc_dict_1)
                caset_2 = get_common_ancestor_set(mut_1, mut_2, mutation_anc_dict_2)
                caset_union = caset_1.union(caset_2)
                x = len(caset_union)
                if not x==0:
                    caset_intersection = caset_1.intersection(caset_2)
                    y = len(caset_intersection)
                    jacc_dist = (x - y) / x
                    caset_set_minus_1 = caset_1.difference(caset_2)
                    caset_set_minus_2 = caset_2.difference(caset_1)
                    caset_distance += jacc_dist / 2
                    for mut in caset_set_minus_1:
                        dict_1[mutations_to_nodes_dict_1[mut]]["contribution"] += jacc_dist / len(caset_set_minus_1) / 2
                        # caset_distance += jacc_dist / len(caset_set_minus_1) / 2 
                    for mut in caset_set_minus_2:                
                        dict_2[mutations_to_nodes_dict_2[mut]]["contribution"] += jacc_dist / len(caset_set_minus_2) / 2
                        # caset_distance +=  jacc_dist / len(caset_set_minus_2) / 2
    m = len(full_mutation_set)
    dist = (1/(m*((m-1)/2)) * caset_distance) # m choose 2
    print(dist)
    return dict_1, dict_2

# def jacc(mutation_1, mutation_2, mutation_anc_dict_1, mutation_anc_dict_2):  

def get_common_ancestor_set(mutation_1, mutation_2, mutation_anc_dict):
    if(mutation_1 in mutation_anc_dict and mutation_2 in mutation_anc_dict):
        return set(mutation_anc_dict[mutation_1]).intersection(set(mutation_anc_dict[mutation_2]))
    else:
        return set()

def cs_main(filename_1, filename_2):
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    dict_1, dict_2 = get_contributions(g_1,g_2)
    nx.set_node_attributes(g_1,dict_1)
    nx.set_node_attributes(g_2,dict_2)
    data_1 = json_graph.tree_data(g_1, root=get_root(g_1))
    data_2 = json_graph.tree_data(g_2, root=get_root(g_2))
    return (data_1, data_2)

if __name__=="__main__":
    filename_1 = sys.argv[1]
    filename_2 = sys.argv[2]
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    dict_1, dict_2 = get_contributions(g_1,g_2)
    nx.set_node_attributes(g_1,dict_1)
    nx.set_node_attributes(g_2,dict_2)
    data_1 = json_graph.tree_data(g_1, root=get_root(g_1))
    data_2 = json_graph.tree_data(g_2, root=get_root(g_2))
    s_1 = json.dumps(data_1)
    s_2 = json.dumps(data_2)
    print(s_1)
    print(s_2)
