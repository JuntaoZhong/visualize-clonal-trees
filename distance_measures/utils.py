"""
Utility functions used by CASet and DISC.
"""
import networkx as nx

def initialize_core_dictionaries(g):
    '''returns three dictionaries for the tree initialized to base values: 
    node_contribution_dict, mutation_contribution_dict, node_to_mutation_dict
    '''
    node_contribution_dict = {}
    mutation_contribution_dict = {}
    node_to_mutation_dict = {}
 
    for node in g.nodes:
        node_contribution_dict[node] = {}
        node_contribution_dict[node]["contribution"] = 0
        mutation_list = get_mutations_from_node(g,node)
        node_to_mutation_dict[node] = mutation_list
        for mutation in mutation_list:
            mutation_contribution_dict[mutation] = {}
            mutation_contribution_dict[mutation]["contribution"] = 0
    return node_contribution_dict, mutation_contribution_dict, node_to_mutation_dict


def get_root(g):
    ''' Returns node with in-degree 0. Exits and
        prints error if multiple such nodes exist '''
    root_candidates = set(g.nodes)
    root_candidates = set([x for x in root_candidates if "\\" not in x])
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

# potentially get rid of this function
def get_mutations_from_label(label):
    ''' Returns list of mutations in a label '''
    label_list = label.split(",")
    label_list[0] = label_list[0][1:]
    label_list[len(label_list)-1] = label_list[len(label_list)-1][:len(label_list[len(label_list)-1])-1]
    return label_list

def get_mutations_from_node(g, node):
    ''' Returns list of strings representing mutations at node'''
    label =  g.nodes[node]['label']
    label_list = label.split(",")
    label_list[0] = label_list[0][1:]
    label_list[len(label_list)-1] = label_list[len(label_list)-1][:len(label_list[len(label_list)-1])-1]
    return label_list

def make_mutation_anc_dict(g):
    mutation_anc_dict = {}
    root = get_root(g)
    mutation_anc_dict[root] = {root}
    mutation_anc_dict = fill_mutation_anc_dict(g, root, mutation_anc_dict)
    return mutation_anc_dict

def fill_mutation_anc_dict(g, node, dict):
    ''' Creates dictionary matching each mutation to its
        set of ancestor mutations '''
    # Fills node-ancestor dictionary
    node_dict = fill_node_anc_dict(g, node, dict)
    mutation_dict = {}
    # Fills mutation-ancestor dictionary 
    for desc in node_dict:
        anc_set = node_dict[desc]
        desc_mutations = get_mutations_from_node(g, desc)
        for desc_mutation in desc_mutations:
            desc_mutation_ancestors = []
            for anc in anc_set:
                anc_mutations = get_mutations_from_node(g, anc)
                desc_mutation_ancestors = desc_mutation_ancestors + anc_mutations
            mutation_dict[desc_mutation] = desc_mutation_ancestors
    return mutation_dict

def fill_node_anc_dict(g, node, node_anc_dict):
    ''' Recursively creates dictionary matching each node
        in g to its set of ancestor nodes'''
    for child in g.successors(node):
        child_anc_set = node_anc_dict[node].copy()
        child_anc_set.add(child)
        node_anc_dict[child] = child_anc_set
        node_anc_dict.update(fill_node_anc_dict(g, child, node_anc_dict))
    return node_anc_dict

# note to self; go back and make this function more efficient by
# storing mutation-node relationship when getting mutations from 
# node
def get_node_from_mutation(g, mutation):
    for node in g.nodes:
        if mutation in get_mutations_from_node(g, node):
            return node

def get_all_mutations(g):
    mutation_set = set()
    for node in g.nodes:
        mutation_set = mutation_set.union(set(get_mutations_from_node(g, node)))
    return mutation_set

