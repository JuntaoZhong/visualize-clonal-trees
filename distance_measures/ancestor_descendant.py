from graphviz import Source
import sys
import networkx as nx

def ancestor_descendant(g_1, g_2):
    return len(ancestor_descendant_symmetric_difference(g_1, g_2))

def ancestor_descendant_symmetric_difference(g_1,g_2):
    set_1 = get_anc_desc_pairs(g_1)
    set_2 = get_anc_desc_pairs(g_2)
    return set_1.symmetric_difference(set_2)

def get_anc_desc_pairs(g):
    ''' Returns list of 2-tuples whose first element
        is an ancestor in g and whose second element
        is a descendant of the first element '''
    # key = node 
    # value = ancestor set of node
    node_anc_dict = {}
    root = get_root(g)
    node_anc_dict[root] = {root}
    # adds key-value pairs to dictionary
    node_anc_dict = fill_dict(g,root,node_anc_dict)
    # uses node_anc_dict to find ancestor-descendant pairs
    anc_desc_pairs = set()
    for desc in node_anc_dict:
        anc_set = node_anc_dict[desc]
        for anc in anc_set:
            anc_desc_pairs.add((anc, desc))
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
    
def fill_dict(g, node, node_anc_dict):
    ''' Recursively creates dictionary matching each node
        in g to its ancestor set '''
    for child in g.successors(node):
        child_anc_set = node_anc_dict[node].copy()
        child_anc_set.add(child)
        node_anc_dict[child] = child_anc_set
        node_anc_dict.update(fill_dict(g, child, node_anc_dict))
    return node_anc_dict

if __name__=="__main__":
    filename_1 = sys.argv[1]
    filename_2 = sys.argv[2]
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))
    print('distance: ' + str(ancestor_descendant(g_1, g_2)))