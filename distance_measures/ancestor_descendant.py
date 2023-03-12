"""
Functions to determine ancestor-descendant pairs in a graph and calculate ancestor-descendant distance between two graphs
and the contributions to that distance on a node and mutation basis.
"""
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
            and AD distance between the trees
    Note:
        Primary core code for ancestor-descendant api route
    """
    pair_differences = get_pair_differences(g_1,g_2)
    ad_distinct_set_1 = pair_differences[0]
    ad_distinct_set_2 = pair_differences[1]

    ad_distance = len(ad_distinct_set_1) + len(ad_distinct_set_2)

    node_contribution_dict_1, mutation_contribution_dict_1, node_mutations_dict_1 = utils.initialize_core_dictionaries(g_1)
    node_contribution_dict_2, mutation_contribution_dict_2, node_mutations_dict_2 = utils.initialize_core_dictionaries(g_2)

    for pair in ad_distinct_set_1:
        anc_mut = pair[0]
        desc_mut = pair[1]
        anc_node = utils.get_node_from_mutation(g_1,anc_mut)
        desc_node = utils.get_node_from_mutation(g_1,desc_mut)

        #NODE ANC---------------------------------------------------------
        node_contribution_dict_1[anc_node]["contribution"] = node_contribution_dict_1[anc_node]["contribution"] +1
        #MUT ANC---------------------------------------------------------
        mutation_contribution_dict_1[anc_mut]["contribution"] = mutation_contribution_dict_1[anc_mut]["contribution"] +1  
        #NODE DESC---------------------------------------------------------
        node_contribution_dict_1[desc_node]["contribution"] = node_contribution_dict_1[desc_node]["contribution"] +1
        #MUT DESC---------------------------------------------------------
        mutation_contribution_dict_1[anc_mut]["contribution"] = mutation_contribution_dict_1[anc_mut]["contribution"] +1 

    for pair in ad_distinct_set_2:
        anc_mut = pair[0]
        desc_mut = pair[1]
        anc_node = utils.get_node_from_mutation(g_2,anc_mut)
        desc_node = utils.get_node_from_mutation(g_2,desc_mut)
        #ANCS---------------------------------------------------------
        node_contribution_dict_2[anc_node]["contribution"] = node_contribution_dict_2[anc_node]["contribution"] +1
        #MUT ANC---------------------------------------------------------
        mutation_contribution_dict_2[anc_mut]["contribution"] = mutation_contribution_dict_2[anc_mut]["contribution"] +1  
        #DESC---------------------------------------------------------
        node_contribution_dict_2[desc_node]["contribution"] = node_contribution_dict_2[desc_node]["contribution"] +1
        #MUT DESC---------------------------------------------------------
        mutation_contribution_dict_2[anc_mut]["contribution"] = mutation_contribution_dict_2[anc_mut]["contribution"] +1 
    print("\n","ad_distance", ad_distance)
    return node_contribution_dict_1, node_contribution_dict_2, mutation_contribution_dict_1, mutation_contribution_dict_2, node_mutations_dict_1, node_mutations_dict_2, ad_distance

def get_pair_differences(g_1,g_2):
    """
    Required:
        - Two trees
    Returns:
        - Two lists: one containing the ancestor-descendant pairs in g_1, but not g_2 
            and one containing the ancestor-descendant pairs in g_2, but not g_1
    Note:
        Used in get_contributions()
    """
    ad_pair_set_1 = get_anc_desc_pairs(g_1)
    ad_pair_set_2 = get_anc_desc_pairs(g_2)
    ad_distinct_set_1 = ad_pair_set_1 - ad_pair_set_2
    ad_distinct_set_2 = ad_pair_set_2 - ad_pair_set_1
    return ad_distinct_set_1, ad_distinct_set_2

def get_anc_desc_pairs(g):
    """
    Required:
        - A tree
    Returns:
        - A list of the ancestor-descendant pairs (ancestor, descendant) in the tree
    Note:
        Used in get_contributions() .
    """
    node_anc_dict = {}
    root = utils.get_root(g)
    node_anc_dict[root] = {root}
    # adds key-value pairs to dictionary
    mutation_anc_dict = utils.fill_mutation_dict(g,root,node_anc_dict)
    # uses node_anc_dict to find ancestor-descendant pairs
    anc_desc_pairs = set()
    for desc in mutation_anc_dict:
        anc_list = mutation_anc_dict[desc]
        for anc in anc_list:
            anc_desc_pairs.add((anc, desc))

    return anc_desc_pairs

