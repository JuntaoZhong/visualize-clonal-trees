from graphviz import Source
import sys
import networkx as nx
from networkx.readwrite import json_graph
import json
import distance_measures.utils as utils

def ancestor_descendant(g_1, g_2):
    return len(ancestor_descendant_symmetric_difference(g_1, g_2))

def ancestor_descendant_symmetric_difference(g_1,g_2):
    set_1 = get_anc_desc_pairs(g_1)
    set_2 = get_anc_desc_pairs(g_2)
    return set_1.symmetric_difference(set_2)

def get_pair_differences(g_1,g_2):
    set_1 = get_anc_desc_pairs(g_1)
    set_2 = get_anc_desc_pairs(g_2)
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
        anc_mut = pair[0]
        desc_mut = pair[1]
        anc = get_node_from_mutation(g_1,anc_mut)
        desc = get_node_from_mutation(g_1,desc_mut)

        #ANCS---------------------------------------------------------
        dict_1[anc]["contribution"] = dict_1[anc]["contribution"] +1
        #MUT ANC----------------------------
        mutation_dict_1[anc_mut]["contribution"] = mutation_dict_1[anc_mut]["contribution"] +1  
        #DESC-----------------------------------------------------------------
        dict_1[desc]["contribution"] = dict_1[desc]["contribution"] +1
         #MUT DESC----------------------------
        mutation_dict_1[anc_mut]["contribution"] = mutation_dict_1[anc_mut]["contribution"] +1 

    for pair in dif_set_2:
        anc_mut = pair[0]
        desc_mut = pair[1]
        anc = get_node_from_mutation(g_2,anc_mut)
        desc = get_node_from_mutation(g_2,desc_mut)
        #ANCS---------------------------------------------------------
        dict_2[anc]["contribution"] = dict_2[anc]["contribution"] +1
        #MUT ANC----------------------------
        mutation_dict_2[anc_mut]["contribution"] = mutation_dict_2[anc_mut]["contribution"] +1  
        #DESC-----------------------------------------------------------------
        dict_2[desc]["contribution"] = dict_2[desc]["contribution"] +1
         #MUT DESC---------------------------
        mutation_dict_2[anc_mut]["contribution"] = mutation_dict_2[anc_mut]["contribution"] +1 

    return dict_1, dict_2, dist, mutation_dict_1, mutation_dict_2, node_to_mutation_dict_1, node_to_mutation_dict_2

def get_anc_desc_pairs(g):
    ''' Returns list of 2-tuples of nodes in g whose
        second element is a descendant of the first element '''
    # key = mutation 
    # value = ancestor set of mutation
    node_anc_dict = {}
    root = utils.get_root(g)
    node_anc_dict[root] = {root}
    # adds key-value pairs to dictionary
    mutation_anc_dict = fill_mutation_dict(g,root,node_anc_dict)
    # uses node_anc_dict to find ancestor-descendant pairs
    anc_desc_pairs = set()
    for desc in mutation_anc_dict:
        anc_list = mutation_anc_dict[desc]
        for anc in anc_list:
            anc_desc_pairs.add((anc, desc))
    # print("mut anc dict: " + str(mutation_anc_dict))
    return anc_desc_pairs

def fill_node_dict(g, node, node_anc_dict):
    ''' Recursively creates dictionary matching each node
        in g to its ancestor set '''
    for child in g.successors(node):
        child_anc_set = node_anc_dict[node].copy()
        child_anc_set.add(child)
        node_anc_dict[child] = child_anc_set
        node_anc_dict.update(fill_node_dict(g, child, node_anc_dict))
    return node_anc_dict

def fill_mutation_dict(g, node, dict):
    node_dict = fill_node_dict(g, node, dict)
    mutation_dict = {}
    for desc in node_dict:
        anc_set = node_dict[desc]
        desc_mutations = utils.get_mutations_from_node(g,desc)
        for desc_mutation in desc_mutations:
            desc_mutation_ancestors = []
            for anc in anc_set:
                # print('anc type: ')
                # print(type(anc))
                anc_mutations = utils.get_mutations_from_node(g,anc)
                desc_mutation_ancestors = desc_mutation_ancestors + anc_mutations
            mutation_dict[desc_mutation] = desc_mutation_ancestors
    
    # print("mutation dict: " + str(mutation_dict))
    return mutation_dict

# note to self; go back and make this function more efficient by
# storing mutation-node relationship when getting mutations from 
# node
def get_node_from_mutation(g, mutation):
    for node in g.nodes:
        if mutation in utils.get_mutations_from_node(g, node):
            return node

def ad_main(filename_1, filename_2):
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    dict_1, dict_2, distance, mutation_dict_1, mutation_dict_2, node_to_mutation_dict_1, node_to_mutation_dict_2 = get_contributions(g_1,g_2)
    nx.set_node_attributes(g_1,dict_1)
    nx.set_node_attributes(g_2,dict_2)
    print("This is the contents of t1.txt")
    print(open(filename_1, "r").read())
    print()
    print("This is the contents of t2.txt")
    print(open(filename_2, "r").read())
    print()
    print(g_1)
    data_1 = json_graph.tree_data(g_1, root=utils.get_root(g_1))
    data_2 = json_graph.tree_data(g_2, root=utils.get_root(g_2))
    return (data_1, data_2, distance, mutation_dict_1, mutation_dict_2, node_to_mutation_dict_1, node_to_mutation_dict_2)

if __name__=="__main__":
    # filename_1 = sys.argv[1]
    # filename_2 = sys.argv[2]
    filename_1 = "test1.txt"
    filename_2 = "test2.txt"
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    print(get_contributions(g_1,g_2))
    print('distance: ' + str(ancestor_descendant(g_1, g_2)))
