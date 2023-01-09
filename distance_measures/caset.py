import argparse
import pickle
from graphviz import Source
import sys
import networkx as nx

from utils import *

"""
CASet.py calculates pairwise CASet distances between all trees in an input file with 
one Newick string on each line.
Defaults to intersection distance.
Command line arguments:
[-o --outputFile file] [-u --union] [-p --pickle file] [-t --treePrint] [-m --minmax]
"""


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
    caset_distance = 0
    for mut_1 in full_mutation_set:
        for mut_2 in full_mutation_set:
            caset_1 = get_common_ancestor_set(mut_1, mut_2, mutation_anc_dict_1)
            caset_2 = get_common_ancestor_set(mut_1, mut_2, mutation_anc_dict_2)
            caset_union = caset_1.union(caset_2)
            x = len(caset_union)
            # print(caset_union)
            caset_set_minus_1 = caset_1.difference(caset_2)
            caset_set_minus_2 = caset_2.difference(caset_1)
            for set_minus_1_mut in caset_set_minus_1:
                dict_1[get_node_from_mutation(g_1, set_minus_1_mut)]["contribution"] += 1/(2*x)
                caset_distance += 1/(2*x)
            for set_minus_2_mut in caset_set_minus_2:                
                dict_2[get_node_from_mutation(g_2, set_minus_2_mut)]["contribution"] += 1/(2*x)
                caset_distance += 1/(2*x)
    # return caset_distance, dict_1, dict_2
    return dict_1, dict_2

# def jacc(mutation_1, mutation_2, mutation_anc_dict_1, mutation_anc_dict_2):  

def get_common_ancestor_set(mutation_1, mutation_2, mutation_anc_dict):
    if(mutation_1 in mutation_anc_dict and mutation_2 in mutation_anc_dict):
        return set(mutation_anc_dict[mutation_1] + mutation_anc_dict[mutation_2])
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
    #print("label list: " + str(label_list))
    label_list[0] = label_list[0][1:]
    #print("label list now: " + str(label_list))
    label_list[len(label_list)-1] = label_list[len(label_list)-1][:len(label_list[len(label_list)-1])-1]
    #print("and now: " + str(label_list))
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

if __name__=="__main__":
    # filename_1 = sys.argv[1]
    # filename_2 = sys.argv[2]
    filename_1 = "test1.txt"
    filename_2 = "test2.txt"
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    print(get_contributions(g_1,g_2))
    # print('distance: ' + str(caset(g_1, g_2)))


# def get_contributions()

# def caset(mutations, t1_ancestors, t2_ancestors):
#     """
#     Compute the CASet distance between two trees stored as ancestor sets.
#     :param mutations: the set of mutations over which to sum
#     :param t1_ancestors: a dict storing the t1 ancestor sets of every mutation
#     :param t2_ancestors: a dict storing the t2 ancestor sets of every mutation
#     :return: the CASet distance between t1 and t2
#     """
#     m = len(mutations)
#     total = 0
#     for i in range(m):
#         for j in range(i + 1, m):
#             t1_ca_set = t1_ancestors[mutations[i]] & t1_ancestors[mutations[j]]
#             t2_ca_set = t2_ancestors[mutations[i]] & t2_ancestors[mutations[j]]

#             total += jaccard(t1_ca_set, t2_ca_set)

#     return total / (m * (m - 1) / 2)


# def caset_intersection(t1, t2):
#     """
#     Compute the CASet distance between two trees, only summing over pairs of mutations in both trees.
#     :param t1: a Newick string representation of tree 1
#     :param t2: a Newick string representation of tree 2
#     :return: the CASet intersection distance between tree 1 and tree 2
#     """
#     t1_ancestors = ancestor_sets(t1)
#     t2_ancestors = ancestor_sets(t2)
#     intersection = list(set(t1_ancestors.keys()) & set(t2_ancestors.keys()))

#     return caset(intersection, t1_ancestors, t2_ancestors)


# def caset_union(t1, t2):
#     """
#     Compute the CASet distance between two trees, summing over all pairs of mutations.
#     :param t1: a Newick string representation of tree 1
#     :param t2: a Newick string representation of tree 2
#     :return: the CASet union distance between tree 1 and tree 2
#     """
#     t1_ancestors = ancestor_sets(t1)
#     t2_ancestors = ancestor_sets(t2)
#     union = list(set(t1_ancestors.keys()) | set(t2_ancestors.keys()))

#     for u in union:
#         if u not in t1_ancestors:
#             t1_ancestors[u] = set()
#         if u not in t2_ancestors:
#             t2_ancestors[u] = set()

#     return caset(union, t1_ancestors, t2_ancestors)


# if __name__ == '__main__':
#     parser = argparse.ArgumentParser(description='Find pairwise CASet distances of a set of trees.')
#     parser.add_argument('inputFile')
#     parser.add_argument('-o', '--outputFile')
#     parser.add_argument('-u', '--union', action='store_true')
#     parser.add_argument('-p', '--pickle')
#     parser.add_argument('-t', '--treePrint', action='store_true')
#     parser.add_argument('-m', '--minmax', action='store_true')
#     args = parser.parse_args()

#     trees = get_newicks(args.inputFile)

#     if args.treePrint:
#         for i, tree in enumerate(trees):
#             print('Tree {}:\n{}\n'.format(i, tree))

#     distance_measure = caset_union if args.union else caset_intersection
#     distance_matrix = [[None for x in range(len(trees))] for y in range(len(trees))]
#     for i, t1 in enumerate(trees):
#         for j, t2 in enumerate(trees):
#             distance_matrix[i][j] = distance_measure(t1, t2)
#             distance_matrix[j][i] = distance_matrix[i][j]

#     output = get_matrix_string(distance_matrix)

#     if args.minmax:
#         output += get_min_max_string(distance_matrix)

#     if args.pickle:
#         with open(args.pickle, 'wb') as out:
#             pickle.dump(distance_matrix, out, pickle.HIGHEST_PROTOCOL)

#     if args.outputFile:
#         with open(args.outputFile, 'w') as out:
#             out.write(output)
#     else:
#         print(output)
