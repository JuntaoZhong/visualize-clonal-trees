import argparse
import pickle
from graphviz import Source
import sys
from networkx.readwrite import json_graph
import networkx as nx

from utils import *

def get_contributions(g_1, g_2):
    dict_1 = {}
    dict_2 = {}
    for node in g_1.nodes:
        dict_1[node] = {}
        dict_1[node]["contribution"] = 0
    for node in g_2.nodes:
        dict_2[node] = {}
        dict_2[node]["contribution"] = 0
    # print(dict_1)
    mutation_anc_dict_1 = {}
    root_1 = get_root(g_1)
    mutation_anc_dict_1[root_1] = {root_1}
    mutation_anc_dict_1 = fill_mutation_anc_dict(g_1, get_root(g_1), mutation_anc_dict_1)
    mutation_anc_dict_2 = {}
    root_2 = get_root(g_2)
    mutation_anc_dict_2[root_2] = {root_2}
    mutation_anc_dict_2 = fill_mutation_anc_dict(g_2, get_root(g_2), mutation_anc_dict_2)
    mutation_set_1 = get_all_mutations(g_1)
    mutation_set_2 = get_all_mutations(g_2)
    full_mutation_set = mutation_set_1.union(mutation_set_2)
    disc_distance = 0
    for mut_1 in full_mutation_set:
        for mut_2 in full_mutation_set:
            disc_1 = get_distinctly_inherited(mut_1, mut_2, mutation_anc_dict_1)
            disc_2 = get_distinctly_inherited(mut_1, mut_2, mutation_anc_dict_2)
            disc_union = disc_1.union(disc_2)
            x = len(disc_union)
            disc_set_minus_1 = disc_1.difference(disc_2)
            disc_set_minus_2 = disc_2.difference(disc_1)
            for set_minus_1_mut in disc_set_minus_1:
                dict_1[get_node_from_mutation(g_1, set_minus_1_mut)]["contribution"] += 1/x
                disc_distance += 1/x
            for set_minus_2_mut in disc_set_minus_2:                
                dict_2[get_node_from_mutation(g_2, set_minus_2_mut)]["contribution"] += 1/x
                disc_distance += 1/x
    return dict_1, dict_2

def get_distinctly_inherited(mutation_1, mutation_2, mutation_anc_dict):
    if(mutation_1 in mutation_anc_dict and mutation_2 in mutation_anc_dict):
        return set(mutation_anc_dict[mutation_1]).difference(set(mutation_anc_dict[mutation_2]))
    else:
        return set()

def fill_node_dict(g, node, node_anc_dict):
    ''' Recursively creates dictionary matching each node
        in g to its ancestor set '''
    for child in g.successors(node):
        child_anc_set = node_anc_dict[node].copy()
        child_anc_set.add(child)
        node_anc_dict[child] = child_anc_set
        node_anc_dict.update(fill_node_dict(g, child, node_anc_dict))
    return node_anc_dict

def fill_mutation_anc_dict(g, node, dict):
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

def get_node_from_mutation(g, mutation):
    for node in g.nodes:
        if mutation in get_mutations_from_node(g, node):
            return node

def get_all_mutations(g):
    mutation_set = set()
    for node in g.nodes:
        mutation_set = mutation_set.union(set(get_mutations_from_node(g, node)))
    return mutation_set

def disc_main(filename_1, filename_2):
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    dict_1, dict_2 = get_contributions(g_1,g_2)
    nx.set_node_attributes(g_1,dict_1)
    nx.set_node_attributes(g_2,dict_2)
    data_1 = json_graph.tree_data(g_1, root=get_root(g_1))
    data_2 = json_graph.tree_data(g_2, root=get_root(g_2))
    return (data_1, data_2)


if __name__=="__main__":
    filename_1 = sys.argv[1]
    filename_2 = sys.argv[2]
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    dict_1, dict_2 = cs.get_contributions(g_1,g_2)
    nx.set_node_attributes(g_1,dict_1)
    nx.set_node_attributes(g_2,dict_2)
    data_1 = json_graph.tree_data(g_1, root=cs.get_root(g_1))
    data_2 = json_graph.tree_data(g_2, root=cs.get_root(g_2))
    s_1 = json.dumps(data_1)
    s_2 = json.dumps(data_2)
    print(s_1)
    print(s_2)
    cs.ancestor_descendant(g_1, g_2)