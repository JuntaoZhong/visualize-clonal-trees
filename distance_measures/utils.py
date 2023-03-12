"""
Utility functions used by CASet, DISC, Parent-child, and Ancestor-descendant distance measure and contributions code
"""
import networkx as nx
import distance_measures.ancestor_descendant as AD
import distance_measures.disc as DISC
import distance_measures.caset as CASet
import distance_measures.parent_child as PC

def initialize_core_dictionaries(g):
    ''' Returns three dictionaries for the tree g initialized to base values: 
    node_contribution_dict, mutation_contribution_dict, node_to_mutation_dict
    '''
    node_contribution_dict = {}
    mutation_contribution_dict = {}
    node_mutations_dict = {}
 
    for node in g.nodes:
        node_contribution_dict[node] = {}
        node_contribution_dict[node]["contribution"] = 0
        mutation_list = get_mutations_from_node(g,node)
        node_mutations_dict[node] = mutation_list
        for mutation in mutation_list:
            mutation_contribution_dict[mutation] = {}
            mutation_contribution_dict[mutation]["contribution"] = 0
    return node_contribution_dict, mutation_contribution_dict, node_mutations_dict


def get_root(g):
    ''' Returns node with in-degree 0. Exits and
        prints error if multiple such nodes exist
    '''
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


def get_mutations_from_node(g, node):
    ''' Returns list of strings representing mutations at node in the tree g '''
    label =  g.nodes[node]['label']
    label_list = label.split(",")
    label_list[0] = label_list[0][1:]
    label_list[len(label_list)-1] = label_list[len(label_list)-1][:len(label_list[len(label_list)-1])-1]
    return [label.translate({ord(i):None for i in ' \"'}) for label in label_list]

def make_mutation_anc_dict(g):
    ''' Returns mutation-to-ancestor-set dictionary for tree g '''
    mutation_anc_dict = {}
    root = get_root(g)
    mutation_anc_dict[root] = {root}
    mutation_anc_dict = fill_mutation_anc_dict(g, root, mutation_anc_dict)
    return mutation_anc_dict

def fill_mutation_anc_dict(g, node, dict):
    ''' Creates dictionary matching each mutation to its
        set of ancestor mutations
    '''
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
        in g to its set of ancestor nodes
    '''
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
    ''' Returns the node in the tree g that mutation is apart of '''
    for node in g.nodes:
        if mutation in get_mutations_from_node(g, node):
            return node

def get_all_mutations(g):
    ''' Returns all mutations in tree g, as set of strings '''
    mutation_set = set()
    for node in g.nodes:
        mutation_set = mutation_set.union(set(get_mutations_from_node(g, node)))
    return mutation_set

def fill_node_dict(g, node, node_anc_dict):
    ''' Recursively creates dictionary matching each node
        in g to its ancestor set 
    '''
    for child in g.successors(node):
        child_anc_set = node_anc_dict[node].copy()
        child_anc_set.add(child)
        node_anc_dict[child] = child_anc_set
        node_anc_dict.update(fill_node_dict(g, child, node_anc_dict))
    return node_anc_dict

def fill_mutation_dict(g, node, dict):
    ''' Creates dictionary matching each mutation in g to
        its ancestor set 
    '''
    node_dict = fill_node_dict(g, node, dict)
    mutation_dict = {}
    for desc in node_dict:
        anc_set = node_dict[desc]
        desc_mutations = get_mutations_from_node(g,desc)
        for desc_mutation in desc_mutations:
            desc_mutation_ancestors = []
            for anc in anc_set:
                anc_mutations = get_mutations_from_node(g,anc)
                desc_mutation_ancestors = desc_mutation_ancestors + anc_mutations
            mutation_dict[desc_mutation] = desc_mutation_ancestors
    return mutation_dict
