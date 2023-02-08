import argparse
import pickle
from graphviz import Source
import sys
from networkx.readwrite import json_graph
import networkx as nx
import json

import distance_measures.utils as utils

"""
Defaults to intersection distance.
Command line arguments:
[-o --outputFile file] [-u --union] [-p --pickle file] [-t --treePrint] [-m --minmax]
"""

def get_contributions(g_1, g_2):
    '''returns three dictionaries for each tree: 
    node_contribution_dict, mutation_contribution_dict, node_to_mutation_dict
    and DISC distance between the trees
    '''
    node_contribution_dict_1, mutation_contribution_dict_1, node_to_mutation_dict_1 = utils.initialize_core_dictionaries(g_1)
    node_contribution_dict_2, mutation_contribution_dict_2, node_to_mutation_dict_2 = utils.initialize_core_dictionaries(g_2)

    mutation_anc_dict_1 = {}
    root_1 = utils.get_root(g_1)
    mutation_anc_dict_1[root_1] = {root_1}
    mutation_anc_dict_1 = fill_mutation_anc_dict(g_1, utils.get_root(g_1), mutation_anc_dict_1)
    mutation_anc_dict_2 = {}
    root_2 = utils.get_root(g_2)
    mutation_anc_dict_2[root_2] = {root_2}
    mutation_anc_dict_2 = fill_mutation_anc_dict(g_2, utils.get_root(g_2), mutation_anc_dict_2)
    mutation_set_1 = get_all_mutations(g_1)
    mutation_set_2 = get_all_mutations(g_2)
    full_mutation_set = mutation_set_1.union(mutation_set_2)
    caset_distance = 0
    m = len(full_mutation_set)
    for mut_1 in full_mutation_set:
        for mut_2 in full_mutation_set:
            if (not mut_1 == mut_2):
                disc_1 = get_distinct_ancestor_set(mut_1, mut_2, mutation_anc_dict_1)
                disc_2 = get_distinct_ancestor_set(mut_1, mut_2, mutation_anc_dict_2)
                disc_union = disc_1.union(disc_2)
                print("tree 1: ",mut_1,",",mut_2,":",disc_1)
                print("tree 2: ",mut_1,", ",mut_2,": ",disc_2)
                print(disc_union)
                x = len(disc_union)
                if not x==0:
                    disc_intersection = disc_1.intersection(disc_2)
                    y = len(disc_intersection)
                    jacc_dist = (x - y) / x
                    disc_set_minus_1 = disc_1.difference(disc_2)
                    disc_set_minus_2 = disc_2.difference(disc_1)
                    caset_distance += jacc_dist
                    for set_minus_1_mut in disc_set_minus_1:
                        node_contribution_dict_1[utils.get_node_from_mutation(g_1, set_minus_1_mut)]["contribution"] += jacc_dist / len(disc_set_minus_1) /(m*((m-1)))
                        mutation_contribution_dict_1[set_minus_1_mut]["contribution"] += jacc_dist / len(disc_set_minus_1) /(m*((m-1)))
                        # caset_distance += jacc_dist / len(caset_set_minus_1) / 2 
                    for set_minus_2_mut in disc_set_minus_2:                
                        node_contribution_dict_2[utils.get_node_from_mutation(g_2, set_minus_2_mut)]["contribution"] += jacc_dist / len(disc_set_minus_2) /(m*((m-1)))
                        mutation_contribution_dict_2[set_minus_2_mut]["contribution"] += jacc_dist / len(disc_set_minus_2) /(m*((m-1)))
                        # caset_distance +=  jacc_dist / len(caset_set_minus_2) / 2
    dc_distance = (1/(m*((m-1))) * caset_distance) # m choose 2
    print("meeeep", dc_distance, "\n")
    return node_contribution_dict_1, node_contribution_dict_2, mutation_contribution_dict_1, mutation_contribution_dict_2, node_to_mutation_dict_1, node_to_mutation_dict_2, dc_distance

# def jacc(mutation_1, mutation_2, mutation_anc_dict_1, mutation_anc_dict_2):  

def get_distinct_ancestor_set(mutation_1, mutation_2, mutation_anc_dict):
    if(mutation_1 in mutation_anc_dict and mutation_2 in mutation_anc_dict):
        return set(mutation_anc_dict[mutation_1]).difference(set(mutation_anc_dict[mutation_2]))
    elif(mutation_1 in mutation_anc_dict and not mutation_2 in mutation_anc_dict):
        return set(mutation_anc_dict[mutation_1])
    else:
        return set()

def fill_node_dict(g, node, node_anc_dict):
    ''' Recursively creates dictionary matching each node
        in g to its ancestor set '''
    for child in g.successors(node):
        child_anc_set = node_anc_dict[node].copy()
        child_anc_set.add(child)
        node_anc_dict[child] = child_anc_set
        node_anc_dict.update(fill_node_dict(g, child, node_anc_dict))
    return node_anc_dict

def fill_mutation_anc_dict(g, node, dict):
    node_dict = fill_node_dict(g, node, dict)
    mutation_dict = {}
    for desc in node_dict:
        anc_set = node_dict[desc]
        desc_mutations = get_mutations_from_node(g,desc)
        for desc_mutation in desc_mutations:
            desc_mutation_ancestors = []
            for anc in anc_set:
                anc_mutations = get_mutations_from_node(g,anc)
                desc_mutation_ancestors = desc_mutation_ancestors + anc_mutations
            mutation_dict[desc_mutation] = desc_mutation_ancestors
    return mutation_dict

def get_mutations_from_node(g, node):
    ''' Returns list of strings representing mutations at node'''
    label =  g.nodes[node]['label']
    label_list = label.split(",")
    #print("label list: " + str(label_list))
    label_list[0] = label_list[0][1:]
    #print("label list now: " + str(label_list))
    label_list[len(label_list)-1] = label_list[len(label_list)-1][:len(label_list[len(label_list)-1])-1]
    #print("and now: " + str(label_list))
    return label_list

def get_all_mutations(g):
    mutation_set = set()
    for node in g.nodes:
        mutation_set = mutation_set.union(set(utils.get_mutations_from_node(g, node)))
    return mutation_set

def disc_main(filename_1, filename_2):
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    dict_1, dict_2, distance, mutation_dict_1, mutation_dict_2, node_to_mutation_dict_1, node_to_mutation_dict_2 = get_contributions(g_1,g_2)
    nx.set_node_attributes(g_1,dict_1)
    nx.set_node_attributes(g_2,dict_2)
    data_1 = json_graph.tree_data(g_1, root=utils.get_root(g_1))
    data_2 = json_graph.tree_data(g_2, root=utils.get_root(g_2))
    return (data_1, data_2, distance, mutation_dict_1, mutation_dict_2, node_to_mutation_dict_1, node_to_mutation_dict_2)

if __name__=="__main__":
    filename_1 = sys.argv[1]
    filename_2 = sys.argv[2]
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    dict_1, dict_2, distance,mutation_dict_1, mutation_dict_2, node_to_mutation_dict_1, node_to_mutation_dict_2 = get_contributions(g_1,g_2)
    nx.set_node_attributes(g_1,dict_1)
    nx.set_node_attributes(g_2,dict_2)
    data_1 = json_graph.tree_data(g_1, root=utils.get_root(g_1))
    data_2 = json_graph.tree_data(g_2, root=utils.get_root(g_2))
    s_1 = json.dumps(data_1)
    s_2 = json.dumps(data_2)
    print(s_1)
    print(s_2)
