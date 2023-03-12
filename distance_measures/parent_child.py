"""
Functions to determine pair-child pairs in a graph and calculate parent-child distance between two graphs
and the contributions to that distance on a node and mutation basis.
"""
import sys
import networkx as nx
from networkx.readwrite import json_graph
import distance_measures.utils as utils

def get_contributions(g_1,g_2):
    """
    Required:
        - Two trees
    Returns:
        - Three dictionaries for each tree: 
            node_contribution_dict, mutation_contribution_dict, node_mutations_dict
            and PC distance between the trees
    Note:
        Primary core code for parent-child api route
    """
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
    print("\n","pc_distance", pc_distance)
    return node_contribution_dict_1, node_contribution_dict_2, mutation_contribution_dict_1, mutation_contribution_dict_2, node_mutations_dict_1, node_mutations_dict_2, pc_distance

def get_parent_child_pairs(g):
    """
    Required:
        - A tree
    Returns:
        - A list of the ancestor-descendant pairs (parent, child) in the tree
    Note:
        Used in get_contributions() .
    """
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

def get_pair_differences(g_1,g_2):
    """
    Required:
        - Two trees
    Returns:
        - Two lists: one containing the parent_child pairs in g_1, but not g_2 
            and one containing the parent-child pairs in g_2, but not g_1
    Note:
        Used in get_contributions()
    """
    pc_pair_set_1 = set(get_parent_child_pairs(g_1))
    pc_pair_set_2 = set(get_parent_child_pairs(g_2))
    pc_distinct_set_1 = pc_pair_set_1 - pc_pair_set_2
    pc_distinct_set_2 = pc_pair_set_2 - pc_pair_set_1
    return  pc_distinct_set_1, pc_distinct_set_2
