"""
Functions to determine common ancestor sets in a graph and calculate CASet distance between two graphs
and the contributions to that distance on a node and mutation basis.
"""
import sys
from networkx.readwrite import json_graph
import networkx as nx
import json
import distance_measures.utils as utils

def get_contributions(g_1, g_2):
    """
    Required:
        - Two trees
    Returns:
        - Three dictionaries for each tree: 
            node_contribution_dict, mutation_contribution_dict, node_mutations_dict
            and CAset distance between the trees
    Note:
        Primary core code for CASet api route
    """
    node_contribution_dict_1, mutation_contribution_dict_1, node_mutations_dict_1 = utils.initialize_core_dictionaries(g_1)
    node_contribution_dict_2, mutation_contribution_dict_2, node_mutations_dict_2 = utils.initialize_core_dictionaries(g_2)         
    
    #maps mutation to set of ancestor mutations within each tree
    mutation_anc_dict_1 = utils.make_mutation_anc_dict(g_1) 
    mutation_anc_dict_2 = utils.make_mutation_anc_dict(g_2)

    #calculate number_mutations for spreading out contribution
    mutation_set_1 = utils.get_all_mutations(g_1)
    mutation_set_2 = utils.get_all_mutations(g_2)
    full_mutation_set = mutation_set_1.union(mutation_set_2)
    number_mutations = len(full_mutation_set)

    #actual machinery for disc algorithm
    unscaled_caset_distance = 0
    for mut_1 in full_mutation_set:
        for mut_2 in full_mutation_set:
            if (not mut_1 == mut_2):
                caset_1 = get_common_ancestor_set(mut_1, mut_2, mutation_anc_dict_1)
                caset_2 = get_common_ancestor_set(mut_1, mut_2, mutation_anc_dict_2)
                caset_union = caset_1.union(caset_2)
                if not len(caset_union)==0:
                    caset_intersection = caset_1.intersection(caset_2)
                    jacc_dist = (len(caset_union) - len(caset_intersection)) / len(caset_union)
                    caset_set_minus_1 = caset_1.difference(caset_2)
                    caset_set_minus_2 = caset_2.difference(caset_1)

                    #order not important for mutations, so divide by 2 to avoid overcounting
                    unscaled_caset_distance += jacc_dist / 2

                    for mutation in caset_set_minus_1:
                        mutation_contribution = jacc_dist / len(caset_set_minus_1) / 2 /(number_mutations*((number_mutations-1)/2))
                        node_contribution_dict_1[utils.get_node_from_mutation(g_1, mutation)]["contribution"] += mutation_contribution
                        mutation_contribution_dict_1[mutation]["contribution"] += mutation_contribution
                    for mutation in caset_set_minus_2: 
                        mutation_contribution = jacc_dist / len(caset_set_minus_2) / 2 /(number_mutations*((number_mutations-1)/2))              
                        node_contribution_dict_2[utils.get_node_from_mutation(g_2, mutation)]["contribution"] += mutation_contribution
                        mutation_contribution_dict_2[mutation]["contribution"] += mutation_contribution
    
    cs_distance = unscaled_caset_distance/(number_mutations*((number_mutations-1)/2)) #scale based on number of mutations
    print("\n","cs_distance", cs_distance)
    return node_contribution_dict_1, node_contribution_dict_2,mutation_contribution_dict_1, mutation_contribution_dict_2, node_mutations_dict_1, node_mutations_dict_2, cs_distance

def get_common_ancestor_set(mutation_1, mutation_2, mutation_anc_dict):
    """
    Required:
        - Two mutations and the mutation-to-ancestors dictionary for some tree
    Returns:
        - the set of mutations that are ancestors of both mutation_1 and mutation_2
    Note:
        Called on each pair of mutations in get_contributions().
    """
    if(mutation_1 in mutation_anc_dict and mutation_2 in mutation_anc_dict):
        return set(mutation_anc_dict[mutation_1]).intersection(set(mutation_anc_dict[mutation_2]))
    else:
        return set()


