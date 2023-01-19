#!/bin/python3
from graphviz import Source
import sys
import networkx as nx

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

    dict_1 = {}
    dict_2 = {}

    for node in g_1.nodes:
        dict_1[node] = {}
        dict_1[node]["contribution"] = 0
    for node in g_2.nodes:
        dict_2[node] = {}
        dict_2[node]["contribution"] = 0

    for pair in dif_set_1:
        desc_mut = pair[1]
        desc = get_node_from_mutation(g_1,desc_mut)
        if desc in dict_1:
            dict_1[desc]["contribution"] += 1 
        else:
            teeny_dict = {}
            teeny_dict["contribution"] = 1
            dict_1[desc] = teeny_dict

    for pair in dif_set_2:
        desc_mut = pair[1]
        desc = get_node_from_mutation(g_2,desc_mut)
        if desc in dict_2:
            dict_2[desc]["contribution"] += 1
        else:
            teeny_dict = {}
            teeny_dict["contribution"] = 1
            dict_2[desc] = teeny_dict
    return dict_1, dict_2

def get_parent_child_pairs(g):
    ''' Returns list of 2-tuples of nodes in g whose
        second element is a descendant of the first element '''
    # key = mutation 
    # value = ancestor set of mutation
    queue = [get_root(g)]
    node_mutation_list = []
    while len(queue) >= 1:
        curr_node = queue.pop(0)
        children = g.successors(curr_node)
        queue.extend(list(children))
        for curr_mutation in get_mutations_from_node(g, curr_node):
            for child in g.successors(curr_node):
                for child_mutation in get_mutations_from_node(g, child):
                    node_mutation_list.append((curr_mutation, child_mutation))
    # print("node mutation list:", node_mutation_list)
    return node_mutation_list

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

def get_mutations_from_node(g, node):
    ''' Returns list of strings representing mutations at node'''
    label =  g.nodes[node]['label']
    label_list = label.split(",")
    label_list[0] = label_list[0][1:]
    label_list[len(label_list)-1] = label_list[len(label_list)-1][:len(label_list[len(label_list)-1])-1]
    return label_list

# note to self; go back and make this function more efficient by
# storing mutation-node relationship when getting mutations from 
# node
def get_node_from_mutation(g, mutation):
    for node in g.nodes:
        if mutation in get_mutations_from_node(g, node):
            return node

if __name__=="__main__":
    filename_1 = sys.argv[1]
    filename_2 = sys.argv[2]
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    print(get_contributions(g_1,g_2))