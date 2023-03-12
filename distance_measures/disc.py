"""
Functions to determine distinctly inhereted ancestor sets in a graph and calculate DISC distance between two graphs
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
            and DISC distance between the trees
    Note:
        Primary core code for DISC api route
    """
    node_contribution_dict_1, mutation_contribution_dict_1, node_mutations_dict_1 = utils.initialize_core_dictionaries(g_1)
    node_contribution_dict_2, mutation_contribution_dict_2, node_mutations_dict_2 = utils.initialize_core_dictionaries(g_2)

    #maps mutation to set of ancestor mutationsv within each tree
    mutation_anc_dict_1 = utils.make_mutation_anc_dict(g_1) 
    mutation_anc_dict_2 = utils.make_mutation_anc_dict(g_2)

    #calculate number_mutations for spreading out contribution 
    mutation_set_1 = utils.get_all_mutations(g_1)
    mutation_set_2 = utils.get_all_mutations(g_2)
    full_mutation_set = mutation_set_1.union(mutation_set_2)
    number_mutations = len(full_mutation_set)

    #actual machinery for disc algorithm
    unscaled_disc_distance = 0 
    for mut_1 in full_mutation_set:
        for mut_2 in full_mutation_set:
            if (not mut_1 == mut_2):
                disc_1 = get_distinct_ancestor_set(mut_1, mut_2, mutation_anc_dict_1)
                disc_2 = get_distinct_ancestor_set(mut_1, mut_2, mutation_anc_dict_2)
                disc_union = disc_1.union(disc_2)
                #avoid divide by zero errors
                if not len(disc_union)==0: 
                    disc_intersection = disc_1.intersection(disc_2)
                    jacc_dist = (len(disc_union) - len(disc_intersection)) / len(disc_union)
                    disc_1_set_minus_2 = disc_1.difference(disc_2)
                    disc_2_set_minus_1 = disc_2.difference(disc_1)
                    unscaled_disc_distance += jacc_dist
                    #tree 1 contributions
                    for set_minus_1_mut in disc_1_set_minus_2:
                        node_contribution_dict_1[utils.get_node_from_mutation(g_1, set_minus_1_mut)]["contribution"] += jacc_dist / len(disc_1_set_minus_2) /(number_mutations*((number_mutations-1)))
                        mutation_contribution_dict_1[set_minus_1_mut]["contribution"] += jacc_dist / len(disc_1_set_minus_2) /(number_mutations*((number_mutations-1)))
                    #tree 2 contributions
                    for set_minus_2_mut in disc_2_set_minus_1:                
                        node_contribution_dict_2[utils.get_node_from_mutation(g_2, set_minus_2_mut)]["contribution"] += jacc_dist / len(disc_2_set_minus_1) /(number_mutations*((number_mutations-1)))
                        mutation_contribution_dict_2[set_minus_2_mut]["contribution"] += jacc_dist / len(disc_2_set_minus_1) /(number_mutations*((number_mutations-1)))
    
    dc_distance = (1/(number_mutations*((number_mutations-1))) * unscaled_disc_distance) #scale dist based on number of mutations
    print("\n","dc_distance", dc_distance)
    return node_contribution_dict_1, node_contribution_dict_2, mutation_contribution_dict_1, mutation_contribution_dict_2, node_mutations_dict_1, node_mutations_dict_2, dc_distance

def get_distinct_ancestor_set(mutation_1, mutation_2, mutation_anc_dict):
    """
    Required:
        - Two mutations and the mutation-to-ancestors dictionary for some tree
    Returns:
        - the set of mutations that are ancestors of mutation_1 but not mutation_2
    Note:
        Called on each pair of mutations in get_contributions().
    """
    if(mutation_1 in mutation_anc_dict and mutation_2 in mutation_anc_dict):
        return set(mutation_anc_dict[mutation_1]).difference(set(mutation_anc_dict[mutation_2]))
    elif(mutation_1 in mutation_anc_dict and not mutation_2 in mutation_anc_dict):
        return set(mutation_anc_dict[mutation_1])
    else:
        return set()

