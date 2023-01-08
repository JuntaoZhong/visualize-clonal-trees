from graphviz import Source
import sys
import networkx as nx

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

# def get_contributions(g_1,g_2):
#     '''returns two dictionaries where keys are nodes and values 
#     are contributions according to get_pair_differences'''
#     dif_set_1 = get_pair_differences(g_1,g_2)[0]
#     dif_set_2 = get_pair_differences(g_1,g_2)[1]
#     dict_1 = {}
#     dict_2 = {}
#     for pair in dif_set_1:
#         anc = pair[0]
#         desc = pair[1]
#         if anc in dict_1:
#             dict_1[anc]["contribution"] = dict_1[anc]["contribution"] +1
#         else:
#             teeny_dict = {}
#             teeny_dict["contribution"] = 1
#             dict_1[anc] = teeny_dict
#         if desc in dict_1:
#             dict_1[desc]["contribution"] = dict_1[desc]["contribution"] +1
#         else:
#             teeny_dict = {}
#             teeny_dict["contribution"] = 1
#             dict_1[desc] = teeny_dict
#     for pair in dif_set_2:
#         anc = pair[0]
#         desc = pair[1]
#         if anc in dict_2:
#             dict_2[anc]["contribution"] = dict_2[anc]["contribution"] +1
#         else:
#             teeny_dict = {}
#             teeny_dict["contribution"] = 1
#             dict_2[anc] = teeny_dict
#         if desc in dict_2:
#             dict_2[desc]["contribution"] = dict_2[desc]["contribution"] +1
#         else:
#             teeny_dict = {}
#             teeny_dict["contribution"] = 1
#             dict_2[desc] = teeny_dict
#     return dict_1, dict_2
def get_contributions(g_1,g_2):
    '''returns two dictionaries where keys are nodes and values 
    are contributions according to get_pair_differences'''
    dif_set_1 = get_pair_differences(g_1,g_2)[0]
    dif_set_2 = get_pair_differences(g_1,g_2)[1]

    dict_1 = {}
    dict_2 = {}

    for node in g_1.nodes:
        dict_1[node] = {}
        dict_1[node]["contribution"] = 0
    for node in g_2.nodes:
        dict_2[node] = {}
        dict_2[node]["contribution"] = 0

    for pair in dif_set_1:
        anc_mut = pair[0]
        desc_mut = pair[1]
        anc = get_node_from_mutation(g_1,anc_mut)
        desc = get_node_from_mutation(g_1,desc_mut)
        if anc in dict_1:
            dict_1[anc]["contribution"] = dict_1[anc]["contribution"] +1
        else:
            teeny_dict = {}
            teeny_dict["contribution"] = 1
            dict_1[anc] = teeny_dict
        if desc in dict_1:
            dict_1[desc]["contribution"] = dict_1[desc]["contribution"] +1
        else:
            teeny_dict = {}
            teeny_dict["contribution"] = 1
            dict_1[desc] = teeny_dict
    for pair in dif_set_2:
        anc_mut = pair[0]
        desc_mut = pair[1]
        anc = get_node_from_mutation(g_2,anc_mut)
        desc = get_node_from_mutation(g_2,desc_mut)
        if anc in dict_2:
            dict_2[anc]["contribution"] = dict_2[anc]["contribution"] +1
        else:
            teeny_dict = {}
            teeny_dict["contribution"] = 1
            dict_2[anc] = teeny_dict
        if desc in dict_2:
            dict_2[desc]["contribution"] = dict_2[desc]["contribution"] +1
        else:
            teeny_dict = {}
            teeny_dict["contribution"] = 1
            dict_2[desc] = teeny_dict
    return dict_1, dict_2

# def get_anc_desc_pairs(g):
#     ''' Returns list of 2-tuples of nodes in g whose
#         second element is a descendant of the first element '''
#     # key = node 
#     # value = ancestor set of node
#     node_anc_dict = {}
#     root = get_root(g)
#     node_anc_dict[root] = {root}
#     # adds key-value pairs to dictionary
#     node_anc_dict = fill_dict(g,root,node_anc_dict)
#     # uses node_anc_dict to find ancestor-descendant pairs
#     anc_desc_pairs = set()
#     for desc in node_anc_dict:
#         anc_set = node_anc_dict[desc]
#         for anc in anc_set:
#             anc_desc_pairs.add((anc, desc))
#     return anc_desc_pairs

def get_anc_desc_pairs(g):
    ''' Returns list of 2-tuples of nodes in g whose
        second element is a descendant of the first element '''
    # key = mutation 
    # value = ancestor set of mutation
    node_anc_dict = {}
    root = get_root(g)
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

def get_root(g):
    ''' Returns node with in-degree 0. Exits and
        prints error if multiple such nodes exist '''
    root_candidates = set(g.nodes)
    all_nodes = g.nodes
    for a in all_nodes:
        for b in g.successors(a):
            if b in root_candidates:
                root_candidates.remove(b)
    if len(root_candidates) == 0:
        print('Error: input graph has a cycle')
        exit()
    elif len(root_candidates) >1:
        print('Error: input graph has multiple roots')
        exit()
    else:
        (root,) = root_candidates
        return root
    
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
        desc_mutations = get_mutations_from_node(g,desc)
        for desc_mutation in desc_mutations:
            desc_mutation_ancestors = []
            for anc in anc_set:
                # print('anc type: ')
                # print(type(anc))
                anc_mutations = get_mutations_from_node(g,anc)
                desc_mutation_ancestors = desc_mutation_ancestors + anc_mutations
            mutation_dict[desc_mutation] = desc_mutation_ancestors
    
    # print("mutation dict: " + str(mutation_dict))
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

# note to self; go back and make this function more efficient by
# storing mutation-node relationship when getting mutations from 
# node
def get_node_from_mutation(g, mutation):
    for node in g.nodes:
        if mutation in get_mutations_from_node(g, node):
            return node

if __name__=="__main__":
    # filename_1 = sys.argv[1]
    # filename_2 = sys.argv[2]
    filename_1 = "test1.txt"
    filename_2 = "test2.txt"
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    print(get_contributions(g_1,g_2))
    print('distance: ' + str(ancestor_descendant(g_1, g_2)))