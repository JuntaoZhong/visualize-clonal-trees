import argparse
import pickle
from graphviz import Source
import sys
from networkx.readwrite import json_graph
import networkx as nx
import json
import distance_measures.utils as utils

def get_contributions(g_1, g_2):
    '''returns three dictionaries for each tree: 
    node_contribution_dict, mutation_contribution_dict, node_to_mutation_dict
    and CAset distance between the trees
    '''

    node_contribution_dict_1, mutation_contribution_dict_1, node_to_mutation_dict_1 = utils.initialize_core_dictionaries(g_1)
    node_contribution_dict_2, mutation_contribution_dict_2, node_to_mutation_dict_2 = utils.initialize_core_dictionaries(g_2)         
    
    #maps mutation to set of ancestor mutations within each tree
    mutation_anc_dict_1 = utils.make_mutation_anc_dict(g_1) 
    mutation_anc_dict_2 = utils.make_mutation_anc_dict(g_2)

    #calculate number_mutations for spreading out contribution
    mutation_set_1 = utils.get_all_mutations(g_1)
    mutation_set_2 = utils.get_all_mutations(g_2)
    full_mutation_set = mutation_set_1.union(mutation_set_2)
    number_mutations = len(full_mutation_set)

    #actual machinery for disc algorithm
    caset_distance = 0
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
                    caset_distance += jacc_dist / 2
                    for mutation in caset_set_minus_1:
                        mutation_contribution = jacc_dist / len(caset_set_minus_1) / 2 /(number_mutations*((number_mutations-1)/2))
                        node_contribution_dict_1[utils.get_node_from_mutation(g_1, mutation)]["contribution"] += mutation_contribution
                        mutation_contribution_dict_1[mutation]["contribution"] += mutation_contribution
                    for mutation in caset_set_minus_2: 
                        mutation_contribution = jacc_dist / len(caset_set_minus_2) / 2 /(number_mutations*((number_mutations-1)/2))              
                        node_contribution_dict_2[utils.get_node_from_mutation(g_2, mutation)]["contribution"] += mutation_contribution
                        mutation_contribution_dict_2[mutation]["contribution"] += mutation_contribution
    
    cs_distance = caset_distance/(number_mutations*((number_mutations-1)/2)) # caset_distance/(m choose 2)
    print("cs_distance", cs_distance, "\n")
    return node_contribution_dict_1, node_contribution_dict_2,mutation_contribution_dict_1, mutation_contribution_dict_2, node_to_mutation_dict_1, node_to_mutation_dict_2, cs_distance

def get_common_ancestor_set(mutation_1, mutation_2, mutation_anc_dict):
    if(mutation_1 in mutation_anc_dict and mutation_2 in mutation_anc_dict):
        return set(mutation_anc_dict[mutation_1]).intersection(set(mutation_anc_dict[mutation_2]))
    else:
        return set()

def cs_main(filename_1, filename_2):
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    dict_1, dict_2, distance,mutation_dict_1, mutation_dict_2, node_to_mutation_dict_1, node_to_mutation_dict_2 = get_contributions(g_1,g_2)
    nx.set_node_attributes(g_1,dict_1)
    nx.set_node_attributes(g_2,dict_2)
    data_1 = json_graph.tree_data(g_1, root=utils.get_root(g_1))
    data_2 = json_graph.tree_data(g_2, root=utils.get_root(g_2))
    return (data_1, data_2, distance,mutation_dict_1, mutation_dict_2, node_to_mutation_dict_1, node_to_mutation_dict_2)

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
