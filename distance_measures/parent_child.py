#!/bin/python3
from graphviz import Source
import sys
import networkx as nx
from networkx.readwrite import json_graph
import json
import distance_measures.utils as utils


def parent_child_symmetric_difference(g_1,g_2):
    pc_pair_set_1 = get_parent_child_pairs(g_1)
    pc_pair_set_2 = get_parent_child_pairs(g_2)
    return pc_pair_set_1.symmetric_difference(pc_pair_set_2)

def get_pair_differences(g_1,g_2):
    pc_pair_set_1 = set(get_parent_child_pairs(g_1))
    pc_pair_set_2 = set(get_parent_child_pairs(g_2))
    pc_distinct_set_1 = pc_pair_set_1 - pc_pair_set_2
    pc_distinct_set_2 = pc_pair_set_2 - pc_pair_set_1
    return  pc_distinct_set_1, pc_distinct_set_2

def get_contributions(g_1,g_2):
    '''returns three dictionaries for each tree: 
    node_contribution_dict, mutation_contribution_dict, node_mutations_dict
    and PC distance between the trees
    '''
    pc_distinct_set_1 = get_pair_differences(g_1,g_2)[0]
    pc_distinct_set_2 = get_pair_differences(g_1,g_2)[1]

    pc_distance = len(pc_distinct_set_2) + len(pc_distinct_set_2)

    node_contribution_dict_1, mutation_contribution_dict_1, node_mutations_dict_1 = utils.initialize_core_dictionaries(g_1)
    node_contribution_dict_2, mutation_contribution_dict_2, node_mutations_dict_2 = utils.initialize_core_dictionaries(g_2)

    for pair in pc_distinct_set_1:
        desc_mut = pair[1]
        anc_mut = pair[0]
        desc_node = utils.get_node_from_mutation(g_1,desc_mut)
        node_contribution_dict_1[desc_node]["contribution"] += 1 
        mutation_contribution_dict_1[anc_mut]["contribution"] += 1 

    for pair in pc_distinct_set_2:
        desc_mut = pair[1]
        anc_mut = pair[0]
        desc_node = utils.get_node_from_mutation(g_2,desc_mut)
        node_contribution_dict_2[desc_node]["contribution"] += 1
        mutation_contribution_dict_2[desc_mut]["contribution"] += 1 
        mutation_contribution_dict_2[anc_mut]["contribution"] += 1 
    print("pc_distance", pc_distance, "\n")
    return node_contribution_dict_1, node_contribution_dict_2, mutation_contribution_dict_1, mutation_contribution_dict_2, node_mutations_dict_1, node_mutations_dict_2, pc_distance

def get_parent_child_pairs(g):
    ''' Returns list of 2-tuples of nodes in g whose
        second element is a descendant of the first element '''
    # key is mutation 
    # value is ancestor set of mutation
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
    return node_mutation_list

def pc_main(filename_1, filename_2):
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    dict_1, dict_2, distance, mutation_dict_1, mutation_dict_2, node_mutations_dict_1, node_mutations_dict_2 = get_contributions(g_1,g_2)
    nx.set_node_attributes(g_1,dict_1)
    nx.set_node_attributes(g_2,dict_2)
    data_1 = json_graph.tree_data(g_1, root=utils.get_root(g_1))
    data_2 = json_graph.tree_data(g_2, root=utils.get_root(g_2))
    return (data_1, data_2, distance, mutation_dict_1, mutation_dict_2, node_mutations_dict_1, node_mutations_dict_2)

if __name__=="__main__":
    filename_1 = sys.argv[1]
    filename_2 = sys.argv[2]
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    print(get_contributions(g_1,g_2))