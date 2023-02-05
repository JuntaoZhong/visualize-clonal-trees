#!/bin/python3
from graphviz import Source
import sys
import networkx as nx
from networkx.readwrite import json_graph
import json
import distance_measures.utils as utils

def parent_child(g_1, g_2):
    return len(parent_child_symmetric_difference(g_1, g_2))

def parent_child_symmetric_difference(g_1,g_2):
    set_1 = get_parent_child_pairs(g_1)
    set_2 = get_parent_child_pairs(g_2)
    return set_1.symmetric_difference(set_2)

def get_pair_differences(g_1,g_2):
    set_1 = set(get_parent_child_pairs(g_1))
    set_2 = set(get_parent_child_pairs(g_2))
    dif_set_1 = set_1 - set_2
    dif_set_2 = set_2 - set_1
    return dif_set_1, dif_set_2

def get_contributions(g_1,g_2):
    '''returns two dictionaries where keys are nodes and values 
    are contributions according to get_pair_differences'''
    dif_set_1 = get_pair_differences(g_1,g_2)[0]
    dif_set_2 = get_pair_differences(g_1,g_2)[1]
    dist = len(dif_set_1) + len(dif_set_2)

    dict_1 = {}
    dict_2 = {}

    mutation_dict_1 = {}
    mutation_dict_2 = {}

    node_to_mutation_dict_1 = {}
    node_to_mutation_dict_2 = {}
    
    for node in g_1.nodes:
        dict_1[node] = {}
        dict_1[node]["contribution"] = 0
        mutation_list = utils.get_mutations_from_node(g_1,node)
        node_to_mutation_dict_1[node] = mutation_list
        for mutation in mutation_list:
            mutation_dict_1[mutation] = {}
            mutation_dict_1[mutation]["contribution"] = 0
    for node in g_2.nodes:
        dict_2[node] = {}
        dict_2[node]["contribution"] = 0
        mutation_list = utils.get_mutations_from_node(g_2,node)
        node_to_mutation_dict_2[node] = mutation_list
        for mutation in mutation_list:
            mutation_dict_2[mutation] = {}
            mutation_dict_2[mutation]["contribution"] = 0

    for pair in dif_set_1:
        desc_mut = pair[1]
        desc = utils.get_node_from_mutation(g_1,desc_mut)
        if desc in dict_1:
            dict_1[desc]["contribution"] += 1 
        # else:
        #     teeny_dict = {}
        #     teeny_dict["contribution"] = 1
        #     dict_1[desc] = teeny_dict
        if desc_mut in mutation_dict_1:
            mutation_dict_1[desc_mut]["contribution"] += 1 
        # else:
        #     teeny_dict = {}
        #     teeny_dict["contribution"] = 1
        #     mutation_dict_1[desc] = teeny_dict

    for pair in dif_set_2:
        desc_mut = pair[1]
        desc = utils.get_node_from_mutation(g_2,desc_mut)
        if desc in dict_2:
            dict_2[desc]["contribution"] += 1
        # else:
        #     teeny_dict = {}
        #     teeny_dict["contribution"] = 1
        #     dict_2[desc] = teeny_dict
        if desc_mut in mutation_dict_2:
            mutation_dict_2[desc_mut]["contribution"] += 1 
        # else:
        #     teeny_dict = {}
        #     teeny_dict["contribution"] = 1
        #     mutation_dict_2[desc] = teeny_dict
    return dict_1, dict_2, dist, mutation_dict_1, mutation_dict_2, node_to_mutation_dict_1, node_to_mutation_dict_2

def get_parent_child_pairs(g):
    ''' Returns list of 2-tuples of nodes in g whose
        second element is a descendant of the first element '''
    # key = mutation 
    # value = ancestor set of mutation
    queue = [utils.get_root(g)]
    node_mutation_list = []
    while len(queue) >= 1:
        curr_node = queue.pop(0)
        children = g.successors(curr_node)
        queue.extend(list(children))
        for curr_mutation in utils.get_mutations_from_node(g, curr_node):
            for child in g.successors(curr_node):
                for child_mutation in utils.get_mutations_from_node(g, child):
                    node_mutation_list.append((curr_mutation, child_mutation))
    # print("node mutation list:", node_mutation_list)
    return node_mutation_list

def pc_main(filename_1, filename_2):
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
    print(get_contributions(g_1,g_2))