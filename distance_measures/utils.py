"""
Utility functions used by CASet and DISC.
"""
import networkx as nx


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
    #print("label list: " + str(label_list))
    label_list[0] = label_list[0][1:]
    #print("label list now: " + str(label_list))
    label_list[len(label_list)-1] = label_list[len(label_list)-1][:len(label_list[len(label_list)-1])-1]
    #print("and now: " + str(label_list))
    return label_list

def get_mutations_from_node(g, node):
    ''' Returns list of strings representing mutations at node'''
    #print(g.nodes[node])
    label =  g.nodes[node]['label']
    label_list = label.split(",")
    label_list[0] = label_list[0][1:]
    label_list[len(label_list)-1] = label_list[len(label_list)-1][:len(label_list[len(label_list)-1])-1]
    return label_list

def make_mutation_anc_dict(g):
    mutation_anc_dict = {}
    root = get_root(g)
    mutation_anc_dict[root] = {root}
    #print("start one", mutation_anc_dict, "first one")
    mutation_anc_dict = fill_mutation_anc_dict(g, root, mutation_anc_dict)
    #print("start two", mutation_anc_dict, "second one")
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

# def jaccard(a, b):
#     """
#     Compute the Jaccard distance between two sets. Note that Jacc({}, {}) = 0.
#     :param a: a set
#     :param b: another set
#     :return: Jacc(a, b)
#     """
#     union = len(a | b)
#     intersection = len(a & b)
#     return (1 - intersection / union) if union > 0 else 0


# def ancestor_sets(newick):
#     """
#     Find the ancestor sets of every mutation in tree represented in Newick format.
#     :param newick: a Newick string representation of a tree
#     :return: a dict of each mutation's set of ancestors
#     """
#     ancestors = dict()
#     _ancestor_sets(newick.replace(' ', ''), ancestors, set())
#     return ancestors


# def _ancestor_sets(newick, ancestors, current_ancestors):
#     """
#     Recursive helper function for ancestor_sets().
#     :param newick: a Newick string representation of a subtree
#     :param ancestors: a pointer to the dict being computed
#     :param current_ancestors: the mutations ancestral to every mutation in the current subtree
#     """
#     last_paren_index = newick.rfind(')')
#     label_string = newick[last_paren_index + 1:]

#     if label_string[0] == '{':
#         labels = set(label_string[1:-1].split(','))
#     else:
#         labels = {label_string}

#     for label in labels:
#         ancestors[label] = labels | current_ancestors

#     if last_paren_index != -1:
#         for subtree_newick in outer_comma_split(newick[1:last_paren_index]):
#             _ancestor_sets(subtree_newick, ancestors, labels | current_ancestors)


# def outer_comma_split(newick):
#     """
#     Split a Newick subtring on commas, ignoring those contained in parentheses and brackets.
#     :param newick: the string to split
#     """
#     chunk_start = 0
#     parens = 0
#     brackets = 0

#     for i, char in enumerate(newick):
#         if char == '(':
#             parens += 1
#         elif char == ')':
#             parens -= 1
#         elif char == '{':
#             brackets += 1
#         elif char == '}':
#             brackets -= 1
#         elif char == ',' and parens == 0 and brackets == 0:
#             yield newick[chunk_start:i]
#             chunk_start = i + 1

#     yield newick[chunk_start:]


# def get_matrix_string(matrix):
#     """
#     Construct a human-readable string displaying a distance matrix.
#     :param matrix: the matrix to display
#     :return: a string displaying the matrix
#     """
#     string = 'tree\t' + '\t'.join(map(str, range(len(matrix)))) + '\n\n'
#     for index, row in enumerate(matrix):
#         string += '{}\t'.format(index) + '\t'.join(str(round(entry, 4)) for entry in row) + '\n'

#     return string


# def get_min_max_string(matrix):
#     """
#     Determine the pairs of trees with min and max distances in a distance matrix and return a string displaying them.
#     :param matrix: a distance matrix
#     :return: a string describing the min- and max-distance tree pairs
#     """
#     n = len(matrix)
#     min_value = float('inf')
#     min_indices = set()
#     max_value = -float('inf')
#     max_indices = set()

#     for row in range(n):
#         for col in range(row + 1, n):
#             entry = matrix[row][col]
#             if entry == min_value:
#                 min_indices.add((row, col))
#             elif entry < min_value:
#                 min_indices = {(row, col)}
#                 min_value = entry

#             if entry == max_value:
#                 max_indices.add((row, col))
#             elif entry > max_value:
#                 max_indices = {(row, col)}
#                 max_value = entry

#     return 'Max distance: {} between tree pairs {}\n' \
#            'Min distance: {} between tree pairs {}'.format(round(max_value, 6), max_indices,
#                                                            round(min_value, 6), min_indices)


# def get_newicks(input_file):
#     """
#     Extract Newick strings from an input file with one tree per line. Treat anything after a # as a comment.
#     :param input_file: the filename from which to grab trees
#     :return: a list of Newick strings extracted from the file
#     """
#     trees = []
#     with open(input_file) as f:
#         for line in f.readlines():
#             line = line.strip().strip(';').strip()
#             if '#' in line:
#                 line = line[:line.index('#')]  # remove everything after a # (comments)
#             if line != '' and not line.isspace():  # only include non-blank lines
#                 trees.append(line)

#     return trees

